-- 02_seed.sql
-- Datos iniciales: 4 categorías y 20 productos.
-- Ejecuta este archivo después de 01_schema.sql.
-- Es idempotente: si lo corres de nuevo, actualiza los mismos registros.

insert into public.categorias (id, nombre, slug) values
  (1, 'Semillas', 'semillas'),
  (2, 'Plantas', 'plantas'),
  (3, 'Materas', 'materas'),
  (4, 'Abono', 'abono')
on conflict (id) do update
  set nombre = excluded.nombre,
      slug = excluded.slug;

-- Ajusta la secuencia para que futuros inserts no choquen con estos ids.
select setval(
  pg_get_serial_sequence('public.categorias', 'id'),
  (select max(id) from public.categorias)
);

insert into public.productos
  (id, categoria_id, nombre, descripcion, precio, stock, imagen_url, cuidados)
values
  -- Semillas
  (1, 1, 'Semillas de Tomate Cherry',
   'Semillas de tomate cherry para cultivo casero. Alta germinación y sabor dulce, ideales para macetas o huerta urbana.',
   8500, 50, 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=900&auto=format&fit=crop', null),
  (2, 1, 'Semillas de Albahaca',
   'Aromática de crecimiento rápido. Perfecta para cocina fresca, macetas de balcón y huertas caseras.',
   4500, 80, 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=900&auto=format&fit=crop', null),
  (3, 1, 'Semillas de Perejil',
   'Semillas de perejil liso para aromatizar tus platillos. Tolera semisombra y se adapta a interiores.',
   3800, 90, 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=900&auto=format&fit=crop', null),
  (4, 1, 'Semillas de Cilantro',
   'Cilantro fresco de hoja ancha, con germinación pareja y aroma intenso. Incluye instrucciones de siembra.',
   4200, 60, 'https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=900&auto=format&fit=crop', null),
  (5, 1, 'Semillas de Girasol Enano',
   'Variedad compacta de girasol, ideal para terrazas y macetas grandes. Flores amarillas en pocas semanas.',
   5200, 45, 'https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=900&auto=format&fit=crop', null),

  -- Plantas (incluyen ficha de cuidados)
  (6, 2, 'Monstera Deliciosa',
   'Planta tropical con hojas grandes y fenestradas. Ideal para interiores luminosos y rincones con luz indirecta.',
   65000, 12, 'https://images.unsplash.com/photo-1614594895304-fe7116ac3b58?q=80&w=900&auto=format&fit=crop',
   '{"luz": "Luz indirecta brillante, sin sol directo fuerte", "riego": "Cada 7 a 10 días, cuando la tierra esté seca", "tamano": "60 a 90 cm en interior"}'::jsonb),
  (7, 2, 'Suculenta Echeveria',
   'Roseta compacta de bajo mantenimiento. Necesita poca agua y luz abundante; perfecta para escritorios.',
   15000, 25, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=900&auto=format&fit=crop',
   '{"luz": "Mucha luz, incluso sol directo suave", "riego": "Cada 15 a 20 días, muy moderado", "tamano": "8 a 12 cm de diámetro"}'::jsonb),
  (8, 2, 'Pothos Dorado',
   'Planta colgante de crecimiento rápido que purifica el aire. Tolera interiores con luz media.',
   28000, 18, 'https://images.unsplash.com/photo-1463320898484-cdee8141c787?q=80&w=900&auto=format&fit=crop',
   '{"luz": "Luz media o indirecta; evita el sol fuerte", "riego": "Cada 7 días, dejando secar la superficie", "tamano": "Guías de 40 a 80 cm"}'::jsonb),
  (9, 2, 'Cactus San Pedro',
   'Cactus columnar resistente, ideal para exteriores soleados. Producto temporalmente agotado.',
   22000, 0, 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=900&auto=format&fit=crop',
   '{"luz": "Sol directo la mayor parte del día", "riego": "Cada 20 a 30 días en temporada cálida", "tamano": "30 a 60 cm de altura"}'::jsonb),
  (10, 2, 'Helecho de Boston',
   'Helecho colgante de hojas finas y frondosas. Le encanta la humedad ambiental y la luz suave.',
   34000, 9, 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=900&auto=format&fit=crop',
   '{"luz": "Luz suave e indirecta", "riego": "Cada 3 a 4 días; mantén humedad ambiental", "tamano": "30 a 50 cm de diámetro"}'::jsonb),
  (11, 2, 'Árbol de Jade',
   'Suculenta arbustiva de hojas redondas, muy resistente. Simboliza prosperidad y requiere riegos espaciados.',
   26000, 14, 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?q=80&w=900&auto=format&fit=crop',
   '{"luz": "Luz abundante con algo de sol directo", "riego": "Cada 12 a 15 días, con buen drenaje", "tamano": "25 a 45 cm de altura"}'::jsonb),
  (12, 2, 'Calathea Orbifolia',
   'Hojas anchas con rayas plateadas y movimiento diario. Prefiere luz indirecta y humedad constante.',
   48000, 6, 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?q=80&w=900&auto=format&fit=crop',
   '{"luz": "Luz indirecta media, nunca sol directo", "riego": "Cada 4 a 5 días con agua sin cal", "tamano": "40 a 60 cm de altura"}'::jsonb),

  -- Materas
  (13, 3, 'Matera de Barro Grande',
   'Matera de barro natural, porosa y con buen drenaje. Ideal para plantas que necesitan aireación en la raíz.',
   32000, 15, 'https://images.unsplash.com/photo-1604762524889-3e2fcc145683?q=80&w=900&auto=format&fit=crop', null),
  (14, 3, 'Matera Cerámica Blanca',
   'Cerámica esmaltada con acabado mate. Un contraste limpio para interiores modernos y luminosos.',
   45000, 10, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=900&auto=format&fit=crop', null),
  (15, 3, 'Matera Colgante Macramé',
   'Soporte tejido a mano con matera de cerámica incluida. Perfecta para pothos y plantas colgantes.',
   28000, 7, 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=900&auto=format&fit=crop', null),
  (16, 3, 'Matera Autorriego 3L',
   'Sistema de reserva de agua para olvidarte del riego por semanas. Incluye indicador de nivel.',
   39000, 11, 'https://images.unsplash.com/photo-1604762524889-3e2fcc145683?q=80&w=900&auto=format&fit=crop', null),

  -- Abono
  (17, 4, 'Abono Orgánico 1kg',
   'Mezcla orgánica rica en nutrientes para jardín, huerta y plantas de interior. Apta para cultivo ecológico.',
   12000, 40, 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?q=80&w=900&auto=format&fit=crop', null),
  (18, 4, 'Humus de Lombriz 2kg',
   'Mejorador de suelo 100% natural con alta concentración de microorganismos y nutrientes.',
   18000, 35, 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?q=80&w=900&auto=format&fit=crop', null),
  (19, 4, 'Compost Premium 5kg',
   'Compost madurado para preparar sustratos y revitalizar tierras agotadas. Sin olores y listo para usar.',
   26000, 20, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=900&auto=format&fit=crop', null),
  (20, 4, 'Perlita Agrícola 2L',
   'Sustrato aireador que mejora el drenaje y evita la compactación. Se mezcla con tierra o compost.',
   14000, 30, 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=900&auto=format&fit=crop', null)
on conflict (id) do update
  set categoria_id = excluded.categoria_id,
      nombre = excluded.nombre,
      descripcion = excluded.descripcion,
      precio = excluded.precio,
      stock = excluded.stock,
      imagen_url = excluded.imagen_url,
      cuidados = excluded.cuidados;

select setval(
  pg_get_serial_sequence('public.productos', 'id'),
  (select max(id) from public.productos)
);
