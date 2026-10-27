// Lógica de checkout (checkout.html)

// Cargar checkout
function cargarCheckout() {
  const carritoCompleto = obtenerCarritoCompleto();
  const checkoutConProductos = document.getElementById('checkoutConProductos');
  const checkoutVacio = document.getElementById('checkoutVacio');
  const resumenProductos = document.getElementById('resumenProductos');
  const subtotalEl = document.getElementById('subtotalCheckout');
  const totalEl = document.getElementById('totalCheckout');
  
  if (carritoCompleto.length === 0) {
    if (checkoutConProductos) checkoutConProductos.classList.add('hidden');
    if (checkoutVacio) checkoutVacio.classList.remove('hidden');
    return;
  }
  
  if (checkoutConProductos) checkoutConProductos.classList.remove('hidden');
  if (checkoutVacio) checkoutVacio.classList.add('hidden');
  
  // Renderizar resumen de productos
  if (resumenProductos) {
    resumenProductos.innerHTML = '';
    carritoCompleto.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'flex gap-3 pb-3 border-b border-gray-100';
      itemDiv.innerHTML = `
        <img 
          src="${item.imagen}" 
          alt="${item.nombre}"
          class="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          onerror="this.src='https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop'"
        >
        <div class="flex-grow min-w-0">
          <p class="text-sm font-semibold text-gray-800 truncate">${escapeHtml(item.nombre)}</p>
          <p class="text-xs text-gray-600">${item.cantidad} x ${formatearCOP(item.precio)}</p>
          <p class="text-sm font-bold text-green-700">${formatearCOP(item.subtotal)}</p>
        </div>
      `;
      resumenProductos.appendChild(itemDiv);
    });
  }
  
  // Calcular totales
  const total = calcularTotalCarrito();
  if (subtotalEl) subtotalEl.textContent = formatearCOP(total);
  if (totalEl) totalEl.textContent = formatearCOP(total);
  
  // Agregar máscaras a campos de tarjeta
  const numeroTarjeta = document.getElementById('numeroTarjeta');
  const vencimientoTarjeta = document.getElementById('vencimientoTarjeta');
  const cvvTarjeta = document.getElementById('cvvTarjeta');
  const telefonoEnvio = document.getElementById('telefonoEnvio');
  
  if (numeroTarjeta) {
    numeroTarjeta.addEventListener('input', function(e) {
      // Solo permitir números
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }
  
  if (vencimientoTarjeta) {
    vencimientoTarjeta.addEventListener('input', function(e) {
      let value = e.target.value.replace(/[^0-9]/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }
  
  if (cvvTarjeta) {
    cvvTarjeta.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }
  
  if (telefonoEnvio) {
    telefonoEnvio.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }
}

// Procesar compra con validación
function procesarCompra() {
  // Limpiar errores anteriores
  limpiarErrores();
  
  // Obtener valores
  const nombreEnvio = document.getElementById('nombreEnvio').value.trim();
  const correoEnvio = document.getElementById('correoEnvio').value.trim();
  const telefonoEnvio = document.getElementById('telefonoEnvio').value.trim();
  const direccionEnvio = document.getElementById('direccionEnvio').value.trim();
  const ciudadEnvio = document.getElementById('ciudadEnvio').value.trim();
  
  const nombreTarjeta = document.getElementById('nombreTarjeta').value.trim();
  const numeroTarjeta = document.getElementById('numeroTarjeta').value.trim();
  const vencimientoTarjeta = document.getElementById('vencimientoTarjeta').value.trim();
  const cvvTarjeta = document.getElementById('cvvTarjeta').value.trim();
  
  let esValido = true;
  
  // Validar datos de envío
  if (!nombreEnvio) {
    mostrarError('errorNombreEnvio', 'El nombre es obligatorio');
    esValido = false;
  }
  
  if (!correoEnvio) {
    mostrarError('errorCorreoEnvio', 'El correo es obligatorio');
    esValido = false;
  } else if (!validarEmail(correoEnvio)) {
    mostrarError('errorCorreoEnvio', 'Ingresa un correo válido');
    esValido = false;
  }
  
  if (!telefonoEnvio) {
    mostrarError('errorTelefonoEnvio', 'El teléfono es obligatorio');
    esValido = false;
  } else if (telefonoEnvio.length < 7) {
    mostrarError('errorTelefonoEnvio', 'Ingresa un teléfono válido');
    esValido = false;
  }
  
  if (!direccionEnvio) {
    mostrarError('errorDireccionEnvio', 'La dirección es obligatoria');
    esValido = false;
  }
  
  if (!ciudadEnvio) {
    mostrarError('errorCiudadEnvio', 'La ciudad es obligatoria');
    esValido = false;
  }
  
  // Validar datos de pago
  if (!nombreTarjeta) {
    mostrarError('errorNombreTarjeta', 'El nombre en la tarjeta es obligatorio');
    esValido = false;
  }
  
  if (!numeroTarjeta) {
    mostrarError('errorNumeroTarjeta', 'El número de tarjeta es obligatorio');
    esValido = false;
  } else if (numeroTarjeta.length !== 16) {
    mostrarError('errorNumeroTarjeta', 'El número debe tener 16 dígitos');
    esValido = false;
  }
  
  if (!vencimientoTarjeta) {
    mostrarError('errorVencimientoTarjeta', 'La fecha de vencimiento es obligatoria');
    esValido = false;
  } else if (!validarVencimiento(vencimientoTarjeta)) {
    mostrarError('errorVencimientoTarjeta', 'Formato inválido o fecha vencida (MM/AA)');
    esValido = false;
  }
  
  if (!cvvTarjeta) {
    mostrarError('errorCvvTarjeta', 'El CVV es obligatorio');
    esValido = false;
  } else if (cvvTarjeta.length !== 3) {
    mostrarError('errorCvvTarjeta', 'El CVV debe tener 3 dígitos');
    esValido = false;
  }
  
  // Verificar que hay productos en el carrito
  const carritoCompleto = obtenerCarritoCompleto();
  if (carritoCompleto.length === 0) {
    mostrarToast('No hay productos en el carrito', 'error');
    return;
  }
  
  if (!esValido) {
    mostrarToast('Por favor corrige los errores en el formulario', 'error');
    return;
  }
  
  // Generar número de pedido aleatorio
  const numeroPedido = 'PED-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  // Guardar información mínima para confirmación (NO guardar datos de tarjeta)
  const infoPedido = {
    numeroPedido: numeroPedido,
    nombre: nombreEnvio,
    correo: correoEnvio,
    total: calcularTotalCarrito()
  };
  
  localStorage.setItem('ultimo_pedido', JSON.stringify(infoPedido));
  
  // Vaciar carrito
  vaciarCarrito();
  actualizarContadorCarrito();
  
  // Redirigir a confirmación
  window.location.href = 'confirmacion.html?pedido=' + encodeURIComponent(numeroPedido);
}

// Validar email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validar vencimiento MM/AA
function validarVencimiento(vencimiento) {
  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!regex.test(vencimiento)) {
    return false;
  }
  
  const [mes, anio] = vencimiento.split('/');
  const mesNum = parseInt(mes);
  const anioNum = parseInt('20' + anio);
  
  const fechaActual = new Date();
  const anioActual = fechaActual.getFullYear();
  const mesActual = fechaActual.getMonth() + 1;
  
  if (anioNum < anioActual) {
    return false;
  }
  if (anioNum === anioActual && mesNum < mesActual) {
    return false;
  }
  
  return true;
}

// Mostrar error
function mostrarError(elementId, mensaje) {
  const elemento = document.getElementById(elementId);
  if (elemento) {
    elemento.textContent = mensaje;
  }
}

// Limpiar errores
function limpiarErrores() {
  const errores = document.querySelectorAll('[id^="error"]');
  errores.forEach(error => {
    error.textContent = '';
  });
}

// Escapar HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
