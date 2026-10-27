// Funciones comunes para navbar y footer

function generarNavbar() {
  const navbarHTML = `
    <nav class="bg-green-700 text-white shadow-lg sticky top-0 z-40">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <!-- Logo -->
          <a href="index.html" class="flex items-center space-x-2">
            <span class="text-2xl">🌿</span>
            <span class="text-xl font-bold">Tienda de Plantas</span>
          </a>
          
          <!-- Menú Desktop -->
          <div class="hidden md:flex items-center space-x-6">
            <a href="index.html" class="hover:text-green-200 transition-colors">Inicio</a>
            <a href="index.html#catalogo" class="hover:text-green-200 transition-colors">Catálogo</a>
            <a href="carrito.html" class="relative hover:text-green-200 transition-colors flex items-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span class="ml-1">Carrito</span>
              <span class="contador-carrito absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center hidden">0</span>
            </a>
          </div>
          
          <!-- Botón menú móvil -->
          <button id="menuBtn" class="md:hidden focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        
        <!-- Menú Móvil -->
        <div id="menuMovil" class="hidden md:hidden pb-4">
          <a href="index.html" class="block py-2 hover:text-green-200 transition-colors">Inicio</a>
          <a href="index.html#catalogo" class="block py-2 hover:text-green-200 transition-colors">Catálogo</a>
          <a href="carrito.html" class="block py-2 hover:text-green-200 transition-colors flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Carrito (<span class="contador-carrito">0</span>)
          </a>
        </div>
      </div>
    </nav>
  `;
  
  document.getElementById('navbar').innerHTML = navbarHTML;
  
  // Funcionalidad menú móvil
  const menuBtn = document.getElementById('menuBtn');
  const menuMovil = document.getElementById('menuMovil');
  
  if (menuBtn && menuMovil) {
    menuBtn.addEventListener('click', () => {
      menuMovil.classList.toggle('hidden');
    });
  }
  
  // Actualizar contador
  if (typeof actualizarContadorCarrito === 'function') {
    actualizarContadorCarrito();
  }
}

function generarFooter() {
  const footerHTML = `
    <footer class="bg-green-800 text-white mt-12">
      <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div class="flex items-center space-x-2 mb-4">
              <span class="text-2xl">🌿</span>
              <span class="text-xl font-bold">Tienda de Plantas</span>
            </div>
            <p class="text-green-200">Tu tienda en línea de semillas, plantas, materas y abono para tu huerta y jardín.</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Enlaces</h3>
            <ul class="space-y-2">
              <li><a href="index.html" class="text-green-200 hover:text-white transition-colors">Inicio</a></li>
              <li><a href="index.html#catalogo" class="text-green-200 hover:text-white transition-colors">Catálogo</a></li>
              <li><a href="carrito.html" class="text-green-200 hover:text-white transition-colors">Carrito</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Información</h3>
            <p class="text-green-200">Proyecto académico - Frontend sin backend</p>
            <p class="text-green-200 mt-2">© 2026 Tienda de Plantas</p>
          </div>
        </div>
      </div>
    </footer>
  `;
  
  document.getElementById('footer').innerHTML = footerHTML;
}
