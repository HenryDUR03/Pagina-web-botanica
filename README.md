# Tienda de Plantas - Proyecto Académico

Una tienda en línea sencilla para la venta de semillas, plantas ya crecidas, materas y abono. Proyecto frontend sin backend, base de datos o sistema de login.

## Descripción

Esta aplicación web permite a los visitantes:
- Explorar el catálogo de productos con filtros por categoría, búsqueda por nombre y orden por precio
- Ver detalles de cada producto
- Agregar productos al carrito (respetando el stock disponible)
- Realizar una compra simulada con validación de formulario
- Recibir confirmación de compra con número de pedido generado aleatoriamente

## Tecnologías Utilizadas

- **HTML5** - Estructura de las páginas
- **JavaScript Vanilla** - Lógica de la aplicación (sin frameworks)
- **Tailwind CSS v4** - Estilos cargados por CDN
- **localStorage** - Almacenamiento del carrito

## Características

- ✅ Catálogo con 4 categorías: Semillas, Plantas, Materas y Abono
- ✅ Filtros por categoría, buscador por nombre y orden por precio
- ✅ Carrito de compras con actualización de cantidades
- ✅ Contador de productos en el carrito
- ✅ Validación de formulario en checkout
- ✅ Pago simulado (no se guardan datos de tarjeta)
- ✅ Productos agotados con botón deshabilitado
- ✅ Diseño responsive (mobile-first)
- ✅ Paleta de colores verde/crema/tierra

## Cómo Abrir el Proyecto

Este proyecto **no requiere instalación, servidor o compilación**. Puedes abrirlo directamente en tu navegador:

1. Descarga o clona todos los archivos en una carpeta
2. Abre el archivo `index.html` con tu navegador web (doble clic)
3. ¡Listo! Ya puedes navegar por la tienda

> **Nota:** Algunos navegadores pueden tener restricciones con archivos locales, pero este proyecto está diseñado para funcionar correctamente abriendo `index.html` directamente.

## Vistas del Proyecto

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Página principal con hero, categorías destacadas y catálogo |
| `producto.html` | Detalle del producto (se accede con `?id=X`) |
| `carrito.html` | Carrito de compras con lista de productos y resumen |
| `checkout.html` | Formulario de envío y pago con validación |
| `confirmacion.html` | Página de confirmación con número de pedido |

## Estructura de Archivos

```
proyecto/
├── index.html
├── producto.html
├── carrito.html
├── checkout.html
├── confirmacion.html
├── README.md
└── js/
    ├── productos.js   # Datos de los productos
    ├── carrito.js     # Lógica del carrito y localStorage
    ├── common.js      # Navbar y footer reutilizables
    ├── catalogo.js    # Lógica de index.html
    ├── producto.js    # Lógica de producto.html
    └── checkout.js    # Validación y proceso de compra
```

## Flujo de Compra para Probar

1. **Explorar**: Abre `index.html` y navega por el catálogo
2. **Ver detalle**: Haz clic en "Ver Detalle" de cualquier producto
3. **Agregar al carrito**: Selecciona cantidad y haz clic en "Agregar al Carrito"
4. **Ver carrito**: Haz clic en el ícono del carrito en la navbar
5. **Modificar carrito**: Puedes cambiar cantidades, quitar productos o vaciarlo
6. **Checkout**: Haz clic en "Proceder al Pago"
7. **Llenar formulario**: Completa datos de envío y datos de pago (simulados)
8. **Confirmar**: Haz clic en "Confirmar Compra"
9. **Confirmación**: Verás el número de pedido generado aleatoriamente

**Datos de prueba para checkout:**
- Correo: cualquier email válido (ej: test@test.com)
- Tarjeta: 16 dígitos numéricos (ej: 1234567812345678)
- Vencimiento: MM/AA válido y futuro (ej: 12/28)
- CVV: 3 dígitos (ej: 123)

## Notas Importantes

- Los datos de la tarjeta **NO** se guardan en ningún lado
- El carrito se guarda en `localStorage` del navegador
- Al llegar a la página de confirmación, el carrito se vacía automáticamente
- Los productos con stock 0 aparecen como "Agotado" y no se pueden agregar al carrito
- No se puede agregar al carrito más cantidad que la disponible en stock
