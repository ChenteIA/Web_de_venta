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
-- 5. Permisos de tabla + RLS
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant insert                         on public.clicks  to anon, authenticated;
grant select, update, delete         on public.clicks  to authenticated;
grant select, insert, update, delete on public.sales   to authenticated;
grant select                         on public.reviews to anon, authenticated;
grant insert, update, delete         on public.reviews to authenticated;

alter table public.clicks  enable row level security;
alter table public.sales   enable row level security;
alter table public.reviews enable row level security;

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
