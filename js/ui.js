// Componentes y utilidades de interfaz reutilizables:
// tarjetas de producto, skeletons, toasts, iconos y formateo.

const ICONOS = {
  hoja: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
  corazon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`,
  carrito: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M6 6h15l-1.6 9H7.6L5 3H2"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>`,
  buscar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  flecha: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  atras: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="m4 12.5 5 5L20 6.5"/></svg>`,
  basura: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/><path d="M10 10v6M14 10v6"/></svg>`,
  mas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-4 w-4" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
  menos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-4 w-4" aria-hidden="true"><path d="M5 12h14"/></svg>`,
  sol: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  luna: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="h-5 w-5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  cerrar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="h-5 w-5" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  camion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7"/><circle cx="7" cy="19" r="1.5"/><circle cx="17.5" cy="19" r="1.5"/></svg>`,
  escudo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-5.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg>`,
  ubicacion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  sobre: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
  telefono: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M5 3h3l2 5-2 1a13 13 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>`,
  tarjeta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>`,
  paquete: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>`,
  reloj: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  alerta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" aria-hidden="true"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.6 17.1A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>`,
  bolsa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`
};

// Escapa cualquier texto antes de insertarlo como HTML.
function escaparHtml(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (caracter) => {
    const reemplazos = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return reemplazos[caracter];
  });
}

function formatearCOP(precio) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(Number(precio) || 0);
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return '';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(fecha);
}

function etiquetaEstado(estado) {
  const etiquetas = {
    confirmado: 'Confirmado',
    preparando: 'Preparando',
    enviado: 'En camino',
    entregado: 'Entregado'
  };
  return etiquetas[estado] ?? estado;
}

function clasesEstadoPedido(estado) {
  const clases = {
    confirmado: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    preparando: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    enviado: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
    entregado: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200'
  };
  return clases[estado] ?? clases.confirmado;
}

// Filas de productos de un pedido guardado (se usan en confirmación y seguimiento).
function htmlItemsPedido(items = []) {
  return items
    .map(
      (item) => `
        <div class="flex items-center gap-3">
          <img src="${escaparHtml(item.imagen_url)}" alt="${escaparHtml(item.nombre)}"
               class="h-14 w-14 shrink-0 rounded-lg object-cover"
               onerror="manejarErrorImagen(this)">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-stone-800 dark:text-stone-200">${escaparHtml(item.nombre)}</p>
            <p class="text-xs text-stone-400 dark:text-stone-500">${item.cantidad} × ${formatearCOP(item.precio_unitario)}</p>
          </div>
          <p class="shrink-0 text-sm font-semibold text-stone-800 dark:text-stone-200">${formatearCOP(item.subtotal)}</p>
        </div>`
    )
    .join('');
}

// Totales de un pedido con envío, cupón y descuento.
function htmlTotalesPedido(pedido) {
  const filas = [
    ['Subtotal', formatearCOP(pedido.subtotal), ''],
    pedido.descuento > 0
      ? [
          `Descuento${pedido.cupon ? ` (${pedido.cupon})` : ''}`,
          `-${formatearCOP(pedido.descuento)}`,
          'text-emerald-700 dark:text-emerald-400'
        ]
      : null,
    ['Envío', pedido.envio === 0 ? 'Gratis' : formatearCOP(pedido.envio), '']
  ].filter(Boolean);

  return (
    filas
      .map(
        ([etiqueta, valor, clase]) => `
          <div class="flex justify-between gap-4 ${clase}">
            <dt>${escaparHtml(etiqueta)}</dt>
            <dd class="font-medium">${escaparHtml(valor)}</dd>
          </div>`
      )
      .join('') +
    `<div class="flex justify-between gap-4 border-t border-stone-200 pt-2 text-base font-semibold text-stone-900 dark:border-stone-800 dark:text-stone-50">
       <dt>Total</dt>
       <dd class="font-display text-xl text-emerald-700 dark:text-emerald-400">${formatearCOP(pedido.total)}</dd>
     </div>`
  );
}

function htmlDatosEntregaPedido(pedido) {
  const datos = [
    ['Nombre', pedido.cliente?.nombre],
    ['Correo', pedido.cliente?.correo],
    ['Teléfono', pedido.cliente?.telefono],
    ['Dirección', pedido.cliente?.direccion],
    ['Ciudad', pedido.cliente?.ciudad],
    ['Pago', 'Tarjeta simulada']
  ];

  return datos
    .filter(([, valor]) => Boolean(valor))
    .map(
      ([etiqueta, valor]) => `
        <div class="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
          <dt class="text-xs uppercase tracking-[0.1em] text-stone-400 dark:text-stone-500">${escaparHtml(etiqueta)}</dt>
          <dd class="break-words font-medium text-stone-700 dark:text-stone-200 sm:text-right">${escaparHtml(valor)}</dd>
        </div>`
    )
    .join('');
}

function manejarErrorImagen(imagen) {
  imagen.onerror = null;
  imagen.src = 'assets/placeholder-planta.svg';
}

function actualizarBotonFavorito(boton, activo) {
  if (!boton) return;
  boton.setAttribute('aria-pressed', String(activo));
  boton.classList.toggle('text-rose-500', activo);
  boton.classList.toggle('dark:text-rose-400', activo);
  boton.classList.toggle('text-stone-500', !activo);
  boton.classList.toggle('dark:text-stone-300', !activo);
  const svg = boton.querySelector('svg');
  if (svg) svg.setAttribute('fill', activo ? 'currentColor' : 'none');
}

// Tarjeta de producto reutilizable en catálogo, favoritos y relacionados.
function crearTarjetaProducto(producto, opciones = {}) {
  const agotado = Number(producto.stock) <= 0;
  const articulo = document.createElement('article');
  articulo.className =
    'group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/5 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-900';
  articulo.dataset.productoId = producto.id;

  articulo.innerHTML = `
    <div class="relative overflow-hidden bg-stone-100 dark:bg-stone-800">
      <a href="producto.html?id=${producto.id}" class="block aspect-[4/3]" aria-label="Ver detalle de ${escaparHtml(producto.nombre)}">
        <img src="${escaparHtml(producto.imagen_url)}" alt="${escaparHtml(producto.nombre)}" loading="lazy"
             class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
             onerror="manejarErrorImagen(this)">
      </a>
      <span class="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800 backdrop-blur dark:bg-stone-950/80 dark:text-emerald-300">
        ${escaparHtml(producto.categoria_nombre)}
      </span>
      <button type="button" data-favorito="${producto.id}" aria-pressed="false"
              aria-label="Agregar ${escaparHtml(producto.nombre)} a favoritos"
              class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-stone-500 shadow-sm backdrop-blur transition hover:scale-110 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-stone-950/80 dark:text-stone-300 dark:focus-visible:ring-offset-stone-900">
        ${ICONOS.corazon}
      </button>
      ${agotado ? '<span class="absolute bottom-3 left-3 rounded-full bg-stone-900/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">Agotado</span>' : ''}
    </div>
    <div class="flex flex-1 flex-col gap-1.5 p-4">
      <h3 class="font-display text-[1.05rem] font-semibold leading-snug text-stone-900 dark:text-stone-50">
        <a href="producto.html?id=${producto.id}" class="transition hover:text-emerald-700 dark:hover:text-emerald-400">${escaparHtml(producto.nombre)}</a>
      </h3>
      <p class="line-clamp-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">${escaparHtml(producto.descripcion)}</p>
      <div class="mt-auto flex items-end justify-between gap-2 pt-3">
        <p class="font-display text-xl font-semibold text-emerald-700 dark:text-emerald-400">${formatearCOP(producto.precio)}</p>
        <p class="text-[11px] text-stone-400 dark:text-stone-500">${agotado ? 'Sin stock' : `${producto.stock} disponibles`}</p>
      </div>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <a href="producto.html?id=${producto.id}"
           class="rounded-xl border border-stone-200 px-3 py-2 text-center text-sm font-medium text-stone-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-stone-700 dark:text-stone-200 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300">
          Ver
        </a>
        <button type="button" data-agregar="${producto.id}" ${agotado ? 'disabled' : ''}
                class="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  agotado
                    ? 'cursor-not-allowed bg-stone-200 text-stone-400 dark:bg-stone-800 dark:text-stone-500'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500'
                }">
          ${agotado ? 'Agotado' : `${ICONOS.carrito}<span>Agregar</span>`}
        </button>
      </div>
    </div>
  `;

  const botonFavorito = articulo.querySelector('[data-favorito]');
  actualizarBotonFavorito(botonFavorito, esFavorito(producto.id));
  botonFavorito.addEventListener('click', () => {
    const activo = alternarFavorito(producto.id);
    actualizarBotonFavorito(botonFavorito, activo);
    mostrarToast(
      activo ? `${producto.nombre} se guardó en favoritos` : `${producto.nombre} salió de favoritos`,
      activo ? 'exito' : 'info'
    );
    if (!activo && typeof opciones.alQuitarFavorito === 'function') {
      opciones.alQuitarFavorito(articulo);
    }
  });

  const botonAgregar = articulo.querySelector('[data-agregar]');
  if (!agotado) {
    botonAgregar.addEventListener('click', () => {
      const resultado = agregarAlCarrito(producto, 1);
      if (!resultado.ok) {
        mostrarToast(resultado.mensaje, 'error');
        return;
      }
      actualizarContadorCarrito();
      animarBotonAgregado(botonAgregar);
      mostrarToast(`${producto.nombre} se agregó al carrito`, 'exito');
    });
  }

  return articulo;
}

function animarBotonAgregado(boton) {
  if (!boton || boton.disabled) return;
  const contenidoOriginal = boton.innerHTML;
  boton.disabled = true;
  boton.classList.add('animar-latido');
  boton.innerHTML = `${ICONOS.check}<span>¡Listo!</span>`;

  window.setTimeout(() => {
    boton.innerHTML = contenidoOriginal;
    boton.disabled = false;
    boton.classList.remove('animar-latido');
  }, 1200);
}

// Skeletons mientras carga el catálogo.
function insertarEsqueletos(contenedor, cantidad = 8) {
  if (!contenedor) return;
  const esqueleto = `
    <div class="animate-pulse overflow-hidden rounded-2xl border border-stone-200/80 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div class="aspect-[4/3] bg-stone-200/80 dark:bg-stone-800"></div>
      <div class="space-y-3 p-4">
        <div class="h-4 w-2/3 rounded-full bg-stone-200 dark:bg-stone-800"></div>
        <div class="h-3 w-full rounded-full bg-stone-200/80 dark:bg-stone-800"></div>
        <div class="h-3 w-4/5 rounded-full bg-stone-200/80 dark:bg-stone-800"></div>
        <div class="h-5 w-1/3 rounded-full bg-stone-200 dark:bg-stone-800"></div>
        <div class="grid grid-cols-2 gap-2 pt-1">
          <div class="h-9 rounded-xl bg-stone-200 dark:bg-stone-800"></div>
          <div class="h-9 rounded-xl bg-stone-200 dark:bg-stone-800"></div>
        </div>
      </div>
    </div>`;
  contenedor.innerHTML = esqueleto.repeat(cantidad);
}

// Panel de error con botón para reintentar la carga.
function mostrarErrorCarga(contenedor, mensaje, alReintentar) {
  if (!contenedor) return;
  contenedor.innerHTML = `
    <div class="col-span-full flex flex-col items-center gap-4 rounded-2xl border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center dark:border-stone-700 dark:bg-stone-900/60">
      <span class="grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
        ${ICONOS.alerta}
      </span>
      <div>
        <p class="font-display text-xl font-semibold text-stone-900 dark:text-stone-50">No pudimos cargar la información</p>
        <p class="mx-auto mt-1 max-w-md text-sm text-stone-500 dark:text-stone-400">${escaparHtml(mensaje)}</p>
      </div>
      <button type="button" data-reintentar class="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus-visible:ring-offset-stone-900">
        Reintentar
      </button>
    </div>`;

  contenedor.querySelector('[data-reintentar]')?.addEventListener('click', alReintentar);
}

// Notificaciones breves (toasts).
function mostrarToast(mensaje, tipo = 'exito') {
  let contenedor = document.getElementById('toasts');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'toasts';
    contenedor.className =
      'pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2';
    contenedor.setAttribute('role', 'status');
    contenedor.setAttribute('aria-live', 'polite');
    document.body.appendChild(contenedor);
  }

  const variantes = {
    exito: {
      clase:
        'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/90 dark:text-emerald-100',
      icono: ICONOS.check
    },
    error: {
      clase:
        'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/70 dark:bg-rose-950/90 dark:text-rose-100',
      icono: ICONOS.alerta
    },
    info: {
      clase:
        'border-stone-200 bg-white text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100',
      icono: ICONOS.info
    }
  };

  const variante = variantes[tipo] ?? variantes.info;
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg shadow-stone-900/10 animar-toast ${variante.clase}`;
  toast.setAttribute('role', tipo === 'error' ? 'alert' : 'status');

  toast.innerHTML = `
    <span class="mt-0.5 shrink-0">${variante.icono}</span>
    <p class="flex-1 leading-snug">${escaparHtml(mensaje)}</p>
    <button type="button" class="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current" aria-label="Cerrar notificación">
      ${ICONOS.cerrar}
    </button>
  `;

  contenedor.appendChild(toast);

  const cerrar = () => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 200ms ease';
    window.setTimeout(() => toast.remove(), 220);
  };

  toast.querySelector('button')?.addEventListener('click', cerrar);
  window.setTimeout(cerrar, 4200);
}

function mostrarMensajeCupon(texto, tipo = 'info') {
  const mensaje = document.getElementById('mensajeCupon');
  if (!mensaje) return;
  mensaje.textContent = texto;
  mensaje.className =
    tipo === 'error'
      ? 'mt-2 text-xs font-medium text-rose-600 dark:text-rose-400'
      : 'mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400';
}
