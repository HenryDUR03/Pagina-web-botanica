// Detalle de producto: carga por ?id=, stock, favoritos y relacionados.

const CLASES_BOTON_FAVORITO =
  'flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500';
const CLASES_FAVORITO_ACTIVO =
  'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
const CLASES_FAVORITO_INACTIVO =
  'border-stone-300 bg-white text-stone-700 hover:border-rose-200 hover:text-rose-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-rose-900 dark:hover:text-rose-300';

let productoActual = null;

function iniciarPaginaProducto() {
  const id = new URLSearchParams(window.location.search).get('id');

  if (!id || !/^\d+$/.test(id)) {
    mostrarProductoNoEncontrado('El enlace no incluye un producto válido.');
    return;
  }

  cargarProducto(id);
}

async function cargarProducto(id) {
  const contenedor = document.getElementById('detalleProducto');
  if (!contenedor) return;

  contenedor.innerHTML = esqueletoDetalle();

  try {
    const { producto } = await TiendaAPI.obtenerProducto(id);
    productoActual = producto;
    document.title = `${producto.nombre} · Raíz & Hoja`;
    renderizarDetalle(producto);
    cargarRelacionados(producto);
  } catch (error) {
    if (error.estado === 404) {
      mostrarProductoNoEncontrado('Ese producto no existe o ya no está en el catálogo.');
      return;
    }
    mostrarErrorCarga(contenedor, error.message, () => cargarProducto(id));
  }
}

function esqueletoDetalle() {
  return `
    <div class="animate-pulse overflow-hidden rounded-3xl border border-stone-200/80 bg-white lg:grid lg:grid-cols-2 dark:border-stone-800 dark:bg-stone-900">
      <div class="h-72 bg-stone-200/80 sm:h-96 lg:h-full dark:bg-stone-800"></div>
      <div class="space-y-4 p-6 sm:p-8 lg:p-10">
        <div class="h-4 w-24 rounded-full bg-stone-200 dark:bg-stone-800"></div>
        <div class="h-9 w-3/4 rounded-full bg-stone-200 dark:bg-stone-800"></div>
        <div class="h-6 w-1/3 rounded-full bg-stone-200 dark:bg-stone-800"></div>
        <div class="h-3 w-full rounded-full bg-stone-200/80 dark:bg-stone-800"></div>
        <div class="h-3 w-5/6 rounded-full bg-stone-200/80 dark:bg-stone-800"></div>
        <div class="h-24 w-full rounded-2xl bg-stone-200/70 dark:bg-stone-800"></div>
        <div class="h-11 w-full rounded-xl bg-stone-200 dark:bg-stone-800"></div>
      </div>
    </div>`;
}

