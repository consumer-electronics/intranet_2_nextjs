import CreserEncuesta from '@/components/rrhh/creser/CreserEncuesta';

export const metadata = {
  title: 'CRESER — Evaluación',
  description: 'Vista de evaluación de competencias CRESER',
};

/**
 * Página de encuesta CRESER.
 * Recibe: ?et_id=X&filtro_atr=Y|Z
 *
 * En Next.js 15+ searchParams es una Promise y debe ser awaited.
 */
export default async function CreserEncuestaPage({ searchParams }) {
  const params = await searchParams;
  const et_id = params?.et_id ?? null;
  const filtro_atr = params?.filtro_atr ?? null;

  return <CreserEncuesta et_id={et_id} filtro_atr={filtro_atr} />;
}
