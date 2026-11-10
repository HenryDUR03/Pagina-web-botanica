// Página del carrito: revalida stock y precios, permite cantidades, cupón y totales.

let itemsCarrito = [];

function iniciarPaginaCarrito() {
  document.getElementById('btnVaciarCarrito')?.addEventListener('click', vaciarTodoElCarrito);
  document.getElementById('formCupon')?.addEventListener('submit', aplicarCuponDesdeFormulario);
  document.getElementById('btnQuitarCupon')?.addEventListener('click', quitarCuponAplicado);
  document.getElementById('listaCarrito')?.addEventListener('click', manejarAccionCarrito);

  cargarCarritoPagina();
}

async function cargarCarritoPagina() {
  const guardados = obtenerCarrito();

  if (guardados.length === 0) {
    mostrarPantallaCarrito('carritoVacio');
    actualizarContadorCarrito();
    return;
  }

  mostrarPantallaCarrito('cargandoCarrito');

  try {
    const { items, avisos } = await revalidarCarrito();
    itemsCarrito = items;
    renderizarAvisosCarrito(avisos);

    if (itemsCarrito.length === 0) {
      mostrarPantallaCarrito('carritoVacio');
      return;
    }

    renderizarCarritoPagina();
    mostrarPantallaCarrito('carritoContenido');
  } catch (error) {
    mostrarPantallaCarrito('errorCarrito');
    mostrarErrorCarga(document.getElementById('errorCarrito'), error.message, cargarCarritoPagina);
  }
}

function mostrarPantallaCarrito(idVisible) {
  ['cargandoCarrito', 'errorCarrito', 'carritoVacio', 'carritoContenido'].forEach((id) => {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    elemento.classList.toggle('hidden', id !== idVisible);
    if (id === 'carritoContenido' && id === idVisible) {
      elemento.classList.add('grid');
    }
  });
}

function renderizarAvisosCarrito(avisos) {
  const contenedor = document.getElementById('avisosCarrito');
  if (!contenedor) return;

  contenedor.innerHTML = avisos
    .map(
      (aviso) => `
        <div class="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <span class="mt-0.5 shrink-0" aria-hidden="true">${ICONOS.info}</span>
          <p>${escaparHtml(aviso)}</p>
        </div>`
    )
    .join('');
}

function renderizarCarritoPagina() {
  const lista = document.getElementById('listaCarrito');
  if (!lista) return;

  lista.innerHTML = itemsCarrito
    .map((item) => {
      const enMaximo = item.cantidad >= item.stock;
      return `
        <article class="flex gap-4 p-4 sm:p-5" data-item="${item.id}">
          <a href="producto.html?id=${item.id}" class="shrink-0">
            <img src="${escaparHtml(item.imagen_url)}" alt="${escaparHtml(item.nombre)}"
                 class="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24"
                 onerror="manejarErrorImagen(this)">
          </a>

          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <a href="producto.html?id=${item.id}" class="font-display text-base font-semibold leading-snug text-stone-900 transition hover:text-emerald-700 dark:text-stone-50 dark:hover:text-emerald-400">
                  ${escaparHtml(item.nombre)}
                </a>
                <p class="mt-0.5 text-xs text-stone-400 dark:text-stone-500">${formatearCOP(item.precio)} c/u</p>
              </div>
              <button type="button" data-accion="quitar" data-id="${item.id}"
                      aria-label="Quitar ${escaparHtml(item.nombre)} del carrito"
                      class="rounded-lg p-1.5 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:hover:bg-rose-950/40">
                ${ICONOS.basura}
              </button>
            </div>

            <div class="mt-auto flex flex-wrap items-end justify-between gap-3 pt-1">
              <div>
                <div class="inline-flex items-center rounded-lg border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950">
                  <button type="button" data-accion="menos" data-id="${item.id}" aria-label="Quitar una unidad de ${escaparHtml(item.nombre)}"
                          ${item.cantidad <= 1 ? 'disabled' : ''}
                          class="grid h-8 w-8 place-items-center rounded-l-lg text-stone-600 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-300 dark:hover:bg-stone-800">
                    ${ICONOS.menos}
                  </button>
                  <span class="w-9 text-center text-sm font-semibold text-stone-900 dark:text-stone-100">${item.cantidad}</span>
                  <button type="button" data-accion="mas" data-id="${item.id}" aria-label="Agregar una unidad de ${escaparHtml(item.nombre)}"
                          ${enMaximo ? 'disabled' : ''}
                          class="grid h-8 w-8 place-items-center rounded-r-lg text-stone-600 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-300 dark:hover:bg-stone-800">
                    ${ICONOS.mas}
                  </button>
                </div>
                ${enMaximo ? `<p class="mt-1 text-[11px] text-amber-600 dark:text-amber-400">Máximo disponible: ${item.stock}</p>` : ''}
              </div>

              <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">${formatearCOP(item.precio * item.cantidad)}</p>
            </div>
          </div>
        </article>`;
    })
    .join('');

  const unidades = itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
  const contador = document.getElementById('cantidadArticulos');
  if (contador) {
    contador.textContent = `${unidades} unidad${unidades === 1 ? '' : 'es'} · ${itemsCarrito.length} producto${itemsCarrito.length === 1 ? '' : 's'}`;
  }

  sincronizarEstadoCupon();
  renderizarTotalesCarrito();
}

