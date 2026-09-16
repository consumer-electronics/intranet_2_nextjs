import CreserEncuesta from '@/components/rrhh/creser/CreserEncuesta';

export const metadata = {
  title: 'CRESER — Evaluación',
  description: 'Vista de evaluación de competencias CRESER',
};

/**
 * Página de encuesta CRESER.
 * Recibe: ?et_id=X&filtro_atr=Y|Z
 *
 * La encuesta se obtiene desde el HTML del servidor Dynamics,
 * se parsea en el route handler y se renderiza como componente JSX/MUI.
 */
export default function CreserEncuestaPage({ searchParams }) {
  const et_id = searchParams?.et_id ?? null;
  const filtro_atr = searchParams?.filtro_atr ?? null;

  return <CreserEncuesta et_id={et_id} filtro_atr={filtro_atr} />;
}
