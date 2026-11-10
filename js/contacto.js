// Contacto: formulario simulado con validación en el navegador.
// No envía datos a ningún servidor ni los guarda.

const REGLAS_CONTACTO = [
  {
    id: 'nombreContacto',
    errorId: 'errorNombreContacto',
    mensaje: 'Ingresa tu nombre (mínimo 3 caracteres).',
    validar: (valor) => valor.length >= 3 && valor.length <= 120
  },
  {
    id: 'correoContacto',
    errorId: 'errorCorreoContacto',
    mensaje: 'Ingresa un correo electrónico válido.',
    validar: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)
  },
  {
    id: 'telefonoContacto',
    errorId: 'errorTelefonoContacto',
    mensaje: 'Si escribes un teléfono, debe tener entre 7 y 15 dígitos.',
    validar: (valor) => {
      if (!valor) return true;
      const digitos = valor.replace(/\D/g, '');
      return digitos.length >= 7 && digitos.length <= 15;
    }
  },
  {
    id: 'asuntoContacto',
    errorId: 'errorAsuntoContacto',
    mensaje: 'Selecciona el motivo de tu mensaje.',
    validar: (valor) => valor !== ''
  },
  {
    id: 'mensajeContacto',
    errorId: 'errorMensajeContacto',
    mensaje: 'Cuéntanos un poco más (mínimo 10 caracteres).',
    validar: (valor) => valor.length >= 10 && valor.length <= 600
  }
];

function iniciarContacto() {
  const formulario = document.getElementById('formContacto');
  if (!formulario) return;

  const mensaje = document.getElementById('mensajeContacto');
  const contador = document.getElementById('contadorMensaje');

  const actualizarContador = () => {
    if (!mensaje || !contador) return;
    contador.textContent = `${mensaje.value.length} / 600`;
  };

  actualizarContador();

  mensaje?.addEventListener('input', actualizarContador);

  // Limpia el error del campo mientras la persona corrige.
  REGLAS_CONTACTO.forEach((regla) => {
    const campo = document.getElementById(regla.id);
    campo?.addEventListener('input', () => limpiarErrorContacto(regla));
    campo?.addEventListener('change', () => limpiarErrorContacto(regla));
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const primerInvalido = validarFormularioContacto();
    if (primerInvalido) {
      primerInvalido.focus();
      return;
    }

    const nombre = document.getElementById('nombreContacto')?.value.trim() || '';
    const exito = document.getElementById('exitoContacto');

    if (exito) {
      exito.textContent = `¡Gracias, ${nombre}! Recibimos tu mensaje de prueba. Como el formulario es simulado, no se envió nada: si necesitas respuesta, escríbenos a hola@raizyhoja.co.`;
      exito.classList.remove('hidden');
      exito.focus?.();
    }

    formulario.reset();
    actualizarContador();
    limpiarTodosLosErroresContacto();
    mostrarToast('Mensaje simulado enviado. No se enviaron datos reales.', 'info');
  });
}

function validarFormularioContacto() {
  let primerInvalido = null;

  REGLAS_CONTACTO.forEach((regla) => {
    const campo = document.getElementById(regla.id);
    const error = document.getElementById(regla.errorId);
    if (!campo || !error) return;

    const valor = campo.value.trim();
    const valido = regla.validar(valor);

    if (valido) {
      limpiarErrorContacto(regla);
      return;
    }

    error.textContent = regla.mensaje;
    campo.setAttribute('aria-invalid', 'true');
    campo.classList.add('campo-error');
    if (!primerInvalido) primerInvalido = campo;
  });

  return primerInvalido;
}

function limpiarErrorContacto(regla) {
  const campo = document.getElementById(regla.id);
  const error = document.getElementById(regla.errorId);
  if (!campo || !error) return;

  error.textContent = '';
  campo.removeAttribute('aria-invalid');
  campo.classList.remove('campo-error');
}

function limpiarTodosLosErroresContacto() {
  REGLAS_CONTACTO.forEach(limpiarErrorContacto);
}

document.addEventListener('DOMContentLoaded', iniciarContacto);
