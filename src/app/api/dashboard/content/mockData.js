/**
 * DOCUMENTACIÓN DE ESQUEMA DE BASE DE DATOS ESPERADO
 * 
 * Para cuando se integre con el backend real, la tabla o colección de "Contenidos"
 * debería tener aproximadamente la siguiente estructura:
 * 
 * Tabla: `contenidos_corporativos` (o similar)
 * 
 * Columnas/Campos:
 * - id (UUID o Auto-incremental)
 * - titulo (String, max 255)
 * - descripcion (Text)
 * - tipo (Enum: 'NOTICIA', 'COMUNICADO', 'INFORMATIVO', 'CAMPAÑA', 'EVENTO', 'VIDEO')
 * - tipoMedia (Enum: 'IMAGEN', 'VIDEO', null)
 * - mediaUrl (String, URL al recurso, max 255)
 * - thumbnailUrl (String, URL a la miniatura del video, opcional)
 * - categoria (String, para agrupaciones lógicas)
 * - estado (Enum: 'BORRADOR', 'PROGRAMADO', 'PUBLICADO', 'EXPIRADO', 'INACTIVO')
 * - destacado (Boolean, default false)
 * - orden (Integer, para el drag & drop del dashboard)
 * - fechaPublicacion (Datetime o Date)
 * - fechaExpiracion (Datetime o Date, nullable)
 * - createdAt (Datetime)
 * - updatedAt (Datetime)
 * - createdBy (String/Integer, referencia al usuario que lo creó)
 */

export let mockContents = [
  {
    id: '1',
    titulo: 'Nueva Campaña de Bienestar 2026',
    descripcion: 'Conoce los nuevos beneficios que tenemos para ti y tu familia este año. Inscríbete en los programas de salud y deporte.',
    tipo: 'CAMPAÑA',
    tipoMedia: 'IMAGEN',
    mediaUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
    thumbnailUrl: null,
    categoria: 'Bienestar',
    estado: 'PUBLICADO',
    destacado: true,
    orden: 1,
    fechaPublicacion: '2026-09-01T08:00:00.000Z',
    fechaExpiracion: '2026-12-31T23:59:59.000Z',
    createdAt: '2026-08-30T10:00:00.000Z',
    updatedAt: '2026-08-30T10:00:00.000Z',
    createdBy: 'admin'
  },
  {
    id: '2',
    titulo: 'Resultados Financieros Q2',
    descripcion: 'Presentamos un resumen de los resultados financieros del segundo trimestre. Gracias al esfuerzo de todos, hemos superado las metas propuestas.',
    tipo: 'NOTICIA',
    tipoMedia: 'IMAGEN',
    mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    thumbnailUrl: null,
    categoria: 'Corporativo',
    estado: 'PUBLICADO',
    destacado: false,
    orden: 2,
    fechaPublicacion: '2026-09-05T08:00:00.000Z',
    fechaExpiracion: null,
    createdAt: '2026-09-04T10:00:00.000Z',
    updatedAt: '2026-09-04T10:00:00.000Z',
    createdBy: 'admin'
  },
  {
    id: '3',
    titulo: 'Mensaje del Presidente sobre la nueva estrategia',
    descripcion: 'Video institucional con las directrices estratégicas para el próximo año.',
    tipo: 'VIDEO',
    tipoMedia: 'VIDEO',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop',
    categoria: 'Presidencia',
    estado: 'PUBLICADO',
    destacado: false,
    orden: 3,
    fechaPublicacion: '2026-09-01T08:00:00.000Z',
    fechaExpiracion: null,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    createdBy: 'admin'
  }
];

// Helper to update the mock contents array (for mock mutability)
export const updateMockContents = (newContents) => {
  mockContents = newContents;
};
