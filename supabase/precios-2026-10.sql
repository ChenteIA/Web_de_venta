-- San Luyo · precios de lanzamiento (octubre 2026)
-- Botella de medio litro a S/ 3 y botella de 1 litro a S/ 6.
-- Pégalo en Supabase → SQL Editor → New query → Run. Se puede ejecutar más de una vez.
update public.products
   set price = 3, unit = 'botella de 500 ml', sort = 0, active = true
 where id = 'chicha-mani';

insert into public.products (id, name, price, unit, description, sort, active)
values ('chicha-mani-litro', 'Chicha de maní', 6, 'botella de 1 litro',
        'La misma receta en botella grande: para compartir en la mesa o tenerla lista en la refri.', 1, true)
on conflict (id) do update
  set price = excluded.price, unit = excluded.unit, active = true;

select id, name, price, unit, active from public.products order by sort, name;
