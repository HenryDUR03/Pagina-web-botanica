// Checkout: revalida el carrito, valida el formulario en el navegador y crea
// el pedido en la API. Los datos de tarjeta nunca salen del navegador.

let itemsCheckout = [];
let checkoutListo = false;
let intentoEnvio = false;
let enviando = false;

const REGLAS_CHECKOUT = [
  {
    id: 'nombreEnvio',
    errorId: 'errorNombreEnvio',
    mensaje: 'Ingresa tu nombre completo (mínimo 3 caracteres).',
    validar: (valor) => valor.length >= 3
  },
  {
    id: 'correoEnvio',
    errorId: 'errorCorreoEnvio',
    mensaje: 'Ingresa un correo electrónico válido.',
    validar: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)
  },
  {
    id: 'telefonoEnvio',
    errorId: 'errorTelefonoEnvio',
    mensaje: 'El teléfono debe tener entre 7 y 15 dígitos.',
    validar: (valor) => {
      const digitos = valor.replace(/\D/g, '');
      return digitos.length >= 7 && digitos.length <= 15;
    }
  },
  {
    id: 'direccionEnvio',
    errorId: 'errorDireccionEnvio',
    mensaje: 'La dirección debe tener al menos 5 caracteres.',
    validar: (valor) => valor.length >= 5
  },
  {
    id: 'ciudadEnvio',
    errorId: 'errorCiudadEnvio',
    mensaje: 'Ingresa tu ciudad.',
    validar: (valor) => valor.length >= 2
  },
  {
    id: 'nombreTarjeta',
    errorId: 'errorNombreTarjeta',
    mensaje: 'Escribe el nombre como aparece en la tarjeta.',
    validar: (valor) => valor.length >= 3
  },
  {
    id: 'numeroTarjeta',
    errorId: 'errorNumeroTarjeta',
    mensaje: 'El número de tarjeta debe tener 16 dígitos.',
    validar: (valor) => valor.replace(/\D/g, '').length === 16
  },
  {
    id: 'vencimientoTarjeta',
    errorId: 'errorVencimientoTarjeta',
    mensaje: 'Usa el formato MM/AA con una fecha vigente.',
    validar: validarVencimientoTarjeta
  },
  {
    id: 'cvvTarjeta',
    errorId: 'errorCvvTarjeta',
    mensaje: 'El CVV debe tener 3 dígitos.',
    validar: (valor) => /^\d{3}$/.test(valor)
  }
];

const CAMPOS_SERVIDOR = {
  'cliente.nombre': 'nombreEnvio',
  'cliente.correo': 'correoEnvio',
  'cliente.telefono': 'telefonoEnvio',
  'cliente.direccion': 'direccionEnvio',
  'cliente.ciudad': 'ciudadEnvio'
};

function iniciarCheckout() {
  conectarFormularioCheckout();
  cargarDatosCheckout();
}

function conectarFormularioCheckout() {
  const formulario = document.getElementById('formCheckout');
  if (!formulario || formulario.dataset.conectado === 'true') return;
  formulario.dataset.conectado = 'true';

  REGLAS_CHECKOUT.forEach((regla) => {
    const input = document.getElementById(regla.id);
    if (!input) return;

    input.addEventListener('input', () => {
      formatearCampoCheckout(input);
      if (input.getAttribute('aria-invalid') === 'true') validarReglaCheckout(regla);
    });

    input.addEventListener('blur', () => {
      if (intentoEnvio || input.value.trim() !== '') validarReglaCheckout(regla);
    });
  });

  formulario.addEventListener('submit', enviarPedido);
}

async function cargarDatosCheckout() {
  const guardados = obtenerCarrito();
  checkoutListo = false;

  if (guardados.length === 0) {
    mostrarPantallaCheckout('checkoutVacio');
    actualizarContadorCarrito();
    return;
  }

  mostrarPantallaCheckout('cargandoCheckout');
  ocultarAlertaCheckout();
  renderizarAvisosCheckout([]);

  try {
    const { items, avisos } = await revalidarCarrito();
    itemsCheckout = items;

    if (itemsCheckout.length === 0) {
      mostrarPantallaCheckout('checkoutVacio');
      return;
    }

    renderizarResumenCheckout();
    renderizarAvisosCheckout(avisos);
    mostrarPantallaCheckout('checkoutContenido');
    checkoutListo = true;
  } catch (error) {
    mostrarPantallaCheckout('errorCheckout');
    mostrarErrorCarga(document.getElementById('errorCheckout'), error.message, cargarDatosCheckout);
  }
}

function mostrarPantallaCheckout(idVisible) {
  ['cargandoCheckout', 'errorCheckout', 'checkoutVacio', 'checkoutContenido'].forEach((id) => {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    elemento.classList.toggle('hidden', id !== idVisible);
    if (id === 'checkoutContenido' && id === idVisible) elemento.classList.add('grid');
  });
}

