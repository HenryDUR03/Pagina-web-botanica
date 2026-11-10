// Único punto de acceso a datos de la tienda.
// Si js/config.js tiene SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY, se usa
// Supabase. Si están vacías, se usa el catálogo de js/productos.js y los
// pedidos se guardan en localStorage. Las respuestas tienen el mismo formato
// en ambos modos para que el resto de la aplicación no cambie.

class ErrorApi extends Error {
  constructor(mensaje, estado = 0, codigo = 'ERROR', detalles = []) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

const MODO_SUPABASE = Boolean(
  String(window.TIENDA_CONFIG?.SUPABASE_URL ?? '').trim() &&
    String(window.TIENDA_CONFIG?.SUPABASE_PUBLISHABLE_KEY ?? '').trim()
);

const CLAVES = window.TIENDA_CONFIG.CLAVES;
const LIMITE_DEFECTO = 12;
const LIMITE_MAXIMO = 60;
const MAXIMO_ITEMS_PEDIDO = 30;

/* --------------------------- Utilidades comunes --------------------------- */

function clonar(valor) {
  return JSON.parse(JSON.stringify(valor));
}

function normalizarTexto(valor) {
  return String(valor ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function limpiarTexto(valor) {
  return String(valor ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}

function correoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);
}

// Claves que nunca deben llegar desde el navegador (el pago es simulado).
const CLAVES_DE_TARJETA = [
  'tarjeta',
  'numerotarjeta',
  'numerodetarjeta',
  'cvv',
  'cvc',
  'vencimiento',
  'expiracion',
  'cardnumber',
  'card',
  'creditcard',
  'titular'
];

function contieneDatosDeTarjeta(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return false;

  return Object.entries(cuerpo).some(([clave, valor]) => {
    const claveNormalizada = normalizarTexto(clave).replace(/[^a-z0-9]/g, '');
    if (CLAVES_DE_TARJETA.includes(claveNormalizada)) return true;
    return valor && typeof valor === 'object' && contieneDatosDeTarjeta(valor);
  });
}

/* ------------------------------ Modo local ------------------------------- */

function leerJsonLocal(clave, respaldo) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave) ?? 'null');
    return datos ?? respaldo;
  } catch {
    return respaldo;
  }
}

function guardarJsonLocal(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    throw new ErrorApi(
      'No pudimos guardar los datos en este navegador. Revisa el espacio disponible.',
      0,
      'ALMACENAMIENTO_LLENO'
    );
  }
}

// El stock local se guarda aparte para conservar los ajustes entre compras.
function obtenerStockLocal() {
  const datos = leerJsonLocal(CLAVES.STOCK_LOCAL, {});
  return datos && typeof datos === 'object' && !Array.isArray(datos) ? datos : {};
}

function stockActual(producto, ajustes) {
  if (Object.prototype.hasOwnProperty.call(ajustes, producto.id)) {
    return Number(ajustes[producto.id]) || 0;
  }
  return Number(producto.stock) || 0;
}

function productosConStock() {
  const ajustes = obtenerStockLocal();
  return window.PRODUCTOS_LOCALES.map((producto) => ({
    ...producto,
    stock: stockActual(producto, ajustes)
  }));
}

function obtenerCategoriasLocal() {
  const productos = productosConStock();
  return {
    categorias: window.CATEGORIAS_LOCALES.map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre,
      slug: categoria.slug,
      total_productos: productos.filter((producto) => producto.categoria_id === categoria.id).length
    }))
  };
}

