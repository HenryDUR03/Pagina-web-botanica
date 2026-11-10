// Catálogo para el modo local (sin Supabase).
// Mantiene el mismo formato que devuelve la API para que el resto de la app
// no necesite saber de dónde vienen los datos.

window.CATEGORIAS_LOCALES = [
  { id: 1, nombre: 'Semillas', slug: 'semillas' },
  { id: 2, nombre: 'Plantas', slug: 'plantas' },
  { id: 3, nombre: 'Materas', slug: 'materas' },
  { id: 4, nombre: 'Abono', slug: 'abono' }
];

const BASE_UNSPLASH_LOCAL = 'https://images.unsplash.com/';
const PARAMETROS_UNSPLASH_LOCAL = '?q=80&w=900&auto=format&fit=crop';
const fotoLocal = (id) => `${BASE_UNSPLASH_LOCAL}${id}${PARAMETROS_UNSPLASH_LOCAL}`;

window.PRODUCTOS_LOCALES = [
  /* ----------------------------- Semillas ----------------------------- */
  {
    id: 1,
    categoria_id: 1,
    categoria_nombre: 'Semillas',
    categoria_slug: 'semillas',
    nombre: 'Semillas de Tomate Cherry',
    descripcion:
      'Semillas de tomate cherry para cultivo casero. Alta germinación y sabor dulce, ideales para macetas o huerta urbana.',
    precio: 8500,
    stock: 50,
    imagen_url: fotoLocal('photo-1592841200221-a6898f307baa'),
    creado_en: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 2,
    categoria_id: 1,
    categoria_nombre: 'Semillas',
    categoria_slug: 'semillas',
    nombre: 'Semillas de Albahaca',
    descripcion:
      'Aromática de crecimiento rápido. Perfecta para cocina fresca, macetas de balcón y huertas caseras.',
    precio: 4500,
    stock: 80,
    imagen_url: fotoLocal('photo-1615484477778-ca3b77940c25'),
    creado_en: '2026-01-15T10:05:00.000Z'
  },
  {
    id: 3,
    categoria_id: 1,
    categoria_nombre: 'Semillas',
    categoria_slug: 'semillas',
    nombre: 'Semillas de Perejil',
    descripcion:
      'Semillas de perejil liso para aromatizar tus platillos. Tolera semisombra y se adapta a interiores.',
    precio: 3800,
    stock: 90,
    imagen_url: fotoLocal('photo-1592150621744-aca64f48394a'),
    creado_en: '2026-01-15T10:10:00.000Z'
  },
  {
    id: 4,
    categoria_id: 1,
    categoria_nombre: 'Semillas',
    categoria_slug: 'semillas',
    nombre: 'Semillas de Cilantro',
    descripcion:
      'Cilantro fresco de hoja ancha, con germinación pareja y aroma intenso. Incluye instrucciones de siembra.',
    precio: 4200,
    stock: 60,
    imagen_url: fotoLocal('photo-1521334884684-d80222895322'),
    creado_en: '2026-01-15T10:15:00.000Z'
  },
  {
    id: 5,
    categoria_id: 1,
    categoria_nombre: 'Semillas',
    categoria_slug: 'semillas',
    nombre: 'Semillas de Girasol Enano',
    descripcion:
      'Variedad compacta de girasol, ideal para terrazas y macetas grandes. Flores amarillas en pocas semanas.',
    precio: 5200,
    stock: 45,
    imagen_url: fotoLocal('photo-1521334884684-d80222895322'),
    creado_en: '2026-01-15T10:20:00.000Z'
  },

  /* ------------------------------ Plantas ----------------------------- */
  {
    id: 6,
    categoria_id: 2,
    categoria_nombre: 'Plantas',
    categoria_slug: 'plantas',
    nombre: 'Monstera Deliciosa',
    descripcion:
      'Planta tropical con hojas grandes y fenestradas. Ideal para interiores luminosos y rincones con luz indirecta.',
    precio: 65000,
    stock: 12,
    imagen_url: fotoLocal('photo-1614594895304-fe7116ac3b58'),
    creado_en: '2026-01-16T09:00:00.000Z',
    cuidados: {
      luz: 'Luz indirecta brillante, sin sol directo fuerte',
      riego: 'Cada 7 a 10 días, cuando la tierra esté seca',
      tamano: '60 a 90 cm en interior'
    }
  },
  {
    id: 7,
    categoria_id: 2,
    categoria_nombre: 'Plantas',
    categoria_slug: 'plantas',
    nombre: 'Suculenta Echeveria',
    descripcion:
      'Roseta compacta de bajo mantenimiento. Necesita poca agua y luz abundante; perfecta para escritorios.',
    precio: 15000,
    stock: 25,
    imagen_url: fotoLocal('photo-1485955900006-10f4d324d411'),
    creado_en: '2026-01-16T09:05:00.000Z',
    cuidados: {
      luz: 'Mucha luz, incluso sol directo suave',
      riego: 'Cada 15 a 20 días, muy moderado',
      tamano: '8 a 12 cm de diámetro'
    }
  },
  {
    id: 8,
    categoria_id: 2,
    categoria_nombre: 'Plantas',
    categoria_slug: 'plantas',
    nombre: 'Pothos Dorado',
    descripcion:
      'Planta colgante de crecimiento rápido que purifica el aire. Tolera interiores con luz media.',
    precio: 28000,
    stock: 18,
    imagen_url: fotoLocal('photo-1463320898484-cdee8141c787'),
    creado_en: '2026-01-16T09:10:00.000Z',
    cuidados: {
      luz: 'Luz media o indirecta; evita el sol fuerte',
      riego: 'Cada 7 días, dejando secar la superficie',
      tamano: 'Guías de 40 a 80 cm'
    }
  },
  {
    id: 9,
    categoria_id: 2,
    categoria_nombre: 'Plantas',
    categoria_slug: 'plantas',
    nombre: 'Cactus San Pedro',
    descripcion:
      'Cactus columnar resistente, ideal para exteriores soleados. Producto temporalmente agotado.',
    precio: 22000,
    stock: 0,
    imagen_url: fotoLocal('photo-1459411552884-841db9b3cc2a'),
    creado_en: '2026-01-16T09:15:00.000Z',
    cuidados: {
      luz: 'Sol directo la mayor parte del día',
      riego: 'Cada 20 a 30 días en temporada cálida',
      tamano: '30 a 60 cm de altura'
    }
  },
  {
    id: 10,
    categoria_id: 2,
    categoria_nombre: 'Plantas',
    categoria_slug: 'plantas',
    nombre: 'Helecho de Boston',
    descripcion:
      'Helecho colgante de hojas finas y frondosas. Le encanta la humedad ambiental y la luz suave.',
    precio: 34000,
    stock: 9,
    imagen_url: fotoLocal('photo-1466692476868-aef1dfb1e735'),
    creado_en: '2026-01-16T09:20:00.000Z',
    cuidados: {
      luz: 'Luz suave e indirecta',
      riego: 'Cada 3 a 4 días; mantén humedad ambiental',
      tamano: '30 a 50 cm de diámetro'
    }
  },
  {
    id: 11,
    categoria_id: 2,
    categoria_nombre: 'Plantas',
    categoria_slug: 'plantas',
    nombre: 'Árbol de Jade',
    descripcion:
      'Suculenta arbustiva de hojas redondas, muy resistente. Simboliza prosperidad y requiere riegos espaciados.',
    precio: 26000,
    stock: 14,
    imagen_url: fotoLocal('photo-1520412099551-62b6bafeb5bb'),
    creado_en: '2026-01-16T09:25:00.000Z',
    cuidados: {
      luz: 'Luz abundante con algo de sol directo',
      riego: 'Cada 12 a 15 días, con buen drenaje',
      tamano: '25 a 45 cm de altura'
    }
  },
  {
    id: 12,
    categoria_id: 2,
    categoria_nombre: 'Plantas',
    categoria_slug: 'plantas',
    nombre: 'Calathea Orbifolia',
    descripcion:
      'Hojas anchas con rayas plateadas y movimiento diario. Prefiere luz indirecta y humedad constante.',
    precio: 48000,
    stock: 6,
    imagen_url: fotoLocal('photo-1470058869958-2a77ade41c02'),
    creado_en: '2026-01-16T09:30:00.000Z',
    cuidados: {
      luz: 'Luz indirecta media, nunca sol directo',
      riego: 'Cada 4 a 5 días con agua sin cal',
      tamano: '40 a 60 cm de altura'
    }
  },

  /* ------------------------------ Materas ----------------------------- */
  {
    id: 13,
    categoria_id: 3,
    categoria_nombre: 'Materas',
    categoria_slug: 'materas',
    nombre: 'Matera de Barro Grande',
    descripcion:
      'Matera de barro natural, porosa y con buen drenaje. Ideal para plantas que necesitan aireación en la raíz.',
    precio: 32000,
    stock: 15,
    imagen_url: fotoLocal('photo-1604762524889-3e2fcc145683'),
    creado_en: '2026-01-17T11:00:00.000Z'
  },
  {
    id: 14,
    categoria_id: 3,
    categoria_nombre: 'Materas',
    categoria_slug: 'materas',
    nombre: 'Matera Cerámica Blanca',
    descripcion:
      'Cerámica esmaltada con acabado mate. Un contraste limpio para interiores modernos y luminosos.',
    precio: 45000,
    stock: 10,
    imagen_url: fotoLocal('photo-1416879595882-3373a0480b5b'),
    creado_en: '2026-01-17T11:05:00.000Z'
  },
  {
    id: 15,
    categoria_id: 3,
    categoria_nombre: 'Materas',
    categoria_slug: 'materas',
    nombre: 'Matera Colgante Macramé',
    descripcion:
      'Soporte tejido a mano con matera de cerámica incluida. Perfecta para pothos y plantas colgantes.',
    precio: 28000,
    stock: 7,
    imagen_url: fotoLocal('photo-1509423350716-97f9360b4e09'),
    creado_en: '2026-01-17T11:10:00.000Z'
  },
  {
    id: 16,
    categoria_id: 3,
    categoria_nombre: 'Materas',
    categoria_slug: 'materas',
    nombre: 'Matera Autorriego 3L',
    descripcion:
      'Sistema de reserva de agua para olvidarte del riego por semanas. Incluye indicador de nivel.',
    precio: 39000,
    stock: 11,
    imagen_url: fotoLocal('photo-1604762524889-3e2fcc145683'),
    creado_en: '2026-01-17T11:15:00.000Z'
  },

  /* ------------------------------- Abono ------------------------------ */
  {
    id: 17,
    categoria_id: 4,
    categoria_nombre: 'Abono',
    categoria_slug: 'abono',
    nombre: 'Abono Orgánico 1kg',
    descripcion:
      'Mezcla orgánica rica en nutrientes para jardín, huerta y plantas de interior. Apta para cultivo ecológico.',
    precio: 12000,
    stock: 40,
    imagen_url: fotoLocal('photo-1418065460487-3e41a6c84dc5'),
    creado_en: '2026-01-18T08:00:00.000Z'
  },
  {
    id: 18,
    categoria_id: 4,
    categoria_nombre: 'Abono',
    categoria_slug: 'abono',
    nombre: 'Humus de Lombriz 2kg',
    descripcion:
      'Mejorador de suelo 100% natural con alta concentración de microorganismos y nutrientes.',
    precio: 18000,
    stock: 35,
    imagen_url: fotoLocal('photo-1418065460487-3e41a6c84dc5'),
    creado_en: '2026-01-18T08:05:00.000Z'
  },
  {
    id: 19,
    categoria_id: 4,
    categoria_nombre: 'Abono',
    categoria_slug: 'abono',
    nombre: 'Compost Premium 5kg',
    descripcion:
      'Compost madurado para preparar sustratos y revitalizar tierras agotadas. Sin olores y listo para usar.',
    precio: 26000,
    stock: 20,
    imagen_url: fotoLocal('photo-1416879595882-3373a0480b5b'),
    creado_en: '2026-01-18T08:10:00.000Z'
  },
  {
    id: 20,
    categoria_id: 4,
    categoria_nombre: 'Abono',
    categoria_slug: 'abono',
    nombre: 'Perlita Agrícola 2L',
    descripcion:
      'Sustrato aireador que mejora el drenaje y evita la compactación. Se mezcla con tierra o compost.',
    precio: 14000,
    stock: 30,
    imagen_url: fotoLocal('photo-1501004318641-b39e6451bec6'),
    creado_en: '2026-01-18T08:15:00.000Z'
  }
];
