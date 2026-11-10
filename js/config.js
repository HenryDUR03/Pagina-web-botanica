// Configuración compartida del frontend.
// Este archivo se sube al repositorio: la llave publicable de Supabase es
// pública por diseño. Nunca agregues aquí la secret key ni la service_role.

window.TIENDA_CONFIG = {
  // Déjalas vacías para trabajar en modo local (productos de js/productos.js
  // y pedidos en localStorage). Si ambas tienen valor, la tienda usa Supabase.
  SUPABASE_URL: '',
  SUPABASE_PUBLISHABLE_KEY: '',

  MONEDA: 'COP',

  ENVIO: {
    GRATIS_DESDE: 150000,
    COSTO: 12000
  },

  CUPONES: {
    PLANTA10: {
      codigo: 'PLANTA10',
      porcentaje: 10,
      descripcion: '10% de descuento'
    }
  },

  PAGINACION: 8,

  // Número de WhatsApp con indicativo del país, sin espacios ni signos.
  WHATSAPP: '573001234567',

  CLAVES: {
    CARRITO: 'tienda_plantas_carrito',
    CUPON: 'tienda_cupon',
    FAVORITOS: 'tienda_favoritos',
    TEMA: 'tienda_tema',
    PEDIDOS_LOCALES: 'tienda_pedidos_locales',
    STOCK_LOCAL: 'tienda_stock_local',
    ULTIMO_PEDIDO: 'tienda_ultimo_pedido'
  }
};
