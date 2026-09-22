import CreserTomaEncuesta from '@/components/rrhh/creser/CreserTomaEncuesta';

export const metadata = {
  title: 'CRESER — Realizar Evaluación',
  description: 'Formulario para realizar una evaluación CRESER',
};

/**
 * Página para tomar la encuesta CRESER.
 * Recibe: ?et_id=X&filtro_atr=Y|Z
 */
export default async function CreserTakeEncuestaPage({ searchParams }) {
  const params = await searchParams;
  const et_id = params?.et_id ?? null;
  const filtro_atr = params?.filtro_atr ?? null;

  return <CreserTomaEncuesta et_id={et_id} filtro_atr={filtro_atr} />;
}
