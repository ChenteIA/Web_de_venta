-- =====================================================================
-- San Luyo · Esquema completo para Supabase
-- Pégalo entero en Supabase → SQL Editor → New query → Run.
-- Se puede ejecutar más de una vez sin romper nada.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Administradores
--    Solo los usuarios que estén en esta tabla son "admin".
--    Nadie puede leerla ni escribirla desde la web (RLS sin políticas);
--    se llena desde el SQL Editor (ver README).
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Fecha de hoy en Lima (para valores por defecto)
create or replace function public.lima_today()
returns date
language sql
stable
set search_path = ''
as $$ select (now() at time zone 'America/Lima')::date $$;

-- ---------------------------------------------------------------------
-- 2. Clics a WhatsApp
-- ---------------------------------------------------------------------
create table if not exists public.clicks (
  id      uuid primary key default gen_random_uuid(),
  product text not null check (product ~ '^[a-z0-9-]{1,40}$'),
  place   text not null check (place in ('portada', 'carta', 'flotante')),
  ts      timestamptz not null default now(),
  day     date not null,
  hour    smallint not null check (hour between 0 and 23),
  sold    boolean not null default false,
  demo    boolean not null default false
);
create index if not exists clicks_ts_idx  on public.clicks (ts desc);
create index if not exists clicks_day_idx on public.clicks (day);

-- Fecha, día y hora siempre calculados en America/Lima.
-- Si quien inserta no es admin (la web pública), la hora la pone el servidor
-- y no puede marcar el clic como vendido ni como dato de ejemplo.
create or replace function public.clicks_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and not public.is_admin() then
    new.ts   := now();
    new.sold := false;
    new.demo := false;
  end if;
  new.day  := (new.ts at time zone 'America/Lima')::date;
  new.hour := extract(hour from (new.ts at time zone 'America/Lima'))::smallint;
  return new;
end;
$$;
drop trigger if exists clicks_before_write on public.clicks;
create trigger clicks_before_write
  before insert or update of ts on public.clicks
  for each row execute function public.clicks_before_write();

-- ---------------------------------------------------------------------
-- 3. Ventas
-- ---------------------------------------------------------------------
create table if not exists public.sales (
  id       uuid primary key default gen_random_uuid(),
  product  text not null check (char_length(product) between 1 and 60),
  qty      integer not null default 1 check (qty > 0),
  amount   numeric(10, 2) not null check (amount >= 0),
  day      date not null default public.lima_today(),
  click_id uuid null references public.clicks (id) on delete set null,
  ts       timestamptz not null default now(),
  demo     boolean not null default false
);
create index if not exists sales_day_idx on public.sales (day);
create index if not exists sales_ts_idx  on public.sales (ts desc);
-- Un clic solo puede convertirse en una venta
create unique index if not exists sales_click_unique on public.sales (click_id) where click_id is not null;

-- Mantiene clicks.sold sincronizado al registrar, cambiar o eliminar ventas
create or replace function public.sales_sync_click()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') and old.click_id is not null then
    update public.clicks c
       set sold = exists (select 1 from public.sales s where s.click_id = old.click_id)
     where c.id = old.click_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') and new.click_id is not null then
    update public.clicks c set sold = true where c.id = new.click_id;
  end if;
  return null;
end;
$$;
drop trigger if exists sales_sync_click on public.sales;
create trigger sales_sync_click
  after insert or update of click_id or delete on public.sales
  for each row execute function public.sales_sync_click();

-- ---------------------------------------------------------------------
-- 4. Reseñas (capturas de WhatsApp)
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  image_path text not null unique,
  customer   text check (customer is null or char_length(customer) <= 40),
  product    text check (product is null or char_length(product) <= 40),
  day        date not null default public.lima_today(),
  ts         timestamptz not null default now(),
  visible    boolean not null default true
);
create index if not exists reviews_ts_idx on public.reviews (ts desc);

-- ---------------------------------------------------------------------
-- 4b. Productos (los edita el admin desde el panel; la web muestra los visibles)
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id          text primary key check (id ~ '^[a-z0-9-]{1,40}$' and id <> 'general' and id <> 'otro'),
  name        text not null check (char_length(name) between 1 and 60),
  price       numeric(10, 2) not null check (price > 0 and price < 100000),
  unit        text not null default '' check (char_length(unit) <= 40),
  description text not null default '' check (char_length(description) <= 240),
  photo_path  text null check (photo_path is null or char_length(photo_path) <= 120),
  active      boolean not null default true,
  sort        integer not null default 0,
  updated_at  timestamptz not null default now()
);
create index if not exists products_sort_idx on public.products (sort, name);

create or replace function public.products_touch()
returns trigger
language plpgsql
set search_path = ''
as $$ begin new.updated_at := now(); return new; end; $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch
  before update on public.products
  for each row execute function public.products_touch();

