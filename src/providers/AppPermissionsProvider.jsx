'use client';

/**
 * src/providers/AppPermissionsProvider.jsx
 *
 * Proveedor global de permisos de módulos para el área autenticada.
 *
 * - Hace UN SOLO fetch al montar cuando el usuario está disponible.
 * - Guarda el resultado en caché a nivel de módulo JS (_cache):
 *   sobrevive a navegaciones cliente sin volver a consultar.
 *   Se pierde solo al recargar la página (reload completo), lo cual
 *   es correcto porque el servidor vuelve a validar la sesión.
 * - Se limpia al hacer logout con clearAppPermissionsCache().
 *
 * Expone:
 *   canView(modNombre) → boolean
 *   canViewFolderExplorer  → boolean (compatibilidad con SIG)
 *   canViewProcess(code)   → boolean (compatibilidad con SIG)
 *   permittedModules       → string[]
 *   loading                → boolean
 *
 * Uso: envolver DashboardLayout con <AppPermissionsProvider user={user}>.
 */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from 'react';
import { apiFetch } from '@/utils/Fetchclient';
import { PROCESS_PERMISSION_MAP } from '@/config/sig/permissions';

// ---------- Caché en memoria a nivel de módulo JS ----------
// null  → sin datos todavía
// []    → cargado, sin permisos
// [..] → cargado con permisos
let _cache = null;

export const AppPermissionsContext = createContext({
    permittedModules: [],
    loading: true,
    canView: () => false,
    canViewProcess: () => false,
    canViewFolderExplorer: false,
});

export function AppPermissionsProvider({ user, children }) {
    const [permittedModules, setPermittedModules] = useState(() => _cache ?? []);
    const [loading, setLoading] = useState(_cache === null);
    const fetchedRef = useRef(_cache !== null);

    useEffect(() => {
        // Si ya tenemos datos en caché, reutilizamos
        if (fetchedRef.current) return;

        // Sin usuario autenticado, esperamos a que cargue
        if (!user) return;

        let active = true;

        async function fetchPermissions() {
            try {
                const response = await apiFetch('/api/permissions/menu', { method: 'GET' });
                if (!active) return;
                const modules = (response?.success ? response.data : []) || [];
                _cache = modules;
                fetchedRef.current = true;
                setPermittedModules(modules);
            } catch (err) {
                if (!active) return;
                console.error('[AppPermissions] Error al cargar permisos:', err);
                _cache = [];
                fetchedRef.current = true;
                setPermittedModules([]);
            } finally {
                if (active) setLoading(false);
            }
        }

        fetchPermissions();
        return () => { active = false; };
    }, [user]);

    /** Verifica si el usuario tiene permiso sobre un mod_nombre específico */
    const canView = useCallback(
        (modNombre) => {
            if (!modNombre || loading) return false;
            return permittedModules.includes(modNombre);
        },
        [permittedModules, loading]
    );

    // --- Compatibilidad con useSigPermissions ---



    /**
     * Valida acceso a un macroproceso específico en el mapa SIG.
     * Mapea el código (E01, V01, etc.) a su mod_nombre en la BD.
     */
    const canViewProcess = useCallback(
        (processCode) => {
            if (loading || !processCode) return false;
            const perm = PROCESS_PERMISSION_MAP[processCode];
            // Si el código no está mapeado, por defecto negamos el acceso o podemos permitirlo? 
            // Mejor negarlo por seguridad, o permitir si se tiene mapa_procesos globalmente.
            // Para mantener la granularidad, exigiremos el permiso específico.
            if (!perm) return false;
            return permittedModules.includes(perm);
        },
        [permittedModules, loading]
    );

    // Acceso al explorador de documentos SIG: `intranet_sig_documentos_generales`
    // (mod_tipo='intranet', menu_fk=17)
    const canViewFolderExplorer = !loading && permittedModules.includes('intranet_sig_documentos_generales');

    return (
        <AppPermissionsContext.Provider
            value={{
                permittedModules,
                loading,
                canView,
                canViewProcess,
                canViewFolderExplorer,
            }}
        >
            {children}
        </AppPermissionsContext.Provider>
    );
}

/** Limpia el caché en memoria. Llamar en logout. */
export function clearAppPermissionsCache() {
    _cache = null;
}