function renderizarResumenCheckout() {
  const contenedor = document.getElementById('resumenProductos');
  if (!contenedor) return;

  contenedor.innerHTML = itemsCheckout
    .map(
      (item) => `
        <div class="flex items-center gap-3">
          <img src="${escaparHtml(item.imagen_url)}" alt="${escaparHtml(item.nombre)}"
               class="h-14 w-14 shrink-0 rounded-lg object-cover"
               onerror="manejarErrorImagen(this)">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-stone-800 dark:text-stone-200">${escaparHtml(item.nombre)}</p>
            <p class="text-xs text-stone-400 dark:text-stone-500">${item.cantidad} × ${formatearCOP(item.precio)}</p>
          </div>
          <p class="shrink-0 text-sm font-semibold text-stone-800 dark:text-stone-200">${formatearCOP(item.precio * item.cantidad)}</p>
        </div>`
    )
    .join('');

  const unidades = itemsCheckout.reduce((total, item) => total + item.cantidad, 0);
  const contador = document.getElementById('cantidadResumenCheckout');
  if (contador) contador.textContent = `${unidades} unidad${unidades === 1 ? '' : 'es'}`;

  const totales = calcularTotales(itemsCheckout);

  const subtotal = document.getElementById('subtotalCheckout');
  const descuento = document.getElementById('descuentoCheckout');
  const filaDescuento = document.getElementById('filaDescuentoCheckout');
  const envio = document.getElementById('envioCheckout');
  const total = document.getElementById('totalCheckout');
  const mensajeEnvio = document.getElementById('mensajeEnvioCheckout');
  const cuponTexto = document.getElementById('cuponCheckout');

  if (subtotal) subtotal.textContent = formatearCOP(totales.subtotal);
  if (descuento) descuento.textContent = `-${formatearCOP(totales.descuento)}`;
  filaDescuento?.classList.toggle('hidden', totales.descuento === 0);
  if (envio) envio.textContent = totales.envio === 0 ? 'Gratis' : formatearCOP(totales.envio);
  if (total) total.textContent = formatearCOP(totales.total);

  if (cuponTexto) {
    cuponTexto.textContent = totales.cupon
      ? `Cupón ${totales.cupon.codigo} aplicado`
      : 'Sin cupón aplicado';
    cuponTexto.className = totales.cupon
      ? 'font-semibold text-emerald-700 dark:text-emerald-400'
      : 'text-stone-400 dark:text-stone-500';
  }

  if (mensajeEnvio) {
    mensajeEnvio.textContent =
      totales.envio === 0
        ? 'Envío gratis incluido en tu pedido.'
        : `Envío estándar: ${formatearCOP(totales.envio)}. Gratis desde ${formatearCOP(TIENDA_CONFIG.ENVIO.GRATIS_DESDE)}.`;
  }
}