-- Productos iniciales (solo si la tabla está vacía)
insert into public.products (id, name, price, unit, description, sort)
select * from (values
  ('chicha-mani', 'Chicha de maní', 3::numeric, 'botella de 500 ml',
   'Hecha en casa con maní tostado. Cremosa, dulce en su punto y para tomarla bien helada.', 0),
  ('chicha-mani-litro', 'Chicha de maní', 6::numeric, 'botella de 1 litro',
   'La misma receta en botella grande: para compartir en la mesa o tenerla lista en la refri.', 1)
) as v(id, name, price, unit, description, sort)
where not exists (select 1 from public.products);

-- ---------------------------------------------------------------------
-- 5. Permisos de tabla + RLS
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant insert                         on public.clicks  to anon, authenticated;
grant select, update, delete         on public.clicks  to authenticated;
grant select, insert, update, delete on public.sales   to authenticated;
grant select                         on public.reviews to anon, authenticated;
grant insert, update, delete         on public.reviews to authenticated;
grant select                         on public.products to anon, authenticated;
grant insert, update, delete         on public.products to authenticated;

alter table public.clicks  enable row level security;
alter table public.sales   enable row level security;
alter table public.reviews enable row level security;
alter table public.products enable row level security;

-- clicks: cualquiera inserta; solo el admin lee, actualiza y borra
drop policy if exists "clicks_insert_public" on public.clicks;
create policy "clicks_insert_public" on public.clicks
  for insert to anon, authenticated
  with check (sold = false and demo = false);

drop policy if exists "clicks_insert_admin" on public.clicks;
create policy "clicks_insert_admin" on public.clicks
  for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "clicks_select_admin" on public.clicks;
create policy "clicks_select_admin" on public.clicks
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "clicks_update_admin" on public.clicks;
create policy "clicks_update_admin" on public.clicks
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "clicks_delete_admin" on public.clicks;
create policy "clicks_delete_admin" on public.clicks
  for delete to authenticated
  using ((select public.is_admin()));

-- sales: solo el admin
drop policy if exists "sales_all_admin" on public.sales;
create policy "sales_all_admin" on public.sales
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- reviews: todos leen las visibles; el admin lee todas y es el único que escribe
drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select" on public.reviews
  for select to anon, authenticated
  using (visible or (select public.is_admin()));

drop policy if exists "reviews_insert_admin" on public.reviews;
create policy "reviews_insert_admin" on public.reviews
  for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "reviews_update_admin" on public.reviews;
create policy "reviews_update_admin" on public.reviews
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "reviews_delete_admin" on public.reviews;
create policy "reviews_delete_admin" on public.reviews
  for delete to authenticated
  using ((select public.is_admin()));

-- products: todos leen los visibles; el admin lee todos y es el único que escribe
drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products
  for select to anon, authenticated
  using (active or (select public.is_admin()));

drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin" on public.products
  for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin" on public.products
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin" on public.products
  for delete to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- 6. Storage: bucket privado "reviews"
--    Público solo puede ver las imágenes de reseñas visibles.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reviews', 'reviews', false, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "reviews_files_read" on storage.objects;
create policy "reviews_files_read" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'reviews'
    and (
      (select public.is_admin())
      or exists (select 1 from public.reviews r where r.image_path = storage.objects.name and r.visible)
    )
  );

drop policy if exists "reviews_files_insert_admin" on storage.objects;
create policy "reviews_files_insert_admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'reviews' and (select public.is_admin()));

drop policy if exists "reviews_files_update_admin" on storage.objects;
create policy "reviews_files_update_admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'reviews' and (select public.is_admin()))
  with check (bucket_id = 'reviews' and (select public.is_admin()));

drop policy if exists "reviews_files_delete_admin" on storage.objects;
create policy "reviews_files_delete_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'reviews' and (select public.is_admin()));

-- ---------------------------------------------------------------------
-- 7. Storage: bucket público "productos" (fotos de los productos)
--    Cualquiera puede ver las fotos; solo el admin sube, cambia o borra.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Las fotos se sirven por URL pública; esta política deja además listar y borrar archivos
-- (Supabase pide permiso de lectura para poder eliminar).
drop policy if exists "productos_files_read" on storage.objects;
create policy "productos_files_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'productos');

drop policy if exists "productos_files_insert_admin" on storage.objects;
create policy "productos_files_insert_admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'productos' and (select public.is_admin()));

drop policy if exists "productos_files_update_admin" on storage.objects;
create policy "productos_files_update_admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'productos' and (select public.is_admin()))
  with check (bucket_id = 'productos' and (select public.is_admin()));

drop policy if exists "productos_files_delete_admin" on storage.objects;
create policy "productos_files_delete_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'productos' and (select public.is_admin()));

