/**
 * src/providers/SigPermissionsProvider.jsx
 *
 * DEPRECADO — Reemplazado por AppPermissionsProvider.
 *
 * Este archivo se mantiene vacío para no romper imports existentes
 * en caso de que algún archivo externo lo importe directamente.
 * La lógica de permisos SIG ahora vive en:
 *   src/providers/AppPermissionsProvider.jsx
 *
 * Los hooks que consumían este provider:
 *   src/hooks/rrhh/sig/useSigPermissions.js
 * ya fueron actualizados para usar AppPermissionsContext.
 */

export function SigPermissionsProvider({ children }) {
    return children;
}

export function clearSigPermissionsCache() {
    // No-op: la limpieza ahora la hace clearAppPermissionsCache()
    // en AppPermissionsProvider. Mantenido por compatibilidad.
}