function obtenerProductosLocal({ categoria, buscar, orden, limit, offset } = {}) {
  const productos = productosConStock();
  const categoriaBuscada = normalizarTexto(categoria);
  const textoBuscado = normalizarTexto(buscar);

  let filtrados = productos;

  if (categoriaBuscada) {
    filtrados = filtrados.filter(
      (producto) =>
        normalizarTexto(producto.categoria_slug) === categoriaBuscada ||
        normalizarTexto(producto.categoria_nombre) === categoriaBuscada
    );
  }

  if (textoBuscado) {
    filtrados = filtrados.filter((producto) => normalizarTexto(producto.nombre).includes(textoBuscado));
  }

  if (orden === 'precio_asc') {
    filtrados = [...filtrados].sort((a, b) => a.precio - b.precio || a.id - b.id);
  } else if (orden === 'precio_desc') {
    filtrados = [...filtrados].sort((a, b) => b.precio - a.precio || a.id - b.id);
  } else {
    filtrados = [...filtrados].sort((a, b) => a.id - b.id);
  }

  const limite = Math.min(Math.max(Number.parseInt(limit, 10) || LIMITE_DEFECTO, 1), LIMITE_MAXIMO);
  const desde = Math.max(Number.parseInt(offset, 10) || 0, 0);
  const pagina = filtrados.slice(desde, desde + limite);

  return {
    productos: clonar(pagina),
    total: filtrados.length,
    limite,
    offset: desde,
    hay_mas: desde + pagina.length < filtrados.length
  };
}

function obtenerProductoLocal(id) {
  const numero = Number.parseInt(id, 10);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorApi('El id del producto no es válido.', 400, 'ID_INVALIDO');
  }

  const producto = productosConStock().find((item) => item.id === numero);
  if (!producto) {
    throw new ErrorApi('El producto solicitado no existe.', 404, 'PRODUCTO_NO_ENCONTRADO');
  }

  return { producto: clonar(producto) };
}

function validarPedidoLocal(cuerpo) {
  if (contieneDatosDeTarjeta(cuerpo)) {
    throw new ErrorApi(
      'No envíes datos de tarjeta: el pago es simulado y esos datos no se reciben.',
      400,
      'DATOS_NO_PERMITIDOS'
    );
  }

  const errores = [];
  const cliente = cuerpo?.cliente ?? {};

  const nombre = limpiarTexto(cliente.nombre);
  const correo = limpiarTexto(cliente.correo).toLowerCase();
  const telefono = limpiarTexto(cliente.telefono);
  const direccion = limpiarTexto(cliente.direccion);
  const ciudad = limpiarTexto(cliente.ciudad);

  if (nombre.length < 3) {
    errores.push({ campo: 'cliente.nombre', mensaje: 'El nombre debe tener al menos 3 caracteres.' });
  } else if (nombre.length > 120) {
    errores.push({ campo: 'cliente.nombre', mensaje: 'El nombre no puede superar 120 caracteres.' });
  }

  if (!correo || !correoValido(correo) || correo.length > 160) {
    errores.push({ campo: 'cliente.correo', mensaje: 'Ingresa un correo electrónico válido.' });
  }

  const digitosTelefono = telefono.replace(/\D/g, '');
  if (digitosTelefono.length < 7 || digitosTelefono.length > 15) {
    errores.push({ campo: 'cliente.telefono', mensaje: 'El teléfono debe tener entre 7 y 15 dígitos.' });
  }

  if (direccion.length < 5 || direccion.length > 200) {
    errores.push({ campo: 'cliente.direccion', mensaje: 'La dirección debe tener entre 5 y 200 caracteres.' });
  }

  if (ciudad.length < 2 || ciudad.length > 80) {
    errores.push({ campo: 'cliente.ciudad', mensaje: 'Ingresa una ciudad válida.' });
  }

  // Normaliza y fusiona items repetidos del mismo producto.
  const acumulados = new Map();
  const items = Array.isArray(cuerpo?.items) ? cuerpo.items : [];

  if (items.length === 0) {
    errores.push({ campo: 'items', mensaje: 'El pedido debe incluir al menos un producto.' });
  } else if (items.length > MAXIMO_ITEMS_PEDIDO) {
    errores.push({ campo: 'items', mensaje: 'El pedido supera el máximo de 30 productos distintos.' });
  }

  for (const item of items) {
    const productoId = Number(item?.producto_id);
    const cantidad = Number(item?.cantidad);

    if (!Number.isInteger(productoId) || productoId <= 0) {
      errores.push({ campo: 'items', mensaje: 'Cada item debe tener un producto_id válido.' });
      continue;
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0 || cantidad > 99) {
      errores.push({ campo: 'items', mensaje: 'Cada cantidad debe ser un entero entre 1 y 99.' });
      continue;
    }

    const acumulada = (acumulados.get(productoId) ?? 0) + cantidad;
    if (acumulada > 99) {
      errores.push({ campo: 'items', mensaje: 'La cantidad por producto no puede superar 99 unidades.' });
      continue;
    }
    acumulados.set(productoId, acumulada);
  }

  const cupon = cuerpo?.cupon ? limpiarTexto(cuerpo.cupon).toUpperCase() : null;
  const metodoPago = limpiarTexto(cuerpo?.metodo_pago) || 'tarjeta_simulada';

  if (metodoPago !== 'tarjeta_simulada') {
    errores.push({ campo: 'metodo_pago', mensaje: 'Método de pago no soportado.' });
  }

  if (errores.length > 0) {
    throw new ErrorApi('Revisa los datos del pedido.', 400, 'DATOS_INVALIDOS', errores);
  }

  return {
    cliente: { nombre, correo, telefono, direccion, ciudad },
    items: [...acumulados.entries()].map(([producto_id, cantidad]) => ({ producto_id, cantidad })),
    cupon,
    metodo_pago: metodoPago
  };
}

