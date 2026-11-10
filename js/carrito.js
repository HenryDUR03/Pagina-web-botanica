// Carrito en localStorage. Guardamos una copia ligera de los datos para poder
// mostrar el carrito al instante; antes de comprar se revalida contra la API.

function obtenerCarrito() {
  try {
    const datos = JSON.parse(localStorage.getItem(TIENDA_CONFIG.CLAVES.CARRITO) ?? '[]');
    if (!Array.isArray(datos)) return [];

    return datos
      .map((item) => ({
        id: Number(item.id),
        cantidad: Math.min(99, Math.max(1, Number.parseInt(item.cantidad, 10) || 1)),
        nombre: typeof item.nombre === 'string' ? item.nombre : '',
        precio: Number(item.precio) || 0,
        imagen_url: typeof item.imagen_url === 'string' ? item.imagen_url : '',
        stock: Number(item.stock) || 0
      }))
      .filter((item) => Number.isInteger(item.id) && item.id > 0);
  } catch {
    return [];
  }
}

function guardarCarrito(items) {
  try {
    localStorage.setItem(TIENDA_CONFIG.CLAVES.CARRITO, JSON.stringify(items));
  } catch {
    mostrarToast('No pudimos guardar el carrito en este navegador.', 'error');
  }
}

function obtenerCantidadTotalCarrito() {
  return obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
}

function actualizarContadorCarrito() {
  const cantidad = obtenerCantidadTotalCarrito();
  document.querySelectorAll('.contador-carrito').forEach((elemento) => {
    elemento.textContent = String(cantidad);
    elemento.classList.toggle('hidden', cantidad === 0);
  });
}

function agregarAlCarrito(producto, cantidad = 1) {
  if (!producto || Number(producto.stock) <= 0) {
    return { ok: false, mensaje: 'Este producto está agotado.' };
  }

  const items = obtenerCarrito();
  const existente = items.find((item) => item.id === Number(producto.id));
  const cantidadActual = existente?.cantidad ?? 0;
  const nuevaCantidad = cantidadActual + cantidad;

  if (nuevaCantidad > producto.stock) {
    const disponibles = producto.stock - cantidadActual;
    return {
      ok: false,
      mensaje:
        disponibles > 0
          ? `Solo puedes agregar ${disponibles} unidad(es) más de ${producto.nombre}.`
          : `Ya tienes el máximo disponible de ${producto.nombre} en el carrito.`
    };
  }

  const instantanea = {
    id: producto.id,
    cantidad: nuevaCantidad,
    nombre: producto.nombre,
    precio: producto.precio,
    imagen_url: producto.imagen_url,
    stock: producto.stock
  };

  if (existente) {
    Object.assign(existente, instantanea);
  } else {
    items.push(instantanea);
  }

  guardarCarrito(items);
  actualizarContadorCarrito();
  return { ok: true, cantidadTotal: nuevaCantidad };
}

function actualizarCantidad(producto, cantidad) {
  if (!producto) return { ok: false, mensaje: 'No pudimos actualizar este producto.' };
  if (cantidad <= 0) return quitarDelCarrito(producto.id);

  if (cantidad > producto.stock) {
    return {
      ok: false,
      mensaje: `Solo hay ${producto.stock} unidad(es) disponibles de ${producto.nombre}.`
    };
  }

  const items = obtenerCarrito();
  const item = items.find((elemento) => elemento.id === Number(producto.id));
  if (!item) return { ok: false, mensaje: 'El producto ya no está en el carrito.' };

  item.cantidad = cantidad;
  item.nombre = producto.nombre;
  item.precio = producto.precio;
  item.imagen_url = producto.imagen_url;
  item.stock = producto.stock;

  guardarCarrito(items);
  actualizarContadorCarrito();
  return { ok: true };
}

function quitarDelCarrito(productoId) {
  const items = obtenerCarrito().filter((item) => item.id !== Number(productoId));
  guardarCarrito(items);
  actualizarContadorCarrito();
  return { ok: true };
}

