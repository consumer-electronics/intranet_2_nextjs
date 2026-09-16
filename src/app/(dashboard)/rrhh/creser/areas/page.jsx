import CreserAreas from '@/components/rrhh/creser/CreserAreas';

export const metadata = {
  title: 'CRESER — Área',
  description: 'Detalle de evaluaciones CRESER por área',
};

/**
 * Página de detalle de área CRESER.
 * Recibe: ?idArea=X&idPeriodo=Y
 */
export default function CreserAreasPage({ searchParams }) {
  const idArea = searchParams?.idArea ?? null;
  const idPeriodo = searchParams?.idPeriodo ?? null;

  return <CreserAreas idArea={idArea} idPeriodo={idPeriodo} />;
}