function generarNumeroPedido() {
  const bytes = new Uint8Array(6);

  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let indice = 0; indice < bytes.length; indice += 1) {
      bytes[indice] = Math.floor(Math.random() * 256);
    }
  }

  const hexadecimal = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `PED-${hexadecimal.toUpperCase()}`;
}

function leerPedidosLocales() {
  const datos = leerJsonLocal(CLAVES.PEDIDOS_LOCALES, []);
  return Array.isArray(datos) ? datos : [];
}

function crearPedidoLocal(cuerpo) {
  const datos = validarPedidoLocal(cuerpo);
  const productos = productosConStock();
  const ajustesStock = obtenerStockLocal();

  const cupon = datos.cupon ? window.TIENDA_CONFIG.CUPONES[datos.cupon] : null;
  if (datos.cupon && !cupon) {
    throw new ErrorApi('El cupón ingresado no es válido.', 400, 'CUPON_INVALIDO');
  }

  const faltantes = [];
  const sinStock = [];
  const lineas = [];

  for (const item of datos.items) {
    const producto = productos.find((elemento) => elemento.id === item.producto_id);

    if (!producto) {
      faltantes.push({
        producto_id: item.producto_id,
        nombre: 'Producto no disponible',
        solicitado: item.cantidad,
        disponible: 0
      });
      continue;
    }

    if (producto.stock < item.cantidad) {
      sinStock.push({
        producto_id: producto.id,
        nombre: producto.nombre,
        solicitado: item.cantidad,
        disponible: producto.stock
      });
      continue;
    }

    lineas.push({
      producto_id: producto.id,
      nombre: producto.nombre,
      imagen_url: producto.imagen_url,
      cantidad: item.cantidad,
      precio_unitario: producto.precio,
      subtotal: producto.precio * item.cantidad
    });
  }

  if (faltantes.length > 0) {
    throw new ErrorApi(
      'Uno o más productos ya no están disponibles.',
      400,
      'PRODUCTO_NO_ENCONTRADO',
      faltantes
    );
  }

  if (sinStock.length > 0) {
    throw new ErrorApi(
      'No hay stock suficiente para uno o más productos.',
      409,
      'STOCK_INSUFICIENTE',
      sinStock
    );
  }

  const subtotal = lineas.reduce((total, linea) => total + linea.subtotal, 0);
  const descuento = cupon ? Math.round((subtotal * cupon.porcentaje) / 100) : 0;
  const envio = subtotal >= window.TIENDA_CONFIG.ENVIO.GRATIS_DESDE ? 0 : window.TIENDA_CONFIG.ENVIO.COSTO;
  const total = Math.max(0, subtotal - descuento + envio);

  const pedidos = leerPedidosLocales();
  const nuevoId = pedidos.reduce((maximo, pedido) => Math.max(maximo, Number(pedido.id) || 0), 0) + 1;

  const pedido = {
    id: nuevoId,
    numero_pedido: generarNumeroPedido(),
    estado: 'confirmado',
    creado_en: new Date().toISOString(),
    subtotal,
    descuento,
    envio,
    cupon: cupon?.codigo ?? null,
    total,
    metodo_pago: datos.metodo_pago,
    cliente: datos.cliente,
    items: lineas
  };

  // Solo se descuenta el stock cuando todas las líneas fueron validadas.
  lineas.forEach((linea) => {
    const producto = productos.find((elemento) => elemento.id === linea.producto_id);
    ajustesStock[linea.producto_id] = producto.stock - linea.cantidad;
  });

  pedidos.push(pedido);
  guardarJsonLocal(CLAVES.PEDIDOS_LOCALES, pedidos);
  guardarJsonLocal(CLAVES.STOCK_LOCAL, ajustesStock);

  return { pedido: clonar(pedido) };
}

