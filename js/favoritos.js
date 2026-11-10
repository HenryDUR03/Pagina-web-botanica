// Lista de favoritos guardada en localStorage.
// Solo guardamos ids de producto; los datos se consultan a la API.

function obtenerFavoritos() {
  try {
    const datos = JSON.parse(localStorage.getItem(TIENDA_CONFIG.CLAVES.FAVORITOS) ?? '[]');
    if (!Array.isArray(datos)) return [];
    const ids = datos
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
    return [...new Set(ids)];
  } catch {
    return [];
  }
}

function guardarFavoritos(ids) {
  try {
    localStorage.setItem(TIENDA_CONFIG.CLAVES.FAVORITOS, JSON.stringify(ids));
  } catch {
    // Si localStorage no está disponible, la app sigue funcionando sin persistir.
  }
}

function esFavorito(id) {
  return obtenerFavoritos().includes(Number(id));
}

// Devuelve el nuevo estado: true si quedó como favorito.
function alternarFavorito(id) {
  const productoId = Number(id);
  const favoritos = obtenerFavoritos();
  const yaEstaba = favoritos.includes(productoId);
  const nuevos = yaEstaba
    ? favoritos.filter((favoritoId) => favoritoId !== productoId)
    : [...favoritos, productoId];

  guardarFavoritos(nuevos);
  actualizarContadorFavoritos();
  return !yaEstaba;
}

function actualizarContadorFavoritos() {
  const cantidad = obtenerFavoritos().length;
  document.querySelectorAll('.contador-favoritos').forEach((elemento) => {
    elemento.textContent = String(cantidad);
    elemento.classList.toggle('hidden', cantidad === 0);
  });
}
