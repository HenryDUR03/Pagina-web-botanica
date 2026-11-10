# Raíz & Hoja · Tienda de plantas

Tienda en línea de semillas, plantas, materas y abono. El frontend sigue siendo HTML + JavaScript vanilla con Tailwind CSS por CDN, pero ahora tiene **backend real**: funciones serverless de Vercel y una base de datos Postgres en Neon.

No hay login ni panel de administrador. El pago es **simulado**: los datos de tarjeta se validan solo en el navegador y nunca se envían ni se guardan en el servidor.

## Stack

| Capa | Tecnología |
|------|------------|
| Interfaz | HTML5, JavaScript vanilla, Tailwind CSS v4 (CDN) |
| Backend | Funciones serverless de Vercel (`api/`, Node.js ESM) |
| Base de datos | Postgres en Neon con `@neondatabase/serverless` |
| Persistencia del cliente | `localStorage` para carrito, cupón, favoritos y tema |
| Tipografías | Fraunces (títulos) e Inter (texto) |

## Requisitos

- Node.js 20 o superior.
- Una cuenta de Vercel con un proyecto.
- Una base de datos Neon creada desde el Marketplace de Vercel (o una cadena de conexión de Neon equivalente).
- `npm` y, para desarrollo local, la CLI de Vercel (`npx vercel`).

---

## 1. Crear la base de datos en Neon desde Vercel