function renderizarTotalesCarrito() {
  const totales = calcularTotales(itemsCarrito);

  const subtotal = document.getElementById('subtotalCarrito');
  const descuento = document.getElementById('descuentoCarrito');
  const filaDescuento = document.getElementById('filaDescuento');
  const envio = document.getElementById('envioCarrito');
  const total = document.getElementById('totalCarrito');
  const mensajeEnvio = document.getElementById('mensajeEnvio');
  const barraEnvio = document.getElementById('barraEnvio');

  if (subtotal) subtotal.textContent = formatearCOP(totales.subtotal);
  if (descuento) descuento.textContent = `-${formatearCOP(totales.descuento)}`;
  filaDescuento?.classList.toggle('hidden', totales.descuento === 0);
  if (envio) envio.textContent = totales.envio === 0 ? 'Gratis' : formatearCOP(totales.envio);
  if (total) total.textContent = formatearCOP(totales.total);

  const porcentaje = Math.min(
    100,
    Math.round((totales.subtotal / TIENDA_CONFIG.ENVIO.GRATIS_DESDE) * 100)
  );

  if (barraEnvio) barraEnvio.style.width = `${porcentaje}%`;

  if (mensajeEnvio) {
    mensajeEnvio.textContent =
      totales.envio === 0
        ? '¡Tu pedido tiene envío gratis!'
        : `Te faltan ${formatearCOP(totales.faltaParaEnvio)} para el envío gratis.`;
  }
}

function manejarAccionCarrito(evento) {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton) return;

  const id = Number(boton.dataset.id);
  const accion = boton.dataset.accion;
  const item = itemsCarrito.find((elemento) => elemento.id === id);
  if (!item) return;

  if (accion === 'quitar') {
    quitarDelCarrito(id);
    itemsCarrito = itemsCarrito.filter((elemento) => elemento.id !== id);
    mostrarToast(`${item.nombre} salió del carrito`, 'info');

    if (itemsCarrito.length === 0) {
      renderizarAvisosCarrito([]);
      mostrarPantallaCarrito('carritoVacio');
    } else {
      renderizarCarritoPagina();
    }
    return;
  }

  const nuevaCantidad = accion === 'mas' ? item.cantidad + 1 : item.cantidad - 1;
  const resultado = actualizarCantidad(item, nuevaCantidad);

  if (!resultado.ok) {
    mostrarToast(resultado.mensaje, 'error');
    return;
  }

  item.cantidad = nuevaCantidad;
  renderizarCarritoPagina();
}

function vaciarTodoElCarrito() {
  const confirmado = window.confirm('¿Seguro que quieres vaciar el carrito?');
  if (!confirmado) return;

  vaciarCarrito();
  itemsCarrito = [];
  renderizarAvisosCarrito([]);
  mostrarPantallaCarrito('carritoVacio');
  mostrarToast('Carrito vaciado', 'info');
}

/* ----------------------------- Cupón ----------------------------- */

function sincronizarEstadoCupon() {
  const codigo = obtenerCupon();
  const cupon = codigo ? TIENDA_CONFIG.CUPONES[codigo] : null;
  const formulario = document.getElementById('formCupon');
  const caja = document.getElementById('cuponAplicado');
  const input = document.getElementById('inputCupon');

  formulario?.classList.toggle('hidden', Boolean(cupon));
  caja?.classList.toggle('hidden', !cupon);
  caja?.classList.toggle('flex', Boolean(cupon));
  if (input && cupon) input.value = '';
}

function aplicarCuponDesdeFormulario(evento) {
  evento.preventDefault();
  const input = document.getElementById('inputCupon');
  if (!input) return;

  const resultado = aplicarCupon(input.value);

  if (!resultado.ok) {
    mostrarMensajeCupon(resultado.mensaje, 'error');
    return;
  }

  input.value = '';
  sincronizarEstadoCupon();
  renderizarTotalesCarrito();
  mostrarMensajeCupon(resultado.mensaje, 'exito');
  mostrarToast('Cupón aplicado', 'exito');
}

function quitarCuponAplicado() {
  quitarCupon();
  sincronizarEstadoCupon();
  renderizarTotalesCarrito();
  mostrarMensajeCupon('Cupón eliminado.', 'exito');
  mostrarToast('Cupón eliminado', 'info');
}

document.addEventListener('DOMContentLoaded', iniciarPaginaCarrito);
