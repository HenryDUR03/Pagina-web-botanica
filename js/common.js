// Navbar, footer y tema compartidos por todas las páginas.

const ENLACES_NAV = [
  { href: 'index.html', texto: 'Catálogo', pagina: 'inicio' },
  { href: 'sobre-nosotros.html', texto: 'Nosotros', pagina: 'nosotros' },
  { href: 'favoritos.html', texto: 'Favoritos', pagina: 'favoritos' },
  { href: 'seguimiento.html', texto: 'Mi pedido', pagina: 'seguimiento' }
];

function paginaActual() {
  const archivo = window.location.pathname.split('/').pop() || 'index.html';
  if (archivo === 'favoritos.html') return 'favoritos';
  if (archivo === 'seguimiento.html' || archivo === 'confirmacion.html') return 'seguimiento';
  if (archivo === 'sobre-nosotros.html' || archivo === 'contacto.html') return 'nosotros';
  if (archivo === 'carrito.html' || archivo === 'checkout.html') return 'carrito';
  if (archivo === 'producto.html') return 'inicio';
  return 'inicio';
}

function clasesEnlaceNav(activo) {
  return activo
    ? 'rounded-full bg-emerald-100/80 px-3.5 py-2 text-sm font-semibold text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200'
    : 'rounded-full px-3.5 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white';
}

function generarNavbar() {
  const contenedor = document.getElementById('navbar');
  if (!contenedor) return;

  const actual = paginaActual();
  const enlacesEscritorio = ENLACES_NAV.map(
    (enlace) => `
      <a href="${enlace.href}" class="${clasesEnlaceNav(actual === enlace.pagina)}"
         ${actual === enlace.pagina ? 'aria-current="page"' : ''}>${enlace.texto}</a>`
  ).join('');

  const enlacesMoviles = ENLACES_NAV.map(
    (enlace) => `
      <a href="${enlace.href}" class="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-900"
         ${actual === enlace.pagina ? 'aria-current="page"' : ''}>
        ${enlace.texto}
        ${enlace.pagina === 'favoritos' ? '<span class="contador-favoritos hidden min-w-5 rounded-full bg-rose-100 px-1.5 py-0.5 text-center text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">0</span>' : ''}
      </a>`
  ).join('');

  contenedor.innerHTML = `
    <header class="sticky top-0 z-40 border-b border-stone-200/70 bg-stone-50/85 backdrop-blur-lg dark:border-stone-800/80 dark:bg-stone-950/85">
      <div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a href="index.html" class="group flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-950">
          <span class="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-700 text-white shadow-sm shadow-emerald-900/20 transition group-hover:bg-emerald-800">
            ${ICONOS.hoja}
          </span>
          <span class="leading-tight">
            <span class="block font-display text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50">Raíz &amp; Hoja</span>
            <span class="block text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Vivero urbano</span>
          </span>
        </a>

        <nav class="ml-auto hidden items-center gap-1 md:flex" aria-label="Navegación principal">
          ${enlacesEscritorio}
        </nav>

        <div class="ml-auto flex items-center gap-2 md:ml-4">
          <button type="button" data-tema aria-pressed="false" aria-label="Cambiar entre tema claro y oscuro"
                  class="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300">
            <span class="hidden dark:block">${ICONOS.sol}</span>
            <span class="block dark:hidden">${ICONOS.luna}</span>
          </button>

          <a href="favoritos.html" aria-label="Ver favoritos"
             class="relative grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:border-rose-300 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 md:hidden dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
            ${ICONOS.corazon}
            <span class="contador-favoritos absolute -right-1 -top-1 hidden min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">0</span>
          </a>

          <a href="carrito.html" aria-label="Ver carrito de compras"
             class="relative flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-stone-700 transition hover:border-emerald-300 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-emerald-700 dark:hover:text-emerald-300">
            ${ICONOS.carrito}
            <span class="hidden text-sm font-medium sm:inline">Carrito</span>
            <span class="contador-carrito absolute -right-1.5 -top-1.5 hidden min-w-5 rounded-full bg-emerald-700 px-1.5 py-0.5 text-center text-[10px] font-bold text-white dark:bg-emerald-500 dark:text-emerald-950">0</span>
          </a>

          <button type="button" id="menuBtn" aria-expanded="false" aria-controls="menuMovil" aria-label="Abrir menú"
                  class="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:hidden dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
            ${ICONOS.menu}
          </button>
        </div>
      </div>

      <div id="menuMovil" class="hidden border-t border-stone-200/70 px-4 pb-4 pt-2 md:hidden dark:border-stone-800">
        <nav class="space-y-1" aria-label="Navegación móvil">
          ${enlacesMoviles}
          <a href="carrito.html" class="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-900">
            Carrito
            <span class="contador-carrito hidden min-w-5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-center text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">0</span>
          </a>
        </nav>
      </div>
    </header>
  `;
}