-- ---------------------------------------------------------------------
-- 8. Invitaciones: enlaces de un solo uso para dar acceso al panel
--    Un admin crea el enlace desde el panel (pestaña Accesos) y lo envía.
--    Quien lo abre crea su usuario y queda como admin. El enlace sirve
--    una sola vez y vence a los 7 días.
--    Para que funcione, en Supabase → Authentication → Sign In / Providers
--    → Email, deja ACTIVADO "Allow new users to sign up": el trigger de
--    abajo rechaza cualquier registro que no traiga una invitación válida.
-- ---------------------------------------------------------------------
create table if not exists public.invites (
  id          uuid primary key default gen_random_uuid(),
  token       text not null unique,
  note        text check (note is null or char_length(note) <= 60),
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '7 days',
  used_at     timestamptz,
  used_by     uuid references auth.users (id) on delete set null
);
-- Sin permisos ni políticas: solo se usa a través de las funciones de abajo.
alter table public.invites enable row level security;
revoke all on public.invites from anon, authenticated;

-- Crear una invitación (solo admins). Devuelve el código del enlace.
create or replace function public.create_invite(p_note text default null)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare t text;
begin
  if not public.is_admin() then raise exception 'solo_admin' using errcode = '42501'; end if;
  t := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into public.invites (token, note, created_by)
  values (t, nullif(left(trim(coalesce(p_note, '')), 60), ''), auth.uid());
  return t;
end;
$$;

-- Estado de un enlace, para la página de registro (no revela nada más).
create or replace function public.invite_status(p_token text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select case when i.used_at is not null then 'usada'
                when i.expires_at < now() then 'vencida'
                else 'ok' end
    from public.invites i where i.token = p_token
  ), 'invalida');
$$;

-- Lista de personas con acceso e invitaciones (solo admins).
create or replace function public.list_access()
returns table (kind text, id uuid, label text, created_at timestamptz, expires_at timestamptz, used_at timestamptz, used_email text, is_self boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'solo_admin' using errcode = '42501'; end if;
  return query
    select 'admin'::text, a.user_id, u.email::text, a.created_at, null::timestamptz, null::timestamptz, null::text, a.user_id = auth.uid()
    from public.admins a join auth.users u on u.id = a.user_id
    union all
    select 'invite'::text, i.id, i.note, i.created_at, i.expires_at, i.used_at, uu.email::text, false
    from public.invites i left join auth.users uu on uu.id = i.used_by
    order by 1, 4 desc;
end;
$$;

-- Anular una invitación que aún no se usó (solo admins).
create or replace function public.revoke_invite(p_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'solo_admin' using errcode = '42501'; end if;
  delete from public.invites where id = p_id and used_at is null;
end;
$$;

-- Quitar el acceso a otra persona (solo admins; no a uno mismo).
create or replace function public.remove_admin(p_user uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'solo_admin' using errcode = '42501'; end if;
  if p_user = auth.uid() then raise exception 'no_a_ti_mismo' using errcode = '42501'; end if;
  delete from public.admins where user_id = p_user;
end;
$$;

revoke all on function public.create_invite(text)  from public;
revoke all on function public.invite_status(text)  from public;
revoke all on function public.list_access()        from public;
revoke all on function public.revoke_invite(uuid)  from public;
revoke all on function public.remove_admin(uuid)   from public;
grant execute on function public.create_invite(text) to authenticated;
grant execute on function public.invite_status(text) to anon, authenticated;
grant execute on function public.list_access()       to authenticated;
grant execute on function public.revoke_invite(uuid) to authenticated;
grant execute on function public.remove_admin(uuid)  to authenticated;

-- Cada usuario nuevo necesita una invitación válida; si la trae, la gasta y queda como admin.
-- Si no, el registro se rechaza (Supabase responde "Database error saving new user").
create or replace function public.handle_invited_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare inv public.invites%rowtype;
begin
  select * into inv from public.invites
   where token = coalesce(new.raw_user_meta_data ->> 'invite', '')
     and used_at is null and expires_at > now()
   for update;
  if not found then
    -- Instalación nueva: mientras no haya ningún admin se deja crear el primer usuario
    -- (desde Authentication → Users); luego se le da acceso con el insert del README.
    if not exists (select 1 from public.admins) then return new; end if;
    raise exception 'Se necesita una invitación válida para crear una cuenta' using errcode = '42501';
  end if;
  update public.invites set used_at = now(), used_by = new.id where id = inv.id;
  insert into public.admins (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;
revoke all on function public.handle_invited_signup() from public, anon, authenticated;

drop trigger if exists on_auth_user_invited on auth.users;
create trigger on_auth_user_invited
  after insert on auth.users
  for each row execute function public.handle_invited_signup();