function renderizarAvisosCheckout(avisos) {
  const contenedor = document.getElementById('avisosCheckout');
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

/* --------------------------- Validación --------------------------- */

function validarVencimientoTarjeta(valor) {
  const coincidencia = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(valor);
  if (!coincidencia) return false;

  const mes = Number(coincidencia[1]);
  const anio = 2000 + Number(coincidencia[2]);
  const ahora = new Date();
  const anioActual = ahora.getFullYear();
  const mesActual = ahora.getMonth() + 1;

  return anio > anioActual || (anio === anioActual && mes >= mesActual);
}

function formatearCampoCheckout(input) {
  if (input.id === 'numeroTarjeta') {
    const digitos = input.value.replace(/\D/g, '').slice(0, 16);
    input.value = digitos.replace(/(.{4})/g, '$1 ').trim();
    return;
  }

  if (input.id === 'vencimientoTarjeta') {
    const digitos = input.value.replace(/\D/g, '').slice(0, 4);
    input.value =
      digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
    return;
  }

  if (input.id === 'cvvTarjeta') {
    input.value = input.value.replace(/\D/g, '').slice(0, 3);
    return;
  }

  if (input.id === 'telefonoEnvio') {
    input.value = input.value.replace(/[^\d\s+()-]/g, '').slice(0, 20);
  }
}

function validarReglaCheckout(regla) {
  const input = document.getElementById(regla.id);
  if (!input) return true;

  const valor = input.value.trim();
  let mensaje = '';

  if (!valor) {
    mensaje = 'Este campo es obligatorio.';
  } else if (!regla.validar(valor)) {
    mensaje = regla.mensaje;
  }

  aplicarErrorCampo(input, regla.errorId, mensaje);
  return mensaje === '';
}

function aplicarErrorCampo(input, errorId, mensaje) {
  const contenedorError = document.getElementById(errorId);
  if (contenedorError) contenedorError.textContent = mensaje;
  input.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
}

function validarFormularioCheckout() {
  let valido = true;
  let primerInvalido = null;

  REGLAS_CHECKOUT.forEach((regla) => {
    const reglaValida = validarReglaCheckout(regla);
    if (!reglaValida) {
      valido = false;
      if (!primerInvalido) primerInvalido = document.getElementById(regla.id);
    }
  });

  primerInvalido?.focus();
  return valido;
}

/* ----------------------------- Pedido ----------------------------- */

async function enviarPedido(evento) {
  evento.preventDefault();
  if (!checkoutListo || enviando) return;

  intentoEnvio = true;
  ocultarAlertaCheckout();

  if (!validarFormularioCheckout()) {
    mostrarAlertaCheckout('Revisa los campos marcados antes de continuar.', 'error');
    return;
  }

  const cliente = {
    nombre: document.getElementById('nombreEnvio').value.trim(),
    correo: document.getElementById('correoEnvio').value.trim(),
    telefono: document.getElementById('telefonoEnvio').value.trim(),
    direccion: document.getElementById('direccionEnvio').value.trim(),
    ciudad: document.getElementById('ciudadEnvio').value.trim()
  };

  // Solo se envían ids y cantidades. Los precios los recalcula el servidor.
  const cuerpo = {
    cliente,
    items: itemsCheckout.map((item) => ({ producto_id: item.id, cantidad: item.cantidad })),
    cupon: obtenerCupon() || null,
    metodo_pago: 'tarjeta_simulada'
  };

  enviando = true;
  bloquearBotonCheckout(true);

  try {
    const { pedido } = await TiendaAPI.crearPedido(cuerpo);

    // Guardamos el pedido devuelto por la API para mostrarlo al instante en la
    // confirmación, sin necesidad de consultar de nuevo ni exponer el correo.
    try {
      sessionStorage.setItem(TIENDA_CONFIG.CLAVES.ULTIMO_PEDIDO, JSON.stringify(pedido));
    } catch {
      // Si el navegador bloquea sessionStorage, la confirmación mostrará una guía.
    }

    vaciarCarrito();
    quitarCupon();
    window.location.href = `confirmacion.html?pedido=${encodeURIComponent(pedido.numero_pedido)}`;
  } catch (error) {
    manejarErrorPedido(error);
    enviando = false;
    bloquearBotonCheckout(false);
  }
}

function manejarErrorPedido(error) {
  if (error.codigo === 'STOCK_INSUFICIENTE') {
    const detalles = (error.detalles ?? []).map(
      (item) =>
        `${item.nombre ?? 'Producto'}: pediste ${item.solicitado ?? '?'} y hay ${item.disponible ?? 0}.`
    );

    mostrarAlertaCheckout(
      'Alguien más compró antes que tú. Ajusta tu carrito para continuar.',
      'error',
      detalles,
      {
        texto: 'Actualizar carrito',
        alHacer: () => {
          ocultarAlertaCheckout();
          cargarDatosCheckout();
        }
      }
    );
    return;
  }

  if (error.codigo === 'CUPON_INVALIDO') {
    quitarCupon();
    renderizarResumenCheckout();
    mostrarAlertaCheckout('El cupón ya no es válido y lo quitamos del pedido.', 'error');
    return;
  }

  if (error.codigo === 'DATOS_INVALIDOS') {
    aplicarErroresServidor(error.detalles ?? []);
    mostrarAlertaCheckout('Revisa los datos del formulario e intenta de nuevo.', 'error');
    return;
  }

  mostrarAlertaCheckout(error.message, 'error');
}

function aplicarErroresServidor(detalles) {
  detalles.forEach((detalle) => {
    const inputId = CAMPOS_SERVIDOR[detalle.campo];
    if (!inputId) return;
    const regla = REGLAS_CHECKOUT.find((item) => item.id === inputId);
    const input = document.getElementById(inputId);
    if (input && regla) aplicarErrorCampo(input, regla.errorId, detalle.mensaje);
  });
}

function bloquearBotonCheckout(bloqueado) {
  const boton = document.getElementById('btnConfirmarCompra');
  if (!boton) return;

  boton.disabled = bloqueado;
  boton.innerHTML = bloqueado
    ? `<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.25" stroke-width="3"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><span>Procesando…</span>`
    : `Confirmar compra <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
}

/* ----------------------------- Alertas ---------------------------- */

function mostrarAlertaCheckout(mensaje, tipo = 'error', detalles = [], accion = null) {
  const contenedor = document.getElementById('alertaCheckout');
  if (!contenedor) return;

  const estilos =
    tipo === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
      : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200';

  const lista = detalles.length
    ? `<ul class="mt-1.5 list-disc space-y-0.5 pl-4 text-xs">${detalles
        .map((detalle) => `<li>${escaparHtml(detalle)}</li>`)
        .join('')}</ul>`
    : '';

  contenedor.className = `mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${estilos}`;
  contenedor.innerHTML = `
    <span class="mt-0.5 shrink-0" aria-hidden="true">${ICONOS.alerta}</span>
    <div class="min-w-0 flex-1">
      <p>${escaparHtml(mensaje)}</p>
      ${lista}
    </div>`;
  contenedor.classList.remove('hidden');

  if (accion) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className =
      'mt-2 rounded-lg border border-current/30 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current dark:hover:bg-black/10';
    boton.textContent = accion.texto;
    boton.addEventListener('click', accion.alHacer);
    contenedor.querySelector('div')?.appendChild(boton);
  }

  contenedor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ocultarAlertaCheckout() {
  const contenedor = document.getElementById('alertaCheckout');
  if (!contenedor) return;
  contenedor.classList.add('hidden');
  contenedor.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', iniciarCheckout);
