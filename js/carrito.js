// Lógica compartida del carrito con localStorage
// Clave para guardar carrito
const CARRITO_KEY = 'tienda_plantas_carrito';

// Obtener carrito desde localStorage
function obtenerCarrito() {
  try {
    const carritoData = localStorage.getItem(CARRITO_KEY);
    if (!carritoData) {
      return [];
    }
    return JSON.parse(carritoData);
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    return [];
  }
}

// Guardar carrito en localStorage
function guardarCarrito(carrito) {
  try {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  } catch (error) {
    console.error('Error al guardar carrito:', error);
  }
}

// Agregar producto al carrito (respeta stock)
function agregarAlCarrito(productoId, cantidad = 1) {
  const producto = obtenerProductoPorId(productoId);
  if (!producto) {
    return { success: false, mensaje: 'Producto no encontrado' };
  }
  
  if (producto.stock === 0) {
    return { success: false, mensaje: 'Producto agotado' };
  }
  
  const carrito = obtenerCarrito();
  const itemExistente = carrito.find(item => item.id === productoId);
  
  const cantidadActual = itemExistente ? itemExistente.cantidad : 0;
  const cantidadTotal = cantidadActual + cantidad;
  
  if (cantidadTotal > producto.stock) {
    return { success: false, mensaje: `Solo hay ${producto.stock} unidades disponibles` };
  }
  
  if (itemExistente) {
    itemExistente.cantidad = cantidadTotal;
  } else {
    carrito.push({
      id: productoId,
      cantidad: cantidad
    });
  }
  
  guardarCarrito(carrito);
  actualizarContadorCarrito();
  return { success: true, mensaje: 'Producto agregado al carrito' };
}

// Actualizar cantidad de un producto en el carrito
function actualizarCantidadCarrito(productoId, cantidad) {
  const producto = obtenerProductoPorId(productoId);
  if (!producto) {
    return { success: false, mensaje: 'Producto no encontrado' };
  }
  
  if (cantidad <= 0) {
    return quitarDelCarrito(productoId);
  }
  
  if (cantidad > producto.stock) {
    return { success: false, mensaje: `Solo hay ${producto.stock} unidades disponibles` };
  }
  
  const carrito = obtenerCarrito();
  const item = carrito.find(item => item.id === productoId);
  
  if (item) {
    item.cantidad = cantidad;
    guardarCarrito(carrito);
    actualizarContadorCarrito();
    return { success: true, mensaje: 'Cantidad actualizada' };
  }
  
  return { success: false, mensaje: 'Producto no encontrado en el carrito' };
}

// Quitar producto del carrito
function quitarDelCarrito(productoId) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(item => item.id !== productoId);
  guardarCarrito(carrito);
  actualizarContadorCarrito();
  return { success: true, mensaje: 'Producto eliminado del carrito' };
}

// Vaciar carrito
function vaciarCarrito() {
  guardarCarrito([]);
  actualizarContadorCarrito();
}

// Obtener total de items en el carrito
function obtenerCantidadTotalCarrito() {
  const carrito = obtenerCarrito();
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}

// Obtener carrito con información completa de productos
function obtenerCarritoCompleto() {
  const carrito = obtenerCarrito();
  const carritoCompleto = [];
  
  for (const item of carrito) {
    const producto = obtenerProductoPorId(item.id);
    if (producto) {
      carritoCompleto.push({
        ...producto,
        cantidad: item.cantidad,
        subtotal: producto.precio * item.cantidad
      });
    }
  }
  
  return carritoCompleto;
}

// Calcular total del carrito
function calcularTotalCarrito() {
  const carritoCompleto = obtenerCarritoCompleto();
  return carritoCompleto.reduce((total, item) => total + item.subtotal, 0);
}

// Actualizar contador del carrito en la navbar
function actualizarContadorCarrito() {
  const contador = obtenerCantidadTotalCarrito();
  const elementosContador = document.querySelectorAll('.contador-carrito');
  
  elementosContador.forEach(elemento => {
    elemento.textContent = contador;
    if (contador > 0) {
      elemento.classList.remove('hidden');
    } else {
      elemento.classList.add('hidden');
    }
  });
}

// Mostrar toast/aviso visual
function mostrarToast(mensaje, tipo = 'success') {
  // Crear elemento toast
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 transition-opacity duration-300 ${
    tipo === 'success' ? 'bg-green-600' : 'bg-red-600'
  }`;
  toast.textContent = mensaje;
  
  document.body.appendChild(toast);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}
