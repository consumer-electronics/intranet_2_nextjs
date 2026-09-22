import CreserAreas from '@/components/rrhh/creser/CreserAreas';

export const metadata = {
  title: 'CRESER — Área',
  description: 'Detalle de evaluaciones CRESER por área',
};

/**
 * Página de detalle de área CRESER.
 * Recibe: ?idArea=X&idPeriodo=Y
 *
 * En Next.js 15+ searchParams es una Promise y debe ser awaited.
 */
export default async function CreserAreasPage({ searchParams }) {
  const params = await searchParams;
  const idArea = params?.idArea ?? null;
  const idPeriodo = params?.idPeriodo ?? null;

  return <CreserAreas idArea={idArea} idPeriodo={idPeriodo} />;
}