function obtenerPedidoLocal(numero, correo) {
  const numeroLimpio = String(numero ?? '').trim().toUpperCase();
  const correoLimpio = String(correo ?? '').trim().toLowerCase();

  if (!/^PED-[A-F0-9]{6,20}$/.test(numeroLimpio)) {
    throw new ErrorApi(
      'El número de pedido debe tener el formato PED-XXXXXXXXXX.',
      400,
      'NUMERO_INVALIDO'
    );
  }

  if (!correoLimpio || !correoValido(correoLimpio)) {
    throw new ErrorApi(
      'Ingresa el correo con el que hiciste el pedido.',
      400,
      'CORREO_INVALIDO'
    );
  }

  const pedido = leerPedidosLocales().find(
    (elemento) =>
      elemento.numero_pedido === numeroLimpio &&
      normalizarTexto(elemento.cliente?.correo) === normalizarTexto(correoLimpio)
  );

  if (!pedido) {
    throw new ErrorApi(
      'No encontramos un pedido con ese número y correo.',
      404,
      'PEDIDO_NO_ENCONTRADO'
    );
  }

  return { pedido: clonar(pedido) };
}

/* ---------------------------- Modo Supabase ------------------------------ */

const CAMPOS_PRODUCTO =
  'id,nombre,descripcion,precio,stock,imagen_url,cuidados,creado_en,categoria_id,categorias!inner(nombre,slug)';

let clienteSupabase = null;

function obtenerClienteSupabase() {
  if (clienteSupabase) return clienteSupabase;

  const url = String(window.TIENDA_CONFIG.SUPABASE_URL ?? '').trim();
  const llave = String(window.TIENDA_CONFIG.SUPABASE_PUBLISHABLE_KEY ?? '').trim();

  if (!window.supabase?.createClient) {
    throw new ErrorApi(
      'No pudimos cargar la librería de Supabase. Revisa tu conexión y recarga la página.',
      503,
      'SUPABASE_NO_CARGADO'
    );
  }

  try {
    new URL(url);
  } catch {
    throw new ErrorApi(
      'La URL de Supabase en js/config.js no es válida.',
      503,
      'SUPABASE_CONFIG_INVALIDA'
    );
  }

  clienteSupabase = window.supabase.createClient(url, llave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });

  return clienteSupabase;
}

function mapearProducto(fila) {
  const { categorias, ...producto } = fila;
  return {
    ...producto,
    categoria_nombre: categorias?.nombre ?? '',
    categoria_slug: categorias?.slug ?? ''
  };
}

// PostgREST usa LIKE: escapamos comodines para que el texto sea literal.
function escaparLike(texto) {
  return String(texto ?? '').replace(/[\\%_]/g, '\\$&');
}

function parsearDetalles(detalle) {
  if (!detalle) return [];
  if (Array.isArray(detalle)) return detalle;

  try {
    const datos = JSON.parse(detalle);
    return Array.isArray(datos) ? datos : [datos];
  } catch {
    return [];
  }
}

