-- 04_functions.sql
-- Funciones públicas de la tienda. Son las únicas que pueden escribir o leer
-- pedidos: las tablas no tienen permisos directos para anon/authenticated.
--
-- Ambas funciones son SECURITY DEFINER y fijan search_path para evitar que un
-- usuario malicioso redirija las tablas o funciones a otro esquema.

/* -------------------------------------------------------------------------
 * crear_pedido(datos jsonb)
 * Recibe { cliente, items, cupon, metodo_pago } desde el checkout.
 * - Recalcula precios y valida stock contra la base.
 * - Descuenta stock y crea pedido + items en una sola transacción.
 * - Aplica PLANTA10 (10 %) y envío de 12.000 COP (gratis desde 150.000).
 * - Devuelve el pedido creado, listo para la confirmación.
 * ---------------------------------------------------------------------- */
create or replace function public.crear_pedido(datos jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  cliente jsonb;
  items jsonb;
  elemento jsonb;
  nombre text;
  correo text;
  telefono text;
  direccion text;
  ciudad text;
  cupon text;
  metodo_pago text;
  subtotal integer := 0;
  descuento integer := 0;
  envio integer := 0;
  total integer := 0;
  nuevo_pedido_id bigint;
  numero text;
  creado timestamptz;
  detalle jsonb;
  cantidad_lineas integer;
begin
  if datos is null or jsonb_typeof(datos) <> 'object' then
    raise exception using errcode = 'PED01', message = 'Los datos del pedido no son válidos.';
  end if;

  cliente := datos -> 'cliente';
  items := datos -> 'items';

  if cliente is null or jsonb_typeof(cliente) <> 'object' then
    raise exception using errcode = 'PED01', message = 'Faltan los datos del cliente.';
  end if;

  nombre := btrim(coalesce(cliente ->> 'nombre', ''));
  correo := lower(btrim(coalesce(cliente ->> 'correo', '')));
  telefono := btrim(coalesce(cliente ->> 'telefono', ''));
  direccion := btrim(coalesce(cliente ->> 'direccion', ''));
  ciudad := btrim(coalesce(cliente ->> 'ciudad', ''));

  if nombre = '' then
    raise exception using errcode = 'PED01', message = 'El nombre es obligatorio.';
  elsif length(nombre) < 3 or length(nombre) > 120 then
    raise exception using errcode = 'PED01', message = 'El nombre debe tener entre 3 y 120 caracteres.';
  end if;

  if correo !~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' or length(correo) > 160 then
    raise exception using errcode = 'PED01', message = 'Ingresa un correo electrónico válido.';
  end if;

  if length(regexp_replace(telefono, '[^0-9]', '', 'g')) not between 7 and 15 then
    raise exception using errcode = 'PED01', message = 'El teléfono debe tener entre 7 y 15 dígitos.';
  end if;

  if length(direccion) < 5 or length(direccion) > 200 then
    raise exception using errcode = 'PED01', message = 'La dirección debe tener entre 5 y 200 caracteres.';
  end if;

  if length(ciudad) < 2 or length(ciudad) > 80 then
    raise exception using errcode = 'PED01', message = 'Ingresa una ciudad válida.';
  end if;

  if items is null or jsonb_typeof(items) <> 'array' then
    raise exception using errcode = 'PED01', message = 'El pedido debe incluir al menos un producto.';
  end if;

  if jsonb_array_length(items) = 0 or jsonb_array_length(items) > 30 then
    raise exception using errcode = 'PED01', message = 'El pedido debe tener entre 1 y 30 productos distintos.';
  end if;

  drop table if exists _lineas_pedido;

  create temporary table _lineas_pedido (
    producto_id bigint primary key,
    cantidad integer not null
  ) on commit drop;

  for elemento in select valor from jsonb_array_elements(items) as t(valor)
  loop
    if jsonb_typeof(elemento) <> 'object'
       or jsonb_typeof(elemento -> 'producto_id') <> 'number'
       or jsonb_typeof(elemento -> 'cantidad') <> 'number'
       or (elemento ->> 'producto_id') !~ '^[0-9]+$'
       or (elemento ->> 'cantidad') !~ '^[0-9]+$' then
      raise exception using errcode = 'PED01', message = 'Cada item debe tener un producto y una cantidad válidos.';
    end if;

    insert into _lineas_pedido (producto_id, cantidad)
    values ((elemento ->> 'producto_id')::bigint, (elemento ->> 'cantidad')::integer)
    on conflict (producto_id) do update
      set cantidad = _lineas_pedido.cantidad + excluded.cantidad;
  end loop;

  if exists (select 1 from _lineas_pedido where producto_id <= 0 or cantidad <= 0) then
    raise exception using errcode = 'PED01', message = 'Las cantidades deben ser enteros positivos.';
  end if;

  if exists (select 1 from _lineas_pedido where cantidad > 99) then
    raise exception using errcode = 'PED01', message = 'La cantidad por producto no puede superar 99 unidades.';
  end if;

  select count(*) into cantidad_lineas from _lineas_pedido;
  if cantidad_lineas = 0 then
    raise exception using errcode = 'PED01', message = 'El pedido debe incluir al menos un producto.';
  end if;

  -- Bloquea los productos para que dos compras simultáneas no vendan el mismo stock.
  perform 1
    from public.productos p
   where p.id in (select producto_id from _lineas_pedido)
     for update;

  select jsonb_agg(l.producto_id order by l.producto_id)
    into detalle
    from _lineas_pedido l
    left join public.productos p on p.id = l.producto_id
   where p.id is null;

  if detalle is not null then
    raise exception using errcode = 'PED02',
      message = 'Uno o más productos ya no están disponibles.',
      detail = detalle::text;
  end if;

  select jsonb_agg(
           jsonb_build_object(
             'producto_id', l.producto_id,
             'nombre', p.nombre,
             'solicitado', l.cantidad,
             'disponible', p.stock
           )
           order by l.producto_id
         )
    into detalle
    from _lineas_pedido l
    join public.productos p on p.id = l.producto_id
   where l.cantidad > p.stock;

  if detalle is not null then
    raise exception using errcode = 'PED03',
      message = 'No hay stock suficiente para uno o más productos.',
      detail = detalle::text;
  end if;

  -- El precio siempre sale de la base, nunca del navegador.
  select coalesce(sum(p.precio * l.cantidad), 0)::integer
    into subtotal
    from _lineas_pedido l
    join public.productos p on p.id = l.producto_id;

  cupon := nullif(upper(btrim(coalesce(datos ->> 'cupon', ''))), '');

  if cupon is not null and cupon <> 'PLANTA10' then
    raise exception using errcode = 'PED04', message = 'El cupón ingresado no es válido.';
  end if;

  if cupon = 'PLANTA10' then
    descuento := round(subtotal * 0.10)::integer;
  end if;

  -- Desde 150.000 COP el envío es gratis; de lo contrario cuesta 12.000 COP.
  if subtotal >= 150000 then
    envio := 0;
  else
    envio := 12000;
  end if;

  total := greatest(0, subtotal - descuento + envio);

  metodo_pago := coalesce(nullif(btrim(datos ->> 'metodo_pago'), ''), 'tarjeta_simulada');
  if metodo_pago <> 'tarjeta_simulada' then
    raise exception using errcode = 'PED01', message = 'Método de pago no soportado.';
  end if;

  -- Número aleatorio difícil de adivinar. Se repite si ya existe.
  loop
    numero := 'PED-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
    exit when not exists (select 1 from public.pedidos where numero_pedido = numero);
  end loop;

  insert into public.pedidos (
    numero_pedido,
    nombre_cliente,
    correo,
    telefono,
    direccion,
    ciudad,
    metodo_pago,
    subtotal,
    descuento,
    envio,
    cupon,
    total,
    estado
  ) values (
    numero,
    nombre,
    correo,
    telefono,
    direccion,
    ciudad,
    metodo_pago,
    subtotal,
    descuento,
    envio,
    cupon,
    total,
    'confirmado'
  )
  returning id, creado_en into nuevo_pedido_id, creado;

  insert into public.pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
  select nuevo_pedido_id, l.producto_id, l.cantidad, p.precio
    from _lineas_pedido l
    join public.productos p on p.id = l.producto_id;

  update public.productos p
     set stock = p.stock - l.cantidad
    from _lineas_pedido l
   where p.id = l.producto_id;

  return jsonb_build_object(
    'numero_pedido', numero,
    'estado', 'confirmado',
    'creado_en', creado,
    'subtotal', subtotal,
    'descuento', descuento,
    'envio', envio,
    'cupon', cupon,
    'total', total,
    'metodo_pago', metodo_pago,
    'cliente', jsonb_build_object(
      'nombre', nombre,
      'correo', correo,
      'telefono', telefono,
      'direccion', direccion,
      'ciudad', ciudad
    ),
    'items', coalesce(
      (
        select jsonb_agg(
                 jsonb_build_object(
                   'producto_id', pi.producto_id,
                   'nombre', p.nombre,
                   'imagen_url', p.imagen_url,
                   'cantidad', pi.cantidad,
                   'precio_unitario', pi.precio_unitario,
                   'subtotal', pi.precio_unitario * pi.cantidad
                 )
                 order by pi.id
               )
          from public.pedido_items pi
          join public.productos p on p.id = pi.producto_id
         where pi.pedido_id = nuevo_pedido_id
      ),
      '[]'::jsonb
    )
  );
end;
$$;

comment on function public.crear_pedido(jsonb)
  is 'Crea un pedido validando precios, stock y cupón en el servidor.';


/* -------------------------------------------------------------------------
 * obtener_pedido(numero text, correo text)
 * Devuelve el pedido y sus items solo si el número y el correo coinciden.
 * ---------------------------------------------------------------------- */
create or replace function public.obtener_pedido(numero text, correo text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  pedido public.pedidos%rowtype;
  numero_limpio text;
  correo_limpio text;
begin
  numero_limpio := upper(btrim(coalesce(numero, '')));
  correo_limpio := lower(btrim(coalesce(correo, '')));

  if numero_limpio !~ '^PED-[A-F0-9]{6,20}$' then
    raise exception using errcode = 'PED05', message = 'El número de pedido no es válido.';
  end if;

  if correo_limpio !~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' then
    raise exception using errcode = 'PED05', message = 'Ingresa el correo con el que hiciste el pedido.';
  end if;

  select p.*
    into pedido
    from public.pedidos p
   where p.numero_pedido = numero_limpio
     and lower(p.correo) = correo_limpio;

  if not found then
    raise exception using errcode = 'PED06',
      message = 'No encontramos un pedido con ese número y correo.';
  end if;

  return jsonb_build_object(
    'numero_pedido', pedido.numero_pedido,
    'estado', pedido.estado,
    'creado_en', pedido.creado_en,
    'subtotal', pedido.subtotal,
    'descuento', pedido.descuento,
    'envio', pedido.envio,
    'cupon', pedido.cupon,
    'total', pedido.total,
    'metodo_pago', pedido.metodo_pago,
    'cliente', jsonb_build_object(
      'nombre', pedido.nombre_cliente,
      'correo', pedido.correo,
      'telefono', pedido.telefono,
      'direccion', pedido.direccion,
      'ciudad', pedido.ciudad
    ),
    'items', coalesce(
      (
        select jsonb_agg(
                 jsonb_build_object(
                   'producto_id', pi.producto_id,
                   'nombre', p.nombre,
                   'imagen_url', p.imagen_url,
                   'cantidad', pi.cantidad,
                   'precio_unitario', pi.precio_unitario,
                   'subtotal', pi.precio_unitario * pi.cantidad
                 )
                 order by pi.id
               )
          from public.pedido_items pi
          join public.productos p on p.id = pi.producto_id
         where pi.pedido_id = pedido.id
      ),
      '[]'::jsonb
    )
  );
end;
$$;

comment on function public.obtener_pedido(text, text)
  is 'Consulta un pedido por número y correo, sin exponer pedidos ajenos.';


-- Solo el navegador (anon) y los usuarios autenticados pueden ejecutar las RPC.
revoke all on function public.crear_pedido(jsonb) from public;
revoke all on function public.obtener_pedido(text, text) from public;

grant execute on function public.crear_pedido(jsonb) to anon, authenticated;
grant execute on function public.obtener_pedido(text, text) to anon, authenticated;