function renderizarDetalle(producto) {
  const contenedor = document.getElementById('detalleProducto');
  const agotado = producto.stock <= 0;
  const favorito = esFavorito(producto.id);

  document.getElementById('migaCategoria').textContent = producto.categoria_nombre;
  document.getElementById('migaNombre').textContent = producto.nombre;

  const enlaceCategoria = document.getElementById('enlaceCategoria');
  if (enlaceCategoria) {
    enlaceCategoria.href = `index.html?categoria=${encodeURIComponent(producto.categoria_slug)}#catalogo`;
    enlaceCategoria.textContent = `Ver ${producto.categoria_nombre}`;
  }

  const colorStock = agotado
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
    : producto.stock <= 5
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';

  contenedor.innerHTML = `
    <div class="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm lg:grid lg:grid-cols-2 dark:border-stone-800 dark:bg-stone-900">
      <div class="relative bg-stone-100 dark:bg-stone-800">
        <img src="${escaparHtml(producto.imagen_url)}" alt="${escaparHtml(producto.nombre)}"
             class="h-72 w-full object-cover sm:h-96 lg:h-full"
             onerror="manejarErrorImagen(this)">
        <span class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800 backdrop-blur dark:bg-stone-950/80 dark:text-emerald-300">
          ${escaparHtml(producto.categoria_nombre)}
        </span>
        <button type="button" id="btnFavoritoDetalle" aria-pressed="${favorito}"
                aria-label="${favorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}"
                class="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-stone-500 shadow-sm backdrop-blur transition hover:scale-105 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:bg-stone-950/80 dark:text-stone-300">
          ${ICONOS.corazon}
        </button>
      </div>

      <div class="p-6 sm:p-8 lg:p-10">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full px-3 py-1 text-xs font-semibold ${colorStock}">
            ${agotado ? 'Agotado' : `${producto.stock} disponibles`}
          </span>
          <span class="text-xs text-stone-400 dark:text-stone-500">Ref. PL-${String(producto.id).padStart(4, '0')}</span>
        </div>

        <h1 class="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
          ${escaparHtml(producto.nombre)}
        </h1>

        <p class="mt-3 font-display text-2xl font-semibold text-emerald-700 dark:text-emerald-400">${formatearCOP(producto.precio)}</p>

        <p class="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-300">${escaparHtml(producto.descripcion)}</p>

        <div class="mt-6 rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-950/40">
          <div class="flex items-center justify-between gap-3">
            <label for="cantidadDetalle" class="text-sm font-semibold text-stone-700 dark:text-stone-200">Cantidad</label>
            <span class="text-xs text-stone-400 dark:text-stone-500">${agotado ? 'Sin stock' : `Máximo ${producto.stock}`}</span>
          </div>

          <div class="mt-2 flex items-center gap-4">
            <div class="inline-flex items-center rounded-xl border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900">
              <button type="button" data-cantidad="-1" aria-label="Quitar una unidad" ${agotado ? 'disabled' : ''}
                      class="grid h-10 w-10 place-items-center rounded-l-xl text-stone-600 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-300 dark:hover:bg-stone-800">
                ${ICONOS.menos}
              </button>
              <input id="cantidadDetalle" type="number" inputmode="numeric" min="1" max="${Math.max(producto.stock, 1)}" value="1"
                     aria-describedby="ayudaCantidad" ${agotado ? 'disabled' : ''}
                     class="h-10 w-14 border-x border-stone-200 bg-transparent text-center text-sm font-semibold text-stone-900 focus:outline-none dark:border-stone-700 dark:text-stone-100">
              <button type="button" data-cantidad="1" aria-label="Agregar una unidad" ${agotado ? 'disabled' : ''}
                      class="grid h-10 w-10 place-items-center rounded-r-xl text-stone-600 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-300 dark:hover:bg-stone-800">
                ${ICONOS.mas}
              </button>
            </div>
            <p id="ayudaCantidad" class="text-xs text-stone-400 dark:text-stone-500">
              ${agotado ? 'Este producto volverá pronto.' : 'Ajusta según lo que necesites.'}
            </p>
          </div>
        </div>

        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" id="btnAgregarDetalle" ${agotado ? 'disabled' : ''}
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 ${
                    agotado
                      ? 'cursor-not-allowed bg-stone-200 text-stone-400 dark:bg-stone-800 dark:text-stone-500'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500'
                  }">
            ${ICONOS.carrito}
            ${agotado ? 'Producto agotado' : 'Agregar al carrito'}
          </button>

          <button type="button" id="btnFavoritoDetalleTexto" aria-pressed="${favorito}"
                  class="${CLASES_BOTON_FAVORITO} ${favorito ? CLASES_FAVORITO_ACTIVO : CLASES_FAVORITO_INACTIVO}">
            ${ICONOS.corazon}
            <span data-texto-favorito>${favorito ? 'En favoritos' : 'Guardar'}</span>
          </button>
        </div>

        <ul class="mt-6 space-y-2 border-t border-stone-100 pt-5 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
          <li class="flex items-center gap-2">${ICONOS.camion} Envío gratis desde ${formatearCOP(TIENDA_CONFIG.ENVIO.GRATIS_DESDE)}</li>
          <li class="flex items-center gap-2">${ICONOS.escudo} Garantía verde de 30 días</li>
          <li class="flex items-center gap-2">${ICONOS.tarjeta} Checkout simulado, sin cobros reales</li>
        </ul>
      </div>
    </div>
  `;

  conectarEventosDetalle(producto, agotado, favorito);
}