function generarFooter() {
  const contenedor = document.getElementById('footer');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <footer class="mt-16 border-t border-stone-200/80 bg-white/70 dark:border-stone-800 dark:bg-stone-900/40">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div class="lg:col-span-1">
            <a href="index.html" class="flex items-center gap-2.5">
              <span class="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-700 text-white">${ICONOS.hoja}</span>
              <span class="leading-tight">
                <span class="block font-display text-lg font-semibold text-stone-900 dark:text-stone-50">Raíz &amp; Hoja</span>
                <span class="block text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Vivero urbano</span>
              </span>
            </a>
            <p class="mt-4 max-w-xs text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              Plantas, semillas, materas y abono para hacer crecer tu hogar. Cultivamos ideas simples para espacios vivos.
            </p>
            <div class="mt-4 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span class="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Pago simulado</span>
              <span>Proyecto académico</span>
            </div>
          </div>

          <div>
            <h2 class="font-display text-sm font-semibold uppercase tracking-[0.14em] text-stone-900 dark:text-stone-100">Tienda</h2>
            <ul class="mt-4 space-y-2.5 text-sm">
              <li><a href="index.html" class="text-stone-500 transition hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300">Catálogo</a></li>
              <li><a href="index.html#catalogo" class="text-stone-500 transition hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300">Semillas y plantas</a></li>
              <li><a href="favoritos.html" class="text-stone-500 transition hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300">Favoritos</a></li>
              <li><a href="carrito.html" class="text-stone-500 transition hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300">Carrito</a></li>
              <li><a href="sobre-nosotros.html" class="text-stone-500 transition hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300">Sobre nosotros</a></li>
            </ul>
          </div>

          <div>
            <h2 class="font-display text-sm font-semibold uppercase tracking-[0.14em] text-stone-900 dark:text-stone-100">Ayuda</h2>
            <ul class="mt-4 space-y-2.5 text-sm">
              <li><a href="seguimiento.html" class="text-stone-500 transition hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300">Seguimiento de pedido</a></li>
              <li><a href="index.html#beneficios" class="text-stone-500 transition hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300">Envíos y garantía</a></li>
              <li><a href="index.html#catalogo" class="text-stone-500 transition hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300">Asesoría de cuidado</a></li>
              <li><a href="contacto.html" class="text-stone-500 transition hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h2 class="font-display text-sm font-semibold uppercase tracking-[0.14em] text-stone-900 dark:text-stone-100">Contacto</h2>
            <ul class="mt-4 space-y-2.5 text-sm text-stone-500 dark:text-stone-400">
              <li class="flex items-center gap-2">${ICONOS.sobre}<a href="mailto:hola@raizyhoja.co" class="transition hover:text-emerald-700 dark:hover:text-emerald-300">hola@raizyhoja.co</a></li>
              <li class="flex items-center gap-2">${ICONOS.telefono}<span>+57 300 123 4567</span></li>
              <li class="flex items-center gap-2">${ICONOS.ubicacion}<span>Bogotá, Colombia</span></li>
              <li class="flex items-center gap-2">${ICONOS.reloj}<span>Lun a sáb, 9:00 a 18:00</span></li>
            </ul>
          </div>
        </div>

        <div class="mt-10 flex flex-col gap-3 border-t border-stone-200/80 pt-6 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between dark:border-stone-800 dark:text-stone-500">
          <p class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© ${new Date().getFullYear()} Raíz &amp; Hoja. Proyecto académico sin fines comerciales.</span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-2 py-0.5 dark:border-stone-700" title="Origen de los datos de la tienda">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
              ${escaparHtml(window.TiendaAPI?.etiquetaModo ?? 'Modo local')}
            </span>
          </p>
          <p class="flex items-center gap-1.5">${ICONOS.tarjeta} Ningún pago real es procesado.</p>
        </div>
      </div>
    </footer>
  `;
}

function configurarMenuMovil() {
  const boton = document.getElementById('menuBtn');
  const menu = document.getElementById('menuMovil');
  if (!boton || !menu) return;

  const cerrar = () => {
    menu.classList.add('hidden');
    boton.setAttribute('aria-expanded', 'false');
  };

  boton.addEventListener('click', () => {
    const abierto = !menu.classList.toggle('hidden');
    boton.setAttribute('aria-expanded', String(abierto));
  });

  menu.querySelectorAll('a').forEach((enlace) => enlace.addEventListener('click', cerrar));

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) cerrar();
  });
}

function configurarTema() {
  const botones = document.querySelectorAll('[data-tema]');
  if (botones.length === 0) return;

  const sincronizar = () => {
    const oscuro = document.documentElement.classList.contains('dark');
    botones.forEach((boton) => boton.setAttribute('aria-pressed', String(oscuro)));
  };

  sincronizar();

  botones.forEach((boton) => {
    boton.addEventListener('click', () => {
      const oscuro = document.documentElement.classList.toggle('dark');
      try {
        localStorage.setItem(TIENDA_CONFIG.CLAVES.TEMA, oscuro ? 'oscuro' : 'claro');
      } catch {
        // Preferencia no persistida.
      }
      sincronizar();
      mostrarToast(oscuro ? 'Modo oscuro activado' : 'Modo claro activado', 'info');
    });
  });
}

// Botón flotante de WhatsApp. El número se cambia solo en js/config.js
// (TIENDA_CONFIG.WHATSAPP), sin espacios ni signos.
function generarBotonWhatsApp() {
  const numero = String(window.TIENDA_CONFIG?.WHATSAPP ?? '').replace(/\D/g, '');
  if (numero.length < 7 || document.getElementById('botonWhatsApp')) return;

  const mensaje = encodeURIComponent('Hola, quiero asesoría para elegir una planta.');
  const enlace = document.createElement('a');

  enlace.id = 'botonWhatsApp';
  enlace.href = `https://wa.me/${numero}?text=${mensaje}`;
  enlace.target = '_blank';
  enlace.rel = 'noopener noreferrer';
  enlace.setAttribute('aria-label', 'Escribir al vivero por WhatsApp');
  enlace.title = 'Escríbenos por WhatsApp';
  enlace.className =
    'fixed bottom-4 left-4 z-[60] inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:bottom-6 sm:left-6 dark:focus-visible:ring-offset-stone-950';
  enlace.innerHTML = `${ICONOS.whatsapp}<span class="hidden sm:inline">WhatsApp</span>`;

  document.body.appendChild(enlace);
}

function inicializarComun() {
  generarNavbar();
  generarFooter();
  configurarMenuMovil();
  configurarTema();
  generarBotonWhatsApp();
  actualizarContadorCarrito();
  actualizarContadorFavoritos();

  // Aviso discreto del origen de los datos, útil durante el desarrollo.
  const etiqueta = window.TiendaAPI?.etiquetaModo ?? 'Modo local';
  console.info(
    `[Raíz & Hoja] ${etiqueta}: ${
      window.TiendaAPI?.modo === 'supabase'
        ? 'catálogo y pedidos en Supabase.'
        : 'catálogo en js/productos.js y pedidos en este navegador.'
    }`
  );
}

document.addEventListener('DOMContentLoaded', inicializarComun);
