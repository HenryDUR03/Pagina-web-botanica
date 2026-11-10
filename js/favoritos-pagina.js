// Página de favoritos: consulta a la API los productos guardados en localStorage.
// Cada tarjeta permite quitar el favorito y se retira de la lista al instante.

function iniciarPaginaFavoritos() {
  cargarFavoritosPagina();
}

async function cargarFavoritosPagina() {
  const ids = obtenerFavoritos();

  if (ids.length === 0) {
    mostrarPantallaFavoritos('favoritosVacio');
    actualizarContadorFavoritosPagina(0);
    return;
  }

  mostrarPantallaFavoritos('cargandoFavoritos');
  insertarEsqueletos(document.getElementById('cargandoFavoritos'), Math.min(ids.length, 4));
  actualizarContadorFavoritosPagina(ids.length);

  try {
    const resultados = await Promise.all(
      ids.map(async (id) => {
        try {
          const { producto } = await TiendaAPI.obtenerProducto(id);
          return { id, producto };
        } catch (error) {
          if (error.estado === 404) return { id, producto: null };
          throw error;
        }
      })
    );

    // Limpia ids que ya no existen en el catálogo.
    const idsVigentes = resultados.filter((resultado) => resultado.producto).map((resultado) => resultado.id);
    if (idsVigentes.length !== ids.length) {
      guardarFavoritos(idsVigentes);
      actualizarContadorFavoritos();
    }

    if (idsVigentes.length === 0) {
      mostrarPantallaFavoritos('favoritosVacio');
      actualizarContadorFavoritosPagina(0);
      return;
    }

    renderizarFavoritos(resultados.filter((resultado) => resultado.producto).map((resultado) => resultado.producto));
    mostrarPantallaFavoritos('gridFavoritos');
  } catch (error) {
    const contenedor = document.getElementById('errorFavoritos');
    if (contenedor) mostrarErrorCarga(contenedor, error.message, cargarFavoritosPagina);
    mostrarPantallaFavoritos('errorFavoritos');
  }
}

function mostrarPantallaFavoritos(idVisible) {
  ['cargandoFavoritos', 'errorFavoritos', 'favoritosVacio', 'gridFavoritos'].forEach((id) => {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    elemento.classList.toggle('hidden', id !== idVisible);
    if (id === 'gridFavoritos' && id === idVisible) elemento.classList.add('grid');
  });
}

function renderizarFavoritos(productos) {
  const grid = document.getElementById('gridFavoritos');
  if (!grid) return;

  grid.innerHTML = '';
  actualizarContadorFavoritosPagina(productos.length);

  productos.forEach((producto) => {
    const tarjeta = crearTarjetaProducto(producto, {
      alQuitarFavorito: (articulo) => retirarTarjetaFavorito(articulo)
    });
    tarjeta.classList.add('animar-aparecer');
    grid.appendChild(tarjeta);
  });
}

function retirarTarjetaFavorito(articulo) {
  const grid = document.getElementById('gridFavoritos');
  if (!articulo || !grid) return;

  articulo.classList.add('saliendo-favorito');

  window.setTimeout(() => {
    articulo.remove();

    const restantes = grid.querySelectorAll('article').length;
    actualizarContadorFavoritosPagina(restantes);

    if (restantes === 0) {
      mostrarPantallaFavoritos('favoritosVacio');
    }
  }, 220);
}

function actualizarContadorFavoritosPagina(cantidad) {
  const contador = document.getElementById('contadorFavoritosPagina');
  if (!contador) return;

  contador.textContent =
    cantidad === 0
      ? 'Sin favoritos guardados'
      : `${cantidad} producto${cantidad === 1 ? '' : 's'} guardado${cantidad === 1 ? '' : 's'}`;
}

document.addEventListener('DOMContentLoaded', iniciarPaginaFavoritos);