function vaciarCarrito() {
  guardarCarrito([]);
  actualizarContadorCarrito();
}

/* ----------------------------- Cupones ----------------------------- */

function obtenerCupon() {
  try {
    return (localStorage.getItem(TIENDA_CONFIG.CLAVES.CUPON) ?? '').toUpperCase();
  } catch {
    return '';
  }
}

function aplicarCupon(codigo) {
  const limpio = String(codigo ?? '').trim().toUpperCase();
  const cupon = TIENDA_CONFIG.CUPONES[limpio];

  if (!cupon) {
    return { ok: false, mensaje: 'Ese cupón no es válido. Prueba con PLANTA10.' };
  }

  try {
    localStorage.setItem(TIENDA_CONFIG.CLAVES.CUPON, cupon.codigo);
  } catch {
    return { ok: false, mensaje: 'No pudimos guardar el cupón en este navegador.' };
  }

  return { ok: true, cupon, mensaje: `Cupón ${cupon.codigo} aplicado: ${cupon.descripcion}.` };
}

function quitarCupon() {
  try {
    localStorage.removeItem(TIENDA_CONFIG.CLAVES.CUPON);
  } catch {
    // Sin persistencia disponible.
  }
}

/* ----------------------------- Totales ----------------------------- */

function calcularTotales(items, codigoCupon = obtenerCupon()) {
  const subtotal = items.reduce(
    (total, item) => total + (Number(item.precio) || 0) * item.cantidad,
    0
  );
  const cupon = codigoCupon ? TIENDA_CONFIG.CUPONES[codigoCupon] : null;
  const descuento = cupon ? Math.round((subtotal * cupon.porcentaje) / 100) : 0;
  const envio =
    items.length === 0
      ? 0
      : subtotal >= TIENDA_CONFIG.ENVIO.GRATIS_DESDE
        ? 0
        : TIENDA_CONFIG.ENVIO.COSTO;
  const faltaParaEnvio = Math.max(0, TIENDA_CONFIG.ENVIO.GRATIS_DESDE - subtotal);

  return {
    subtotal,
    descuento,
    envio,
    total: Math.max(0, subtotal - descuento + envio),
    cupon,
    faltaParaEnvio
  };
}

/* ------------------------- Revalidación ---------------------------- */

// Consulta la API para confirmar que los productos siguen existiendo, con su
// precio y stock actuales. Ajusta cantidades y devuelve avisos para el usuario.
async function revalidarCarrito() {
  const items = obtenerCarrito();
  if (items.length === 0) return { items: [], avisos: [] };

  const resultados = await Promise.all(
    items.map(async (item) => {
      try {
        const { producto } = await TiendaAPI.obtenerProducto(item.id);
        return { item, producto };
      } catch (error) {
        if (error.estado === 404) return { item, producto: null };
        throw error;
      }
    })
  );

  const actualizados = [];
  const avisos = [];

  for (const { item, producto } of resultados) {
    if (!producto) {
      avisos.push(`${item.nombre || 'Un producto'} ya no está disponible y lo retiramos del carrito.`);
      continue;
    }

    if (producto.stock <= 0) {
      avisos.push(`${producto.nombre} se agotó y lo retiramos del carrito.`);
      continue;
    }

    let cantidad = item.cantidad;
    if (cantidad > producto.stock) {
      cantidad = producto.stock;
      avisos.push(`Ajustamos ${producto.nombre} a ${producto.stock} unidad(es) por disponibilidad.`);
    }

    if (item.precio > 0 && item.precio !== producto.precio) {
      avisos.push(`El precio de ${producto.nombre} cambió a ${formatearCOP(producto.precio)}.`);
    }

    actualizados.push({
      id: producto.id,
      cantidad,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen_url: producto.imagen_url,
      stock: producto.stock
    });
  }

  guardarCarrito(actualizados);
  actualizarContadorCarrito();
  return { items: actualizados, avisos };
}
