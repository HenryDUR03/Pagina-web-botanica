# Raíz & Hoja · Tienda de plantas

Tienda en línea de semillas, plantas de interior, materas y abono. El frontend es **HTML + JavaScript vanilla con Tailwind CSS por CDN** y no necesita build ni Node para funcionar.

La tienda tiene dos modos de datos, y el mismo código sirve para ambos:

| Modo | Cuándo se activa | Catálogo | Pedidos |
|------|------------------|----------|---------|
| **Local** | `js/config.js` tiene las credenciales vacías | `js/productos.js` | `localStorage` del navegador |
| **Supabase** | `js/config.js` tiene URL y publishable key | Tablas de Supabase | RPC `crear_pedido` / `obtener_pedido` |

El modo activo aparece en el footer como **“Modo local”** o **“Modo Supabase”**, y también se registra en la consola.

El pago es **simulado**: los datos de tarjeta se validan solo en el navegador y nunca se envían ni se guardan. No hay login ni panel de administrador.

## Vista rápida

- Catálogo con búsqueda, filtros por categoría, orden por precio, paginación con **Cargar más** y skeletons.
- Detalle de producto con stock, favoritos, relacionados y ficha de cuidados (luz, riego y tamaño).
- Carrito con revalidación de precios y stock, cupón `PLANTA10` (10 %) y envío gratis desde `$150.000` COP.
- Checkout con validación accesible y pago simulado; confirmación con número de pedido.
- Seguimiento con número de pedido **y correo**.
- Favoritos, modo oscuro, página 404 personalizada, botón flotante de WhatsApp.
- Páginas **Sobre nosotros** y **Contacto** (formulario simulado).

## Estructura

```text
.
├── database/
│   ├── 01_schema.sql          # tablas, índices y restricciones
│   ├── 02_seed.sql            # 4 categorías y 20 productos
│   ├── 03_policies.sql        # RLS, GRANT y REVOKE
│   └── 04_functions.sql       # RPC crear_pedido y obtener_pedido
├── js/
│   ├── config.js              # credenciales, envío, cupón y WhatsApp
│   ├── api.js                 # único punto de acceso a datos (Supabase o local)
│   ├── productos.js           # catálogo del modo local
│   ├── ui.js                  # tarjetas, skeletons, toasts e iconos
│   ├── common.js              # navbar, footer, tema y WhatsApp
│   ├── favoritos.js           # favoritos en localStorage
│   ├── carrito.js             # carrito, cupón y totales
│   ├── catalogo.js            # index.html
│   ├── producto.js            # producto.html
│   ├── carrito-pagina.js      # carrito.html
│   ├── checkout.js            # checkout.html
│   ├── confirmacion.js        # confirmacion.html
│   ├── seguimiento.js         # seguimiento.html
│   ├── favoritos-pagina.js    # favoritos.html
│   └── contacto.js            # contacto.html
├── assets/
│   ├── favicon.svg
│   └── placeholder-planta.svg
├── index.html                 # catálogo y portada
├── producto.html
├── carrito.html
├── checkout.html
├── confirmacion.html
├── seguimiento.html
├── favoritos.html
├── sobre-nosotros.html
├── contacto.html
└── 404.html
```

## 1. Usar la tienda en modo local

No hace falta configurar nada ni instalar dependencias.

1. Abre `index.html` con doble clic o sirve la carpeta con cualquier servidor estático.
2. El catálogo sale de `js/productos.js` (20 productos y 4 categorías).
3. Los pedidos y el stock ajustado se guardan en `localStorage` con las claves de `js/config.js`.
4. El footer muestra **“Modo local”**.

Para reiniciar los datos de prueba, borra las claves `tienda_*` desde las herramientas de desarrollo del navegador (Application → Local Storage).

> Para probar el modo Supabase se recomienda servir la carpeta por HTTP (por ejemplo, `python -m http.server 5500`) y no abrirla con `file://`.

## 2. Activar Supabase

### 2.1 Crear el proyecto

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto nuevo.
2. Guarda la **Project URL** y la **publishable key** (Settings → API). La publishable key es pública por diseño.
3. **Nunca** uses en el frontend la `service_role` ni una secret key.

### 2.2 Ejecutar el SQL en orden

En el **SQL Editor** de Supabase, ejecuta los archivos uno por uno:

1. `database/01_schema.sql` — crea `categorias`, `productos`, `pedidos` y `pedido_items`.
2. `database/02_seed.sql` — carga 4 categorías y 20 productos (incluye uno agotado y 7 fichas de cuidados).
3. `database/03_policies.sql` — activa RLS y deja el catálogo en solo lectura pública.
4. `database/04_functions.sql` — crea las funciones `crear_pedido` y `obtener_pedido`.

Los scripts son idempotentes: puedes volver a ejecutarlos. Ojo: `02_seed.sql` restablece el stock a los valores iniciales.

### 2.3 Configurar el frontend

Edita `js/config.js` y completa:

```js
SUPABASE_URL: 'https://tu-proyecto.supabase.co',
SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_...',
```

Al recargar, la tienda muestra **“Modo Supabase”** en el footer. Si falta una de las dos cadenas, sigue en modo local.

### 2.4 Qué permite el esquema

- `categorias` y `productos`: `SELECT` público, sin escritura desde el navegador.
- `pedidos` y `pedido_items`: **sin permisos directos** para `anon` ni `authenticated`.
- `crear_pedido(datos jsonb)`: valida los datos, recalcula precios desde la base, verifica y descuenta stock en una transacción, aplica el cupón y el envío, y devuelve el pedido creado.
- `obtener_pedido(numero text, correo text)`: devuelve el pedido y sus items solo si el número y el correo coinciden.

Ambas funciones son `SECURITY DEFINER`, fijan `search_path = public, pg_temp` y solo pueden ejecutarlas `anon` y `authenticated`.

## 3. Desplegar en Vercel

El proyecto es un sitio estático: no necesita build ni funciones serverless.

1. Sube el repositorio a GitHub.
2. En Vercel, importa el repositorio.
3. Framework preset: **Other**. Build command: vacío. Output directory: `.` (raíz).
4. Deploy.

Si usas la CLI:

```bash
npx vercel --prod
```

Recuerda que `js/config.js` se publica con el sitio. Eso es correcto para la publishable key; nunca pongas ahí la secret key.

## 4. Reglas de negocio

- Precios en pesos colombianos (COP), enteros y sin centavos.
- Envío: `$12.000` COP; gratis desde `$150.000` COP de subtotal.
- Cupón `PLANTA10`: 10 % de descuento sobre el subtotal.
- Los precios y el stock **siempre** se recalculan en la capa de datos; el navegador solo envía `producto_id` y `cantidad`.
- Los items repetidos se fusionan y cada cantidad debe ser un entero entre 1 y 99.
- Si falta stock, el pedido no se crea y se informa qué producto quedó corto.
- El número de pedido usa 12 caracteres hexadecimales aleatorios (`PED-XXXXXXXXXXXX`); el seguimiento exige también el correo.
- Cualquier intento de enviar datos de tarjeta se rechaza.

## 5. Probar el flujo completo

1. Abre la tienda y filtra por categoría, busca “monstera”, ordena por precio y usa **Cargar más**.
2. Entra al detalle de una planta, revisa su ficha de cuidados y agrégala al carrito.
3. En el carrito, aplica `PLANTA10` y observa descuento, envío y barra de progreso.
4. Ve a pagar, completa los datos de envío y usa una tarjeta inventada (por ejemplo `4111 1111 1111 1111`, `12/30`, `123`). Nada de eso se envía.
5. Confirma la compra: verás el número `PED-...` y el resumen real.
6. Abre **Mi pedido**, escribe el número y el correo de la compra.
7. Prueba errores: número inválido, número inexistente, correo incorrecto y el producto agotado (Cactus San Pedro).
8. Prueba favoritos, modo oscuro, WhatsApp, `404.html`, la página **Nosotros** y el formulario de **Contacto**.

En modo Supabase, para cambiar el estado de un pedido de prueba:

```sql
update public.pedidos
   set estado = 'enviado'
 where numero_pedido = 'PED-XXXXXXXXXXXX';
```

## 6. Notas y limitaciones

- El pago es simulado: no hay pasarela ni cobro real.
- No hay autenticación ni panel de administrador.
- Las imágenes son URLs de Unsplash; si fallan, se usa `assets/placeholder-planta.svg`.
- El formulario de contacto no envía datos: solo valida en el navegador y muestra una confirmación.
- Cambia el número de WhatsApp en un solo lugar: `TIENDA_CONFIG.WHATSAPP` en `js/config.js`.
- En modo local, los pedidos solo existen en el navegador donde se crearon.
