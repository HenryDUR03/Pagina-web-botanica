// Datos de productos de la tienda de plantas
// Array de objetos con: id, nombre, categoria, precio, stock, descripcion, imagen

const PRODUCTOS = [
  {
    id: 1,
    nombre: "Semillas de Tomate Cherry",
    categoria: "Semillas",
    precio: 8500,
    stock: 50,
    descripcion: "Semillas de tomate cherry para cultivo casero. Germinación alta y sabor dulce.",
    imagen: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0"
  },
  {
    id: 2,
    nombre: "Semillas de Albahaca",
    categoria: "Semillas",
    precio: 4500,
    stock: 80,
    descripcion: "Semillas aromáticas de albahaca ideal para cocina y huerta casera.",
    imagen: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0"
  },
  {
    id: 3,
    nombre: "Monstera Deliciosa",
    categoria: "Plantas",
    precio: 65000,
    stock: 12,
    descripcion: "Planta tropical con hojas grandes y fenestradas. Ideal para interiores luminosos.",
    imagen: "https://images.unsplash.com/photo-1614594895304-fe7116ac3b58?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0"
  },
  {
    id: 4,
    nombre: "Suculenta Echeveria",
    categoria: "Plantas",
    precio: 15000,
    stock: 25,
    descripcion: "Suculenta de roseta compacta, resistente y de bajo mantenimiento.",
    imagen: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0"
  },
  {
    id: 5,
    nombre: "Pothos Dorado",
    categoria: "Plantas",
    precio: 28000,
    stock: 18,
    descripcion: "Planta colgante de crecimiento rápido, perfecta para purificar el aire.",
    imagen: "https://images.unsplash.com/photo-1463320898484-cdee8141c787?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0"
  },
  {
    id: 6,
    nombre: "Matera de Barro Grande",
    categoria: "Materas",
    precio: 32000,
    stock: 15,
    descripcion: "Matera de barro natural, porosa y ideal para plantas que requieren buena aireación.",
    imagen: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0"
  },
  {
    id: 7,
    nombre: "Matera Cerámica Blanca",
    categoria: "Materas",
    precio: 45000,
    stock: 10,
    descripcion: "Matera de cerámica con acabado blanco, elegante para interiores modernos.",
    imagen: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0"
  },
  {
    id: 8,
    nombre: "Abono Orgánico 1kg",
    categoria: "Abono",
    precio: 12000,
    stock: 40,
    descripcion: "Abono orgánico rico en nutrientes para todo tipo de plantas de jardín y huerta.",
    imagen: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0"
  },
  {
    id: 9,
    nombre: "Humus de Lombriz 2kg",
    categoria: "Abono",
    precio: 18000,
    stock: 35,
    descripcion: "Mejorador de suelo 100% natural con alta concentración de nutrientes.",
    imagen: "https://images.unsplash.com/photo-1463320898484-cdee8141c787?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0"
  },
  {
    id: 10,
    nombre: "Semillas de Perejil",
    categoria: "Semillas",
    precio: 3800,
    stock: 90,
    descripcion: "Semillas de perejil fresco para aromatizar tus platillos.",
    imagen: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0"
  },
  {
    id: 11,
    nombre: "Cactus San Pedro",
    categoria: "Plantas",
    precio: 22000,
    stock: 0,
    descripcion: "Cactus resistente, ideal para exteriores soleados. Producto actualmente agotado.",
    imagen: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0"
  },
  {
    id: 12,
    nombre: "Matera Colgante Macramé",
    categoria: "Materas",
    precio: 28000,
    stock: 7,
    descripcion: "Soporte colgante en macramé con matera incluida, ideal para plantas colgantes.",
    imagen: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0"
  }
];

// Formateador de precio en Pesos Colombianos (COP)
function formatearCOP(precio) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(precio);
}

// Obtener producto por ID
function obtenerProductoPorId(id) {
  const idNum = parseInt(id);
  return PRODUCTOS.find(p => p.id === idNum);
}

// Obtener productos por categoría
function obtenerProductosPorCategoria(categoria) {
  if (!categoria || categoria === 'Todas') {
    return PRODUCTOS;
  }
  return PRODUCTOS.filter(p => p.categoria === categoria);
}
