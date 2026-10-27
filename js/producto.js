// Lógica de la página de detalle de producto (producto.html)

// Cargar detalle del producto
function cargarDetalleProducto() {
  // Obtener ID de la URL
  const params = new URLSearchParams(window.location.search);
  const productoId = params.get('id');
  
  const detalleDiv = document.getElementById('detalleProducto');
  const noEncontradoDiv = document.getElementById('productoNoEncontrado');
  
  if (!productoId) {
    if (detalleDiv) detalleDiv.classList.add('hidden');
    if (noEncontradoDiv) noEncontradoDiv.classList.remove('hidden');
    return;
  }
  
  const producto = obtenerProductoPorId(productoId);
  
  if (!producto) {
    if (detalleDiv) detalleDiv.classList.add('hidden');
    if (noEncontradoDiv) noEncontradoDiv.classList.remove('hidden');
    return;
  }
  
  if (noEncontradoDiv) noEncontradoDiv.classList.add('hidden');
  if (detalleDiv) detalleDiv.classList.remove('hidden');
  
  const agotado = producto.stock === 0;
  
  detalleDiv.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
      <!-- Imagen -->
      <div class="relative">
        <img 
          src="${producto.imagen}" 
          alt="${producto.nombre}"
          class="w-full h-64 md:h-full object-cover"
          onerror="this.src='https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop'"
        >
        ${agotado ? '<span class="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-semibold">Agotado</span>' : ''}
      </div>
      
      <!-- Información -->
      <div class="p-6 md:p-8">
        <div class="mb-2">
          <span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            ${producto.categoria}
          </span>
        </div>
        
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">${escapeHtml(producto.nombre)}</h1>
        
        <p class="text-3xl font-bold text-green-700 mb-4">${formatearCOP(producto.precio)}</p>
        
        <div class="mb-4">
          <p class="text-gray-700 mb-2 font-semibold">Descripción:</p>
          <p class="text-gray-600 leading-relaxed">${escapeHtml(producto.descripcion)}</p>
        </div>
        
        <div class="mb-6">
          <p class="text-gray-700">
            <span class="font-semibold">Disponibilidad:</span> 
            ${agotado ? '<span class="text-red-600 font-semibold">Sin stock</span>' : `<span class="text-green-600 font-semibold">${producto.stock} unidades disponibles</span>`}
          </p>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
          <select 
            id="cantidadProducto" 
            class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            ${agotado ? 'disabled' : ''}
          >
            ${generarOpcionesCantidad(producto.stock)}
          </select>
        </div>
        
        <button 
          onclick="agregarProductoDetalle(${producto.id})" 
          class="w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors focus:outline-none focus:ring-2 ${
            agotado 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
          }"
          ${agotado ? 'disabled' : ''}
        >
          ${agotado ? 'Producto Agotado' : 'Agregar al Carrito'}
        </button>
      </div>
    </div>
  `;
}

// Generar opciones de cantidad
function generarOpcionesCantidad(stock) {
  if (stock === 0) return '<option value="0">0</option>';
  let opciones = '';
  const maxCantidad = Math.min(stock, 10); // Limitar a 10 por compra
  for (let i = 1; i <= maxCantidad; i++) {
    opciones += `<option value="${i}">${i}</option>`;
  }
  return opciones;
}

// Agregar producto desde página de detalle
function agregarProductoDetalle(productoId) {
  const producto = obtenerProductoPorId(productoId);
  if (!producto || producto.stock === 0) {
    mostrarToast('Producto agotado', 'error');
    return;
  }
  
  const selectCantidad = document.getElementById('cantidadProducto');
  const cantidad = selectCantidad ? parseInt(selectCantidad.value) : 1;
  
  const resultado = agregarAlCarrito(productoId, cantidad);
  if (resultado.success) {
    mostrarToast(resultado.mensaje, 'success');
  } else {
    mostrarToast(resultado.mensaje, 'error');
  }
}

// Función para escapar HTML (prevenir XSS)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
