// Catálogo: filtros por categoría, búsqueda, orden, paginación y estados de carga.
// Todos los productos se consultan a la API (no hay datos locales).

const estadoCatalogo = {
  categoria: '',
  buscar: '',
  orden: '',
  offset: 0,
  limite: TIENDA_CONFIG.PAGINACION,
  total: 0,
  peticion: 0
};

const CATEGORIAS_RESPALDO = [
  { slug: 'semillas', nombre: 'Semillas' },
  { slug: 'plantas', nombre: 'Plantas' },
  { slug: 'materas', nombre: 'Materas' },
  { slug: 'abono', nombre: 'Abono' }
];

let temporizadorBusqueda = null;

function iniciarCatalogo() {
  const parametros = new URLSearchParams(window.location.search);
  const categoriaUrl = parametros.get('categoria') ?? '';
  const buscarUrl = parametros.get('buscar') ?? '';
  const ordenUrl = parametros.get('orden') ?? '';

  estadoCatalogo.categoria = categoriaUrl;
  estadoCatalogo.buscar = buscarUrl;
  estadoCatalogo.orden = ['precio_asc', 'precio_desc'].includes(ordenUrl) ? ordenUrl : '';

  const buscador = document.getElementById('buscador');
  const orden = document.getElementById('ordenPrecio');
  if (buscador) buscador.value = estadoCatalogo.buscar;
  if (orden) orden.value = estadoCatalogo.orden;

  conectarEventosCatalogo();
  cargarCategorias();
  reiniciarCatalogo();
}

function conectarEventosCatalogo() {
  const buscador = document.getElementById('buscador');
  const orden = document.getElementById('ordenPrecio');
  const cargarMas = document.getElementById('btnCargarMas');
  const limpiar = document.getElementById('btnLimpiarFiltros');

  buscador?.addEventListener('input', () => {
    window.clearTimeout(temporizadorBusqueda);
    temporizadorBusqueda = window.setTimeout(() => {
      estadoCatalogo.buscar = buscador.value.trim();
      actualizarUrlCatalogo();
      reiniciarCatalogo();
    }, 320);
  });

  orden?.addEventListener('change', () => {
    estadoCatalogo.orden = orden.value;
    actualizarUrlCatalogo();
    reiniciarCatalogo();
  });

  cargarMas?.addEventListener('click', () => {
    if (estadoCatalogo.offset < estadoCatalogo.total) {
      cargarPaginaCatalogo(false);
    }
  });

  limpiar?.addEventListener('click', () => {
    estadoCatalogo.categoria = '';
    estadoCatalogo.buscar = '';
    estadoCatalogo.orden = '';
    if (buscador) buscador.value = '';
    if (orden) orden.value = '';
    actualizarChipsCategoria();
    actualizarUrlCatalogo();
    reiniciarCatalogo();
  });
}

async function cargarCategorias() {
  try {
    const { categorias } = await TiendaAPI.obtenerCategorias();
    const existe = !estadoCatalogo.categoria || categorias.some((categoria) => categoria.slug === estadoCatalogo.categoria);

    if (!existe) {
      estadoCatalogo.categoria = '';
      actualizarUrlCatalogo();
      reiniciarCatalogo();
    }

    renderizarChipsCategoria(categorias);
  } catch {
    // Si fallan las categorías, el catálogo sigue siendo usable.
    renderizarChipsCategoria(CATEGORIAS_RESPALDO);
  }
}

function renderizarChipsCategoria(categorias) {
  const contenedor = document.getElementById('filtrosCategoria');
  if (!contenedor) return;

  const opciones = [{ slug: '', nombre: 'Todas' }, ...categorias];
  contenedor.innerHTML = opciones
    .map(
      (categoria) => `
        <button type="button" data-categoria="${escaparHtml(categoria.slug)}" aria-pressed="false"
                class="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
          ${escaparHtml(categoria.nombre)}
          ${categoria.total_productos !== undefined ? `<span class="text-[11px] opacity-60">${categoria.total_productos}</span>` : ''}
        </button>`
    )
    .join('');

  contenedor.querySelectorAll('button[data-categoria]').forEach((boton) => {
    boton.addEventListener('click', () => {
      estadoCatalogo.categoria = boton.dataset.categoria ?? '';
      actualizarChipsCategoria();
      actualizarUrlCatalogo();
      reiniciarCatalogo();
    });
  });

  actualizarChipsCategoria();
}

function actualizarChipsCategoria() {
  const activas =
    'border-emerald-700 bg-emerald-700 text-white shadow-sm dark:border-emerald-500 dark:bg-emerald-600';
  const inactivas =
    'border-stone-200 bg-white text-stone-600 hover:border-emerald-300 hover:text-emerald-800 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300 dark:hover:border-emerald-800 dark:hover:text-emerald-300';

  document.querySelectorAll('#filtrosCategoria button[data-categoria]').forEach((boton) => {
    const activo = (boton.dataset.categoria ?? '') === estadoCatalogo.categoria;
    boton.className = `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${activo ? activas : inactivas}`;
    boton.setAttribute('aria-pressed', String(activo));
  });
}

