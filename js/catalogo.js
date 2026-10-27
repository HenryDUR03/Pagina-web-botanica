// Lógica del catálogo (index.html)

// Variables globales para filtros
let filtrosActuales = {
  categoria: 'Todas',
  busqueda: '',
  orden: 'sin-orden'
};

// Inicializar catálogo
function inicializarCatalogo() {
  // Event listeners para filtros
  const buscador = document.getElementById('buscador');
  const filtroCategoria = document.getElementById('filtroCategoria');
  const ordenPrecio = document.getElementById('ordenPrecio');
  
  if (buscador) {
    buscador.addEventListener('input', (e) => {
      filtrosActuales.busqueda = e.target.value.toLowerCase();
      aplicarFiltros();
    });
  }
  
  if (filtroCategoria) {
    filtroCategoria.addEventListener('change', (e) => {
      filtrosActuales.categoria = e.target.value;
      aplicarFiltros();
    });
  }
  
  if (ordenPrecio) {
    ordenPrecio.addEventListener('change', (e) => {
      filtrosActuales.orden = e.target.value;
      aplicarFiltros();
    });
  }
  
  // Renderizar productos iniciales
  aplicarFiltros();
}

// Aplicar filtros y renderizar
function aplicarFiltros() {
  let productosFiltrados = [...PRODUCTOS];
  
  // Filtrar por categoría
  if (filtrosActuales.categoria !== 'Todas') {
    productosFiltrados = productosFiltrados.filter(p => p.categoria === filtrosActuales.categoria);
  }
  
  // Filtrar por búsqueda
  if (filtrosActuales.busqueda) {
    productosFiltrados = productosFiltrados.filter(p => 
      p.nombre.toLowerCase().includes(filtrosActuales.busqueda)
    );
  }
  
  // Ordenar por precio
  if (filtrosActuales.orden === 'menor-mayor') {
    productosFiltrados.sort((a, b) => a.precio - b.precio);
  } else if (filtrosActuales.orden === 'mayor-menor') {
    productosFiltrados.sort((a, b) => b.precio - a.precio);
  }
  
  renderizarProductos(productosFiltrados);
}

// Renderizar productos en el grid
function renderizarProductos(productos) {
  const grid = document.getElementById('gridProductos');
  const sinResultados = document.getElementById('sinResultados');
  
  if (!grid) return;
  
  if (productos.length === 0) {
    grid.innerHTML = '';
    if (sinResultados) {
      sinResultados.classList.remove('hidden');
    }
    return;
  }
  
  if (sinResultados) {
    sinResultados.classList.add('hidden');
  }
  
  grid.innerHTML = '';
  
  productos.forEach(producto => {
    const tarjeta = crearTarjetaProducto(producto);
    grid.appendChild(tarjeta);
  });
}

// Crear tarjeta de producto reutilizable
function crearTarjetaProducto(producto) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200';
  
  const agotado = producto.stock === 0;
  
  tarjeta.innerHTML = `
    <div class="relative">
      <img 
        src="${producto.imagen}" 
        alt="${producto.nombre}"
        class="w-full h-48 object-cover"
        onerror="this.src='https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop'"
      >
      ${agotado ? '<span class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full font-semibold">Agotado</span>' : ''}
    </div>
    <div class="p-4">
      <div class="text-xs text-green-600 font-semibold mb-1">${producto.categoria}</div>
      <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 h-14">${producto.nombre}</h3>
      <p class="text-xl font-bold text-green-700 mb-3">${formatearCOP(producto.precio)}</p>
      <p class="text-sm text-gray-600 mb-3">Stock: ${agotado ? '0' : producto.stock} unidades</p>
      <div class="space-y-2">
        <a 
          href="producto.html?id=${producto.id}" 
          class="block w-full text-center bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Ver Detalle
        </a>
        <button 
          onclick="agregarProductoDesdeCatalogo(${producto.id})" 
          class="w-full px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 ${
            agotado 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
          }"
          ${agotado ? 'disabled' : ''}
        >
          ${agotado ? 'Agotado' : 'Agregar al Carrito'}
        </button>
      </div>
    </div>
  `;
  
  return tarjeta;
}

// Agregar producto desde catálogo
function agregarProductoDesdeCatalogo(productoId) {
  const resultado = agregarAlCarrito(productoId, 1);
  if (resultado.success) {
    mostrarToast(resultado.mensaje, 'success');
  } else {
    mostrarToast(resultado.mensaje, 'error');
  }
}