function esErrorDeRed(error) {
  return /failed to fetch|networkerror|load failed|fetch failed/i.test(
    String(error?.message ?? '')
  );
}

function traducirErrorConsulta(error) {
  if (esErrorDeRed(error)) {
    return new ErrorApi(
      'No pudimos conectar con Supabase. Revisa tu conexión e intenta de nuevo.',
      0,
      'SIN_CONEXION'
    );
  }

  console.warn('[TiendaAPI] Error de Supabase:', error);
  return new ErrorApi(
    'No pudimos cargar la información de la tienda. Intenta de nuevo.',
    500,
    'ERROR_SUPABASE'
  );
}

function traducirErrorRpc(error) {
  if (esErrorDeRed(error)) {
    return new ErrorApi(
      'No pudimos conectar con Supabase. Revisa tu conexión e intenta de nuevo.',
      0,
      'SIN_CONEXION'
    );
  }

  const mensaje = String(error?.message ?? '').trim();

  switch (error?.code) {
    case 'PED01':
      return new ErrorApi(mensaje || 'Revisa los datos del pedido.', 400, 'DATOS_INVALIDOS');
    case 'PED02':
      return new ErrorApi(
        mensaje || 'Uno o más productos ya no están disponibles.',
        400,
        'PRODUCTO_NO_ENCONTRADO',
        parsearDetalles(error?.details)
      );
    case 'PED03':
      return new ErrorApi(
        mensaje || 'No hay stock suficiente para uno o más productos.',
        409,
        'STOCK_INSUFICIENTE',
        parsearDetalles(error?.details)
      );
    case 'PED04':
      return new ErrorApi(mensaje || 'El cupón ingresado no es válido.', 400, 'CUPON_INVALIDO');
    case 'PED05':
      return new ErrorApi(mensaje || 'El número de pedido no es válido.', 400, 'NUMERO_INVALIDO');
    case 'PED06':
      return new ErrorApi(
        mensaje || 'No encontramos un pedido con ese número y correo.',
        404,
        'PEDIDO_NO_ENCONTRADO'
      );
    default:
      console.warn('[TiendaAPI] Error de Supabase:', error);
      return new ErrorApi(
        'No pudimos completar la operación. Intenta de nuevo.',
        500,
        'ERROR_SUPABASE'
      );
  }
}

async function obtenerCategoriasSupabase() {
  const cliente = obtenerClienteSupabase();

  const [respuestaCategorias, respuestaProductos] = await Promise.all([
    cliente.from('categorias').select('id, nombre, slug').order('id'),
    cliente.from('productos').select('categoria_id')
  ]);

  if (respuestaCategorias.error) throw traducirErrorConsulta(respuestaCategorias.error);
  if (respuestaProductos.error) throw traducirErrorConsulta(respuestaProductos.error);

  const conteos = new Map();
  (respuestaProductos.data ?? []).forEach((producto) => {
    conteos.set(producto.categoria_id, (conteos.get(producto.categoria_id) ?? 0) + 1);
  });

  return {
    categorias: (respuestaCategorias.data ?? []).map((categoria) => ({
      ...categoria,
      total_productos: conteos.get(categoria.id) ?? 0
    }))
  };
}

async function obtenerProductosSupabase({ categoria, buscar, orden, limit, offset } = {}) {
  const cliente = obtenerClienteSupabase();

  const limite = Math.min(Math.max(Number.parseInt(limit, 10) || LIMITE_DEFECTO, 1), LIMITE_MAXIMO);
  const desde = Math.max(Number.parseInt(offset, 10) || 0, 0);

  let consulta = cliente
    .from('productos')
    .select(CAMPOS_PRODUCTO, { count: 'exact' });

  if (categoria) {
    consulta = consulta.eq('categorias.slug', categoria);
  }

  if (buscar) {
    consulta = consulta.ilike('nombre', `%${escaparLike(buscar)}%`);
  }

  if (orden === 'precio_asc') {
    consulta = consulta.order('precio', { ascending: true }).order('id', { ascending: true });
  } else if (orden === 'precio_desc') {
    consulta = consulta.order('precio', { ascending: false }).order('id', { ascending: true });
  } else {
    consulta = consulta.order('id', { ascending: true });
  }

  const { data, error, count } = await consulta.range(desde, desde + limite - 1);

  if (error) throw traducirErrorConsulta(error);

  const productos = (data ?? []).map(mapearProducto);
  const total = count ?? 0;

  return {
    productos,
    total,
    limite,
    offset: desde,
    hay_mas: desde + productos.length < total
  };
}