function actualizarUrlCatalogo() {
  const parametros = new URLSearchParams();
  if (estadoCatalogo.categoria) parametros.set('categoria', estadoCatalogo.categoria);
  if (estadoCatalogo.buscar) parametros.set('buscar', estadoCatalogo.buscar);
  if (estadoCatalogo.orden) parametros.set('orden', estadoCatalogo.orden);

  const archivo = window.location.pathname.split('/').pop() || 'index.html';
  const consulta = parametros.toString();

  try {
    window.history.replaceState(
      {},
      '',
      `${archivo}${consulta ? `?${consulta}` : ''}#catalogo`
    );
  } catch {
    // file:// puede bloquear replaceState; la navegación sigue funcionando.
  }
}

function reiniciarCatalogo() {
  estadoCatalogo.offset = 0;
  estadoCatalogo.total = 0;
  cargarPaginaCatalogo(true);
}

async function cargarPaginaCatalogo(esNuevaCarga) {
  const grid = document.getElementById('gridProductos');
  const sinResultados = document.getElementById('sinResultados');
  const botonCargarMas = document.getElementById('btnCargarMas');
  const textoCargarMas = document.getElementById('textoCargarMas');
  const contador = document.getElementById('contadorResultados');
  if (!grid) return;

  const peticionActual = ++estadoCatalogo.peticion;

  if (esNuevaCarga) {
    insertarEsqueletos(grid, estadoCatalogo.limite);
    sinResultados?.classList.add('hidden');
    botonCargarMas?.classList.add('hidden');
    if (textoCargarMas) textoCargarMas.textContent = '';
    if (contador) contador.textContent = 'Cargando productos…';
  } else if (botonCargarMas) {
    botonCargarMas.disabled = true;
    botonCargarMas.textContent = 'Cargando más…';
  }

  try {
    const datos = await TiendaAPI.obtenerProductos({
      categoria: estadoCatalogo.categoria,
      buscar: estadoCatalogo.buscar,
      orden: estadoCatalogo.orden,
      limit: estadoCatalogo.limite,
      offset: esNuevaCarga ? 0 : estadoCatalogo.offset
    });

    // Ignora respuestas de búsquedas anteriores.
    if (peticionActual !== estadoCatalogo.peticion) return;

    if (esNuevaCarga) grid.innerHTML = '';

    const fragmento = document.createDocumentFragment();
    datos.productos.forEach((producto) => fragmento.appendChild(crearTarjetaProducto(producto)));
    grid.appendChild(fragmento);

    estadoCatalogo.offset = (esNuevaCarga ? 0 : estadoCatalogo.offset) + datos.productos.length;
    estadoCatalogo.total = datos.total;

    actualizarEstadoCatalogo();
  } catch (error) {
    if (peticionActual !== estadoCatalogo.peticion) return;

    if (esNuevaCarga) {
      if (contador) contador.textContent = '';
      mostrarErrorCarga(grid, error.message, () => reiniciarCatalogo());
    } else {
      mostrarToast(error.message, 'error');
    }
  } finally {
    if (peticionActual === estadoCatalogo.peticion && botonCargarMas) {
      botonCargarMas.disabled = false;
      botonCargarMas.textContent = 'Cargar más productos';
    }
  }
}

function actualizarEstadoCatalogo() {
  const grid = document.getElementById('gridProductos');
  const sinResultados = document.getElementById('sinResultados');
  const botonCargarMas = document.getElementById('btnCargarMas');
  const textoCargarMas = document.getElementById('textoCargarMas');
  const contador = document.getElementById('contadorResultados');

  if (!grid) return;

  if (estadoCatalogo.total === 0) {
    grid.innerHTML = '';
    sinResultados?.classList.remove('hidden');
    if (contador) contador.textContent = '0 productos';
    botonCargarMas?.classList.add('hidden');
    if (textoCargarMas) textoCargarMas.textContent = '';
    return;
  }

  sinResultados?.classList.add('hidden');

  if (contador) {
    contador.textContent = `${estadoCatalogo.offset} de ${estadoCatalogo.total} producto${estadoCatalogo.total === 1 ? '' : 's'}`;
  }

  const hayMas = estadoCatalogo.offset < estadoCatalogo.total;
  botonCargarMas?.classList.toggle('hidden', !hayMas);

  if (textoCargarMas) {
    textoCargarMas.textContent = hayMas
      ? `Quedan ${estadoCatalogo.total - estadoCatalogo.offset} productos por descubrir`
      : 'Has visto todo el catálogo';
  }
}

document.addEventListener('DOMContentLoaded', iniciarCatalogo);
