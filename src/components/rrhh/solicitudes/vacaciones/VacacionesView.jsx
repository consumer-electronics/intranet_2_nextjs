import SolicitudesModulo from '../SolicitudesModulo';

/**
 * Punto de entrada de la página /rrhh/solicitudes/vacaciones.
 * Activa el Tab "Permisos / Vacaciones" dentro del módulo unificado.
 */
export default function VacacionesView() {
    return <SolicitudesModulo defaultTab="vacaciones" />;
}
