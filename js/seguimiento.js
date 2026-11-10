// Seguimiento de pedido: consulta número + correo en la API y muestra estado,
// línea de tiempo, productos y datos de entrega.

const PASOS_PEDIDO = [
  { estado: 'confirmado', etiqueta: 'Confirmado', mensaje: 'Recibimos tu pedido y verificamos la disponibilidad de cada planta.' },
  { estado: 'preparando', etiqueta: 'Preparando', mensaje: 'Estamos alistando tus productos con cuidado, listos para salir.' },
  { estado: 'enviado', etiqueta: 'En camino', mensaje: 'Tu pedido va en camino. Llega en 2 a 3 días hábiles.' },
  { estado: 'entregado', etiqueta: 'Entregado', mensaje: '¡Entregado! Esperamos que todo haya llegado en perfectas condiciones.' }
];

const FORMATO_PEDIDO = /^PED-[A-F0-9]{6,20}$/;
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function iniciarSeguimiento() {
  const formulario = document.getElementById('formSeguimiento');
  const input = document.getElementById('numeroPedidoInput');
  const correo = document.getElementById('correoPedidoInput');
  if (!formulario || !input || !correo) return;

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    consultarPedido(input.value, correo.value);
  });

  input.addEventListener('input', () => {
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20);
    limpiarErrorSeguimiento();
  });

  correo.addEventListener('input', limpiarErrorSeguimiento);

  // Permite llegar desde la confirmación con ?pedido=PED-...
  const desdeUrl = new URLSearchParams(window.location.search).get('pedido');
  if (desdeUrl) {
    input.value = desdeUrl.toUpperCase();
    correo.focus();
  }
}

function consultarPedido(valorNumero, valorCorreo) {
  const numero = String(valorNumero ?? '').trim().toUpperCase();
  const correo = String(valorCorreo ?? '').trim().toLowerCase();

  if (!numero) {
    mostrarErrorSeguimiento('Escribe tu número de pedido para consultarlo.');
    document.getElementById('numeroPedidoInput')?.focus();
    return;
  }

  if (!FORMATO_PEDIDO.test(numero)) {
    mostrarErrorSeguimiento('El número debe tener el formato PED- seguido de letras y números, por ejemplo PED-1A2B3C4D5E.');
    document.getElementById('numeroPedidoInput')?.focus();
    return;
  }

  if (!FORMATO_CORREO.test(correo)) {
    mostrarErrorSeguimiento('Ingresa el correo con el que hiciste el pedido.');
    document.getElementById('correoPedidoInput')?.focus();
    return;
  }

  limpiarErrorSeguimiento();

  // Refleja el número en la URL para poder compartir el enlace (sin el correo).
  try {
    window.history.replaceState({}, '', `seguimiento.html?pedido=${encodeURIComponent(numero)}`);
  } catch {
    // file:// puede bloquear replaceState; la consulta continúa igual.
  }

  buscarPedido(numero, correo);
}

async function buscarPedido(numero, correo) {
  mostrarPantallaSeguimiento('cargandoSeguimiento');

  try {
    const { pedido } = await TiendaAPI.obtenerPedido(numero, correo);
    renderizarSeguimiento(pedido);
    mostrarPantallaSeguimiento('detalleSeguimiento');
  } catch (error) {
    if (error.estado === 404 || error.estado === 400) {
      mostrarResultadoVacio(
        `No encontramos un pedido con el número ${numero} y ese correo. Revisa que ambos estén bien escritos.`
      );
      mostrarPantallaSeguimiento('resultadoSeguimiento');
      return;
    }

    const contenedor = document.getElementById('resultadoSeguimiento');
    if (contenedor) {
      mostrarErrorCarga(contenedor, error.message, () => buscarPedido(numero, correo));
    }
    mostrarPantallaSeguimiento('resultadoSeguimiento');
  }
}

function mostrarPantallaSeguimiento(idVisible) {
  ['cargandoSeguimiento', 'resultadoSeguimiento', 'detalleSeguimiento'].forEach((id) => {
    document.getElementById(id)?.classList.toggle('hidden', id !== idVisible);
  });
}