function conectarEventosDetalle(producto, agotado, favorito) {
  const inputCantidad = document.getElementById('cantidadDetalle');
  const botonesCantidad = document.querySelectorAll('[data-cantidad]');
  const botonAgregar = document.getElementById('btnAgregarDetalle');
  const botonFavoritoImagen = document.getElementById('btnFavoritoDetalle');
  const botonFavoritoTexto = document.getElementById('btnFavoritoDetalleTexto');

  const limitarCantidad = (valor) => {
    const numero = Number.parseInt(valor, 10);
    if (!Number.isFinite(numero)) return 1;
    return Math.min(Math.max(numero, 1), Math.max(producto.stock, 1));
  };

  if (!agotado && inputCantidad) {
    botonesCantidad.forEach((boton) => {
      boton.addEventListener('click', () => {
        const delta = Number(boton.dataset.cantidad);
        inputCantidad.value = String(limitarCantidad(Number(inputCantidad.value) + delta));
      });
    });

    inputCantidad.addEventListener('change', () => {
      inputCantidad.value = String(limitarCantidad(inputCantidad.value));
    });
  }

  botonAgregar?.addEventListener('click', () => {
    const cantidad = limitarCantidad(inputCantidad?.value ?? 1);
    const resultado = agregarAlCarrito(producto, cantidad);

    if (!resultado.ok) {
      mostrarToast(resultado.mensaje, 'error');
      return;
    }

    actualizarContadorCarrito();
    animarBotonAgregado(botonAgregar);
    mostrarToast(`${cantidad} × ${producto.nombre} se agregó al carrito`, 'exito');
  });

  const alternar = () => {
    const activo = alternarFavorito(producto.id);
    actualizarBotonFavorito(botonFavoritoImagen, activo);

    if (botonFavoritoTexto) {
      actualizarBotonFavorito(botonFavoritoTexto, activo);
      // El botón de texto usa colores de borde/fondo además del color del icono.
      botonFavoritoTexto.className = `${CLASES_BOTON_FAVORITO} ${
        activo ? CLASES_FAVORITO_ACTIVO : CLASES_FAVORITO_INACTIVO
      }`;
    }

    if (botonFavoritoImagen) botonFavoritoImagen.setAttribute('aria-label', activo ? 'Quitar de favoritos' : 'Guardar en favoritos');
    const texto = botonFavoritoTexto?.querySelector('[data-texto-favorito]');
    if (texto) texto.textContent = activo ? 'En favoritos' : 'Guardar';

    mostrarToast(
      activo ? `${producto.nombre} se guardó en favoritos` : `${producto.nombre} salió de favoritos`,
      activo ? 'exito' : 'info'
    );
  };

  botonFavoritoImagen?.addEventListener('click', alternar);
  botonFavoritoTexto?.addEventListener('click', alternar);

  actualizarBotonFavorito(botonFavoritoImagen, favorito);
  const svgTexto = botonFavoritoTexto?.querySelector('svg');
  if (svgTexto) svgTexto.setAttribute('fill', favorito ? 'currentColor' : 'none');
}

async function cargarRelacionados(producto) {
  const seccion = document.getElementById('seccionRelacionados');
  const grid = document.getElementById('gridRelacionados');
  if (!seccion || !grid) return;

  try {
    const { productos } = await TiendaAPI.obtenerProductos({
      categoria: producto.categoria_slug,
      limit: 5
    });

    const relacionados = productos.filter((item) => item.id !== producto.id).slice(0, 4);
    if (relacionados.length === 0) return;

    grid.innerHTML = '';
    relacionados.forEach((item) => grid.appendChild(crearTarjetaProducto(item)));
    seccion.classList.remove('hidden');
  } catch {
    // Los relacionados son un extra: si fallan no rompemos la página.
  }
}

function mostrarProductoNoEncontrado(mensaje) {
  const contenedor = document.getElementById('detalleProducto');
  if (!contenedor) return;

  document.title = 'Producto no encontrado · Raíz & Hoja';
  document.getElementById('migaNombre').textContent = 'No encontrado';
  document.getElementById('seccionRelacionados')?.classList.add('hidden');

  contenedor.innerHTML = `
    <div class="rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center dark:border-stone-700 dark:bg-stone-900/60">
      <span class="text-5xl" aria-hidden="true">🪴</span>
      <h1 class="mt-4 font-display text-2xl font-semibold text-stone-900 sm:text-3xl dark:text-stone-50">No encontramos ese producto</h1>
      <p class="mx-auto mt-2 max-w-md text-sm text-stone-500 dark:text-stone-400">${escaparHtml(mensaje)}</p>
      <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <a href="index.html#catalogo" class="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Volver al catálogo</a>
        <a href="favoritos.html" class="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-emerald-300 hover:text-emerald-800 dark:border-stone-700 dark:text-stone-200">Ver favoritos</a>
      </div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', iniciarPaginaProducto);
