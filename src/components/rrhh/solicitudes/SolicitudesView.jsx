import SolicitudesModulo from './SolicitudesModulo';

/**
 * Punto de entrada de la página /rrhh/solicitudes.
 * Activa el Tab "Permisos" dentro del módulo unificado.
 */
export default function SolicitudesView() {
    return <SolicitudesModulo defaultTab="permisos" />;
}
