-- 03_policies.sql
-- Seguridad a nivel de fila (RLS) y permisos explícitos.
-- Ejecuta este archivo después de 02_seed.sql.
--
-- Regla general:
--   * categorias y productos: solo lectura pública.
--   * pedidos y pedido_items: sin acceso directo desde el navegador.
--     Se crean y consultan únicamente con las funciones de 04_functions.sql.

alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;

-- Quita políticas antiguas para que una reejecución no deje permisos abiertos.
do $$
declare
  politica record;
begin
  for politica in
    select schemaname, tablename, policyname
      from pg_policies
     where schemaname = 'public'
       and tablename in ('categorias', 'productos', 'pedidos', 'pedido_items')
  loop
    execute format(
      'drop policy %I on %I.%I',
      politica.policyname,
      politica.schemaname,
      politica.tablename
    );
  end loop;
end
$$;

-- Permisos base del esquema.
grant usage on schema public to anon, authenticated;

-- Catálogo: lectura pública.
revoke all on table public.categorias from anon, authenticated;
revoke all on table public.productos from anon, authenticated;

grant select on table public.categorias to anon, authenticated;
grant select on table public.productos to anon, authenticated;

create policy "categorias_lectura_publica"
  on public.categorias
  for select
  to anon, authenticated
  using (true);

create policy "productos_lectura_publica"
  on public.productos
  for select
  to anon, authenticated
  using (true);

-- Pedidos: sin privilegios directos. Las funciones SECURITY DEFINER son las
-- únicas que pueden escribir y leer estas tablas.
revoke all on table public.pedidos from anon, authenticated;
revoke all on table public.pedido_items from anon, authenticated;

-- Las secuencias tampoco se exponen: los inserts ocurren dentro de las RPC.
revoke all on sequence public.categorias_id_seq from anon, authenticated;
revoke all on sequence public.productos_id_seq from anon, authenticated;
revoke all on sequence public.pedidos_id_seq from anon, authenticated;
revoke all on sequence public.pedido_items_id_seq from anon, authenticated;