1. Entra al [dashboard de Vercel](https://vercel.com/dashboard) y abre tu proyecto (o crea uno vacío).
2. Ve a **Storage** → **Create Database** / **Marketplace** y elige **Neon**.
3. Selecciona el plan gratuito, la región más cercana a tus usuarios y confirma la integración con el proyecto.
4. Vercel agrega automáticamente las variables de entorno de la base al proyecto. La que usa este código es:

   ```text
   DATABASE_URL
   ```

   Tiene una forma similar a:

   ```text
   postgresql://usuario:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

5. Verifica en **Settings → Environment Variables** que `DATABASE_URL` exista para **Production**, **Preview** y **Development**. Si la integración solo la creó para Production, edítala y marca los tres entornos.

> También puedes crear la base directamente en [neon.tech](https://neon.tech) y copiar su *connection string*. Lo importante es que `DATABASE_URL` esté disponible para las funciones y para el script de seed.

### Variables de entorno

| Variable | Obligatoria | Uso |
|----------|-------------|-----|
| `DATABASE_URL` | Sí | Cadena de conexión Postgres de Neon. La usan las funciones de `api/` y el seed. |

No se necesitan claves de pago ni de correo. El resto de la configuración (envío, cupón) vive en el código porque es un proyecto académico.

### Variables en local

Copia el ejemplo y pega tu cadena de conexión:

```bash
cp .env.example .env
# edita .env y reemplaza el valor de DATABASE_URL
```

`.env` está en `.gitignore` y nunca debe subirse.

Si vinculaste el proyecto con Vercel, también puedes traer las variables del proyecto:

```bash
npx vercel link
npx vercel env pull .env.local
```

El seed lee `.env.local` y `.env` (en ese orden), así que cualquiera de las dos formas funciona.

---

## 2. Instalar dependencias y cargar datos

```bash
npm install
npm run seed
```

`npm run seed`:

1. Aplica `database/schema.sql` (crea tablas e índices si no existen).
2. Inserta las 4 categorías: Semillas, Plantas, Materas y Abono.
3. Carga 20 productos con precios en COP, stock variado y un producto agotado (stock 0).

El seed es idempotente por nombre/slug: puedes ejecutarlo varias veces sin duplicar filas. **Ojo:** cada ejecución vuelve a dejar el stock en los valores iniciales.

Si el comando falla con “Falta DATABASE_URL”, revisa que `.env` o `.env.local` exista y que la cadena sea válida.

---

## 3. Ejecutar en local

### Opción rápida: modo demo sin base de datos

Si quieres ver la tienda funcionando antes de crear la base en Neon:

```bash
npm run demo
```

Abre `http://localhost:3000`. El comando levanta un servidor local que:

- Sirve los HTML, CSS y JS del proyecto.
- Imita `/api/productos`, `/api/categorias`, `/api/pedidos` y `/api/pedidos/[numero]` con los 20 productos de `database/datos-iniciales.js`.
- Usa las mismas validaciones, cupón y reglas de envío que el backend real.

Los datos viven en memoria: los pedidos y el stock se reinician al cerrar el proceso. Las páginas muestran un aviso **“Modo demo · datos en memoria”** para que no se confunda con producción. Este modo es solo para revisar la interfaz; el entregable sigue usando Neon + Vercel.

### Opción real: Neon + Vercel

El proyecto ya no funciona abriendo `index.html` con doble clic: el frontend necesita las rutas `/api`. Usa la CLI de Vercel:

```bash
npx vercel dev
```

> No uses un script `npm run dev` que llame a `vercel dev`: Vercel lo detecta como invocación recursiva y se detiene.

Abre la URL que muestra la terminal (normalmente `http://localhost:3000`).

La primera vez, `vercel dev` puede pedirte iniciar sesión y vincular el proyecto. Acepta el proyecto existente para reutilizar `DATABASE_URL`, o configura `.env`/`.env.local` con la cadena de Neon.

---

## 4. Desplegar en Vercel

### Desde Git

1. Sube el repositorio a GitHub/GitLab/Bitbucket.
2. En Vercel, importa el repositorio.
3. Confirma que la integración de Neon esté conectada y que `DATABASE_URL` exista en Production.
4. Deploy. Vercel detecta `api/` como funciones y sirve los HTML como archivos estáticos.

### Desde la CLI

```bash
npx vercel link
npx vercel --prod
```

Después del primer deploy, ejecuta el seed contra la base de producción (con la `DATABASE_URL` de producción en tu entorno):

```bash
npm run seed
```

No necesitas `vercel.json`: Vercel reconoce la carpeta `api/`, el `package.json` con `"type": "module"` y el `404.html` de la raíz como página no encontrada personalizada.

---

## 5. Endpoints

Todas las respuestas son JSON. Los errores usan siempre la misma forma:

```json
{
  "error": {
    "codigo": "STOCK_INSUFICIENTE",
    "mensaje": "No hay stock suficiente para uno o más productos.",
    "detalles": [{ "producto_id": 6, "nombre": "Monstera Deliciosa", "disponible": 1, "solicitado": 2 }]
  }
}
```

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/productos` | Lista productos. Filtros opcionales: `?categoria=slug`, `?buscar=texto`, `?orden=precio_asc\|precio_desc`, `?limit=12`, `?offset=0`. |
| `GET` | `/api/productos/[id]` | Detalle de un producto por id. |
| `GET` | `/api/categorias` | Categorías con su número de productos. |
| `POST` | `/api/pedidos` | Crea un pedido, recalcula precios, valida stock y descuenta inventario en una transacción. |
| `GET` | `/api/pedidos/[numero]` | Consulta un pedido por su número (`PED-XXXXXXXXXX`). |

### Ejemplos

```http
GET /api/productos?categoria=plantas&orden=precio_asc&limit=8
```

```json
{
  "productos": [
    {
      "id": 7,
      "nombre": "Suculenta Echeveria",
      "descripcion": "Roseta compacta de bajo mantenimiento...",
      "precio": 15000,
      "stock": 25,
      "imagen_url": "https://images.unsplash.com/...",
      "creado_en": "2026-11-03T...",
      "categoria_id": 2,
      "categoria_nombre": "Plantas",
      "categoria_slug": "plantas"
    }
  ],
  "total": 7,
  "limite": 8,
  "offset": 0,
  "hay_mas": false
}
```

```http
POST /api/pedidos
Content-Type: application/json
```

```json
{
  "cliente": {
    "nombre": "Ana María López",
    "correo": "ana@example.com",
    "telefono": "3001234567",
    "direccion": "Calle 10 # 20-30",
    "ciudad": "Bogotá"
  },
  "items": [
    { "producto_id": 6, "cantidad": 2 },
    { "producto_id": 18, "cantidad": 1 }
  ],
  "cupon": "PLANTA10",
  "metodo_pago": "tarjeta_simulada"
}
```

Respuesta `201`:

```json
{
  "pedido": {
    "numero_pedido": "PED-1A2B3C4D5E",
    "estado": "confirmado",
    "subtotal": 148000,
    "descuento": 14800,
    "envio": 8000,
    "cupon": "PLANTA10",
    "total": 141200,
    "items": [
      { "producto_id": 6, "nombre": "Monstera Deliciosa", "cantidad": 2, "precio_unitario": 65000, "subtotal": 130000 }
    ]
  }
}
```

### Reglas del servidor

- El navegador solo envía `producto_id` y `cantidad`. **Los precios siempre se leen de la base de datos**; un precio manipulado en el carrito no afecta el total.
- Los items repetidos se fusionan y las cantidades deben ser enteros entre 1 y 99.
- El stock se verifica y se descuenta dentro de una transacción con `FOR UPDATE`, así dos compras simultáneas no venden la misma unidad.
- Si falta stock: `409 STOCK_INSUFICIENTE`. Si el producto no existe: `400 PRODUCTO_NO_ENCONTRADO`.
- El cupón se valida en el servidor. `PLANTA10` aplica 10 %. Un cupón inválido responde `400 CUPON_INVALIDO`.
- El envío es gratis desde `$150.000` COP; por debajo cuesta `$8.000` COP.
- El servidor rechaza cualquier cuerpo que incluya claves de tarjeta (`tarjeta`, `cvv`, `numero_tarjeta`, etc.) con `400 DATOS_NO_PERMITIDOS`.
- Códigos usados: `200`, `201`, `400`, `404`, `405`, `409`, `500`. Las consultas SQL son parametrizadas.

---

## 6. Estructura del proyecto

```text
.
├── api/
│   ├── categorias/index.js
│   ├── pedidos/index.js          # POST: crear pedido
│   ├── pedidos/[numero].js       # GET: consultar pedido
│   ├── productos/index.js        # GET: catálogo con filtros
│   └── productos/[id].js         # GET: detalle
├── lib/
│   ├── constantes.js             # envío, cupones, métodos de pago
│   ├── db.js                     # pool de Neon y transacciones
│   ├── http.js                   # respuestas JSON consistentes
│   ├── pedidos.js                # creación transaccional del pedido
│   └── validaciones.js           # validación y detección de datos de tarjeta
├── database/
│   ├── schema.sql                # tablas e índices
│   ├── datos-iniciales.js        # 4 categorías y 20 productos
│   └── seed.js                   # npm run seed
├── assets/placeholder-planta.svg
├── demo/
│   └── servidor.js               # modo demo local sin base de datos
├── js/
│   ├── api.js                    # todas las llamadas fetch al backend
│   ├── config.js                 # configuración compartida del cliente
│   ├── ui.js                     # tarjetas, skeletons, toasts, iconos
│   ├── common.js                 # navbar, footer, menú móvil y tema
│   ├── favoritos.js              # favoritos en localStorage
│   ├── carrito.js               # carrito, cupón, totales y revalidación
│   ├── catalogo.js               # index.html
│   ├── producto.js               # producto.html
│   ├── carrito-pagina.js         # carrito.html
│   ├── checkout.js               # checkout.html
│   ├── confirmacion.js           # confirmacion.html
│   ├── seguimiento.js            # seguimiento.html
│   └── favoritos-pagina.js       # favoritos.html
├── index.html
├── producto.html
├── carrito.html
├── checkout.html
├── confirmacion.html
├── seguimiento.html
├── favoritos.html
├── 404.html
├── .env.example
└── package.json
```

### Tablas

- `categorias(id, nombre, slug)`
- `productos(id, categoria_id, nombre, descripcion, precio, stock, imagen_url, creado_en)`
- `pedidos(id, numero_pedido, nombre_cliente, correo, telefono, direccion, ciudad, metodo_pago, subtotal, descuento, envio, cupon, total, estado, creado_en)`
- `pedido_items(id, pedido_id, producto_id, cantidad, precio_unitario)`

`subtotal`, `descuento`, `envio` y `cupon` son columnas adicionales para guardar el desglose real del pedido. No se guardan datos de tarjeta en ninguna tabla.

---

## 7. Probar el flujo completo

1. Ejecuta `npm run seed` y luego `npx vercel dev`.
2. Abre `http://localhost:3000`.
3. Filtra por categoría, busca “monstera”, ordena por precio y usa **Cargar más**.
4. Entra al detalle de una planta, cambia la cantidad y agrégala al carrito.
5. Abre el carrito: se revalidan precio y stock contra la API.
6. Aplica el cupón `PLANTA10` y observa el descuento y el costo de envío.
7. Ve a **Ir a pagar**, completa los datos de envío y usa datos de tarjeta inventados:
   - Número: `4111 1111 1111 1111`
   - Vencimiento: `12/29`
   - CVV: `123`
8. Confirma la compra. La página de confirmación consulta el pedido real y muestra su número `PED-...`.
9. Haz clic en **Rastrear mi pedido** o abre `/seguimiento.html`, escribe el número y verifica estado, productos y totales.
10. Prueba los estados de error:
    - Número con formato inválido → mensaje en el formulario.
    - Número inexistente → “Pedido no encontrado”.
    - Producto con stock 0 (Cactus San Pedro) → botón deshabilitado.
11. Prueba favoritos: toca el corazón de una tarjeta y abre **Favoritos**; el contador se actualiza.
12. Prueba el modo oscuro y recarga: la preferencia se conserva.
13. Prueba una URL inexistente: se muestra el `404.html` personalizado.

### Probar el control de stock

En una pestaña deja el checkout abierto con 2 unidades de un producto que tenga stock 1. En otra pestaña compra esa unidad. Al confirmar la primera compra, el servidor responderá `409 STOCK_INSUFICIENTE` y el checkout mostrará el detalle con un botón para actualizar el carrito.

### Verificar en la base (opcional)

En el SQL Editor de Neon:

```sql
SELECT numero_pedido, total, estado, creado_en
FROM pedidos
ORDER BY creado_en DESC
LIMIT 5;

SELECT p.nombre, pi.cantidad, pi.precio_unitario
FROM pedido_items pi
JOIN productos p ON p.id = pi.producto_id
WHERE pi.pedido_id = (
  SELECT id FROM pedidos ORDER BY creado_en DESC LIMIT 1
);
```

---

## 8. Funciones y detalles de diseño

- Catálogo con skeletons, error amigable y botón **Reintentar**.
- Favoritos en `localStorage` con corazón en tarjetas y página `favoritos.html`.
- Productos relacionados por categoría en el detalle.
- Cupón `PLANTA10` (10 %) validado en el servidor.
- Envío gratis desde `$150.000` COP y barra de progreso en el carrito.
- Paginación con **Cargar más** (8 productos por página en el catálogo).
- Seguimiento de pedido con línea de tiempo: confirmado → preparando → enviado → entregado.
- Modo oscuro con Tailwind `dark:` y preferencia persistida.
- Toasts, animaciones sutiles, focus visible, etiquetas en formularios y textos `alt`.
- Página 404 personalizada.
- Carrito y cupón en `localStorage`; el servidor siempre manda sobre precios, stock y total.

## 9. Notas y limitaciones

- El pago es simulado: no hay pasarela ni cobro real. Los campos de tarjeta solo se validan con JavaScript y se descartan antes de enviar el pedido.
- No hay autenticación ni panel de administrador. Cualquier persona con el número de pedido puede consultarlo.
- El estado del pedido se guarda como `confirmado` al crearse. Para probar otros estados, actualízalo en la base:

  ```sql
  UPDATE pedidos SET estado = 'enviado' WHERE numero_pedido = 'PED-XXXXXXXXXX';
  ```

- Las imágenes de los productos son URLs de Unsplash; si una falla, se usa `assets/placeholder-planta.svg`.
- El seed reinicia el stock de los 20 productos cada vez que se ejecuta.

## 10. Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run demo` | Servidor local con API en memoria, sin base de datos (solo para ver la interfaz). |
| `npm run seed` | Aplica el esquema y carga categorías/productos. |
| `npx vercel --prod` | Despliega a producción. |
