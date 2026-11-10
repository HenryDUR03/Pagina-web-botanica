// Confirmación: usa el pedido devuelto por la API al crear la compra. Se
// guarda en sessionStorage para no repetir la consulta ni exponer el correo.
// El carrito se vacía en el checkout, no aquí.

function leerUltimoPedido() {
  try {
    const datos = JSON.parse(sessionStorage.getItem(TIENDA_CONFIG.CLAVES.ULTIMO_PEDIDO) ?? 'null');
    return datos && typeof datos === 'object' ? datos : null;
  } catch {
    return null;
  }
}

function iniciarConfirmacion() {
  const numero = new URLSearchParams(window.location.search).get('pedido');
  const pedido = leerUltimoPedido();

  if (pedido && pedido.numero_pedido && (!numero || pedido.numero_pedido === numero.toUpperCase())) {
    document.title = `Pedido ${pedido.numero_pedido} · Raíz & Hoja`;
    renderizarConfirmacion(pedido);
    return;
  }

  if (!numero) {
    mostrarErrorConfirmacion(
      'No encontramos el número de pedido. Si acabas de comprar, revisa el enlace de confirmación.'
    );
    return;
  }

  mostrarErrorConfirmacion(
    `Ya no tenemos el detalle del pedido ${numero} en esta sesión. Puedes consultarlo con tu número y correo en el seguimiento.`
  );
}

/* Compatibilidad con la recarga: si se guardó el pedido, no hay consulta. */
async function cargarPedidoConfirmacion() {
  iniciarConfirmacion();
}

function mostrarCargandoConfirmacion(visible) {
  document.getElementById('cargandoConfirmacion')?.classList.toggle('hidden', !visible);
  if (visible) {
    document.getElementById('contenidoConfirmacion')?.classList.add('hidden');
    document.getElementById('errorConfirmacion')?.classList.add('hidden');
  }
}

function mostrarErrorConfirmacion(mensaje, alReintentar = null) {
  mostrarCargandoConfirmacion(false);

  const contenedor = document.getElementById('errorConfirmacion');
  if (!contenedor) return;

  contenedor.classList.remove('hidden');

  if (alReintentar) {
    mostrarErrorCarga(contenedor, mensaje, alReintentar);
    return;
  }

  contenedor.innerHTML = `
    <div class="rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center dark:border-stone-700 dark:bg-stone-900/60">
      <span class="text-5xl" aria-hidden="true">📦</span>
      <h1 class="mt-4 font-display text-2xl font-semibold text-stone-900 sm:text-3xl dark:text-stone-50">No pudimos mostrar el pedido</h1>
      <p class="mx-auto mt-2 max-w-md text-sm text-stone-500 dark:text-stone-400">${escaparHtml(mensaje)}</p>
      <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <a href="seguimiento.html" class="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Buscar mi pedido</a>
        <a href="index.html#catalogo" class="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-emerald-300 hover:text-emerald-800 dark:border-stone-700 dark:text-stone-200">Volver al catálogo</a>
      </div>
    </div>`;
}

function renderizarConfirmacion(pedido) {
  mostrarCargandoConfirmacion(false);

  const contenido = document.getElementById('contenidoConfirmacion');
  if (!contenido) return;
  contenido.classList.remove('hidden');

  const numero = document.getElementById('numeroPedido');
  if (numero) numero.textContent = pedido.numero_pedido;

  const estado = document.getElementById('estadoPedido');
  if (estado) {
    estado.textContent = etiquetaEstado(pedido.estado);
    estado.className = `rounded-full px-3 py-1 font-semibold ${clasesEstadoPedido(pedido.estado)}`;
  }

  const fecha = document.getElementById('fechaPedido');
  if (fecha) fecha.textContent = formatearFecha(pedido.creado_en);

  const enlaceSeguimiento = document.getElementById('enlaceSeguimientoPedido');
  if (enlaceSeguimiento) {
    enlaceSeguimiento.href = `seguimiento.html?pedido=${encodeURIComponent(pedido.numero_pedido)}`;
  }

  const items = document.getElementById('itemsConfirmacion');
  if (items) items.innerHTML = htmlItemsPedido(pedido.items ?? []);

  const totales = document.getElementById('totalesConfirmacion');
  if (totales) totales.innerHTML = htmlTotalesPedido(pedido);

  const entrega = document.getElementById('datosEntrega');
  if (entrega) entrega.innerHTML = htmlDatosEntregaPedido(pedido);
}

document.addEventListener('DOMContentLoaded', iniciarConfirmacion);