async function obtenerProductoSupabase(id) {
  const numero = Number.parseInt(id, 10);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorApi('El id del producto no es válido.', 400, 'ID_INVALIDO');
  }

  const cliente = obtenerClienteSupabase();
  const { data, error } = await cliente
    .from('productos')
    .select(CAMPOS_PRODUCTO)
    .eq('id', numero)
    .maybeSingle();

  if (error) throw traducirErrorConsulta(error);
  if (!data) {
    throw new ErrorApi('El producto solicitado no existe.', 404, 'PRODUCTO_NO_ENCONTRADO');
  }

  return { producto: mapearProducto(data) };
}

async function crearPedidoSupabase(pedido) {
  if (contieneDatosDeTarjeta(pedido)) {
    throw new ErrorApi(
      'No envíes datos de tarjeta: el pago es simulado y esos datos no se reciben.',
      400,
      'DATOS_NO_PERMITIDOS'
    );
  }

  const cliente = obtenerClienteSupabase();
  const { data, error } = await cliente.rpc('crear_pedido', { datos: pedido });

  if (error) throw traducirErrorRpc(error);
  if (!data?.numero_pedido) {
    throw new ErrorApi(
      'No pudimos confirmar el pedido. Intenta de nuevo.',
      500,
      'RESPUESTA_INVALIDA'
    );
  }

  return { pedido: data };
}

async function obtenerPedidoSupabase(numero, correo) {
  const cliente = obtenerClienteSupabase();
  const { data, error } = await cliente.rpc('obtener_pedido', {
    numero: String(numero ?? '').trim().toUpperCase(),
    correo: String(correo ?? '').trim().toLowerCase()
  });

  if (error) throw traducirErrorRpc(error);
  if (!data?.numero_pedido) {
    throw new ErrorApi(
      'No encontramos un pedido con ese número y correo.',
      404,
      'PEDIDO_NO_ENCONTRADO'
    );
  }

  return { pedido: data };
}

const apiSupabase = {
  obtenerCategorias: obtenerCategoriasSupabase,
  obtenerProductos: obtenerProductosSupabase,
  obtenerProducto: obtenerProductoSupabase,
  crearPedido: crearPedidoSupabase,
  obtenerPedido: obtenerPedidoSupabase
};

/* ------------------------------- Fachada --------------------------------- */

window.TiendaAPI = {
  modo: MODO_SUPABASE ? 'supabase' : 'local',
  etiquetaModo: MODO_SUPABASE ? 'Modo Supabase' : 'Modo local',
  ErrorApi,

  async obtenerCategorias() {
    return MODO_SUPABASE ? apiSupabase.obtenerCategorias() : obtenerCategoriasLocal();
  },

  async obtenerProductos(opciones = {}) {
    return MODO_SUPABASE ? apiSupabase.obtenerProductos(opciones) : obtenerProductosLocal(opciones);
  },

  async obtenerProducto(id) {
    return MODO_SUPABASE ? apiSupabase.obtenerProducto(id) : obtenerProductoLocal(id);
  },

  async crearPedido(pedido) {
    return MODO_SUPABASE ? apiSupabase.crearPedido(pedido) : crearPedidoLocal(pedido);
  },

  async obtenerPedido(numero, correo) {
    return MODO_SUPABASE ? apiSupabase.obtenerPedido(numero, correo) : obtenerPedidoLocal(numero, correo);
  }
};

window.ErrorApi = ErrorApi;