function mostrarResultadoVacio(mensaje) {
  const contenedor = document.getElementById('resultadoSeguimiento');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center dark:border-stone-700 dark:bg-stone-900/60">
      <span class="text-5xl" aria-hidden="true">📦</span>
      <h2 class="mt-4 font-display text-2xl font-semibold text-stone-900 dark:text-stone-50">Pedido no encontrado</h2>
      <p class="mx-auto mt-2 max-w-md text-sm text-stone-500 dark:text-stone-400">${escaparHtml(mensaje)}</p>
      <a href="index.html#catalogo" class="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
        Volver al catálogo
      </a>
    </div>`;
}

function mostrarErrorSeguimiento(mensaje) {
  const error = document.getElementById('errorSeguimiento');
  const input = document.getElementById('numeroPedidoInput');
  if (error) error.textContent = mensaje;
  if (input) input.setAttribute('aria-invalid', 'true');
}

function limpiarErrorSeguimiento() {
  const error = document.getElementById('errorSeguimiento');
  const input = document.getElementById('numeroPedidoInput');
  if (error) error.textContent = '';
  if (input) input.setAttribute('aria-invalid', 'false');
}

function renderizarSeguimiento(pedido) {
  const numero = document.getElementById('numeroPedidoDetalle');
  if (numero) numero.textContent = pedido.numero_pedido;

  const estado = document.getElementById('estadoPedidoDetalle');
  if (estado) {
    estado.textContent = etiquetaEstado(pedido.estado);
    estado.className = `rounded-full px-3 py-1 text-xs font-semibold ${clasesEstadoPedido(pedido.estado)}`;
  }

  const fecha = document.getElementById('fechaPedidoDetalle');
  if (fecha) fecha.textContent = `Creado el ${formatearFecha(pedido.creado_en)}`;

  renderizarLineaTiempo(pedido.estado);

  const items = document.getElementById('itemsSeguimiento');
  if (items) items.innerHTML = htmlItemsPedido(pedido.items ?? []);

  const totales = document.getElementById('totalesSeguimiento');
  if (totales) totales.innerHTML = htmlTotalesPedido(pedido);

  const entrega = document.getElementById('entregaSeguimiento');
  if (entrega) entrega.innerHTML = htmlDatosEntregaPedido(pedido);
}

function renderizarLineaTiempo(estadoActual) {
  const contenedor = document.getElementById('lineaTiempo');
  const mensaje = document.getElementById('mensajeEstado');
  if (!contenedor) return;

  let indiceActual = PASOS_PEDIDO.findIndex((paso) => paso.estado === estadoActual);
  if (indiceActual < 0) indiceActual = 0;

  // La barra une los centros de los extremos: 12,5 % a 87,5 % en 4 columnas.
  const avance = (indiceActual / (PASOS_PEDIDO.length - 1)) * 75;

  contenedor.innerHTML = `
    <div class="relative">
      <div class="absolute left-[12.5%] right-[12.5%] top-[17px] hidden h-1 rounded-full bg-stone-200 sm:block dark:bg-stone-800" aria-hidden="true"></div>
      <div class="absolute left-[12.5%] top-[17px] hidden h-1 rounded-full bg-emerald-600 transition-all duration-700 sm:block dark:bg-emerald-500" style="width: ${avance}%" aria-hidden="true"></div>
      <ol class="grid gap-6 sm:grid-cols-4 sm:gap-2">
    ${PASOS_PEDIDO.map((paso, indice) => {
      const completado = indice <= indiceActual;
      const actual = indice === indiceActual;
      return `
        <li class="relative flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition ${
            completado
              ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-emerald-950'
              : 'border-stone-300 bg-white text-stone-400 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-500'
          } ${actual ? 'ring-4 ring-emerald-100 dark:ring-emerald-950/60' : ''}">
            ${completado ? ICONOS.check.replace('h-5 w-5', 'h-4 w-4') : String(indice + 1).padStart(2, '0')}
          </span>
          <div class="min-w-0">
            <p class="text-sm font-semibold ${
              actual
                ? 'text-emerald-800 dark:text-emerald-300'
                : completado
                  ? 'text-stone-800 dark:text-stone-200'
                  : 'text-stone-400 dark:text-stone-500'
            }">${paso.etiqueta}</p>
            ${actual ? '<p class="mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Estado actual</p>' : ''}
          </div>
          ${indice < PASOS_PEDIDO.length - 1 ? '<span class="ml-auto h-px w-6 bg-stone-200 sm:hidden dark:bg-stone-800" aria-hidden="true"></span>' : ''}
        </li>`;
    }).join('')}
      </ol>
    </div>
  `;

  if (mensaje) {
    mensaje.textContent = PASOS_PEDIDO[indiceActual].mensaje;
  }
}

document.addEventListener('DOMContentLoaded', iniciarSeguimiento);
