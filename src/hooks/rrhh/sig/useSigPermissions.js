'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/utils/Fetchclient';

/**
 * Hook para manejar los permisos del módulo SIG.
 * Consulta la base de datos de Dynamics mediante el backend Node para obtener
 * los macro_codigo a los que el usuario autenticado tiene acceso.
 */
export function useSigPermissions() {
    const { user } = useAuth();
    const [permittedMacros, setPermittedMacros] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        
        async function fetchPermissions() {
            if (!user) {
                if (active) {
                    setPermittedMacros([]);
                    setLoading(false);
                }
                return;
            }
            
            try {
                setLoading(true);
                const response = await apiFetch('/api/sig/permisos-mapa', {
                    method: 'GET'
                });
                if (active && response.success) {
                    setPermittedMacros(response.data || []);
                }
            } catch (error) {
                console.error('[SIG] Error fetching permissions', error);
                if (active) {
                    setPermittedMacros([]);
                }
            } finally {
                if (active) setLoading(false);
            }
        }
        
        fetchPermissions();
        
        return () => {
            active = false;
        };
    }, [user]);

    // Función para validar si tiene acceso a un código específico (ej: 'E01')
    const canViewProcess = useCallback((processCode) => {
        if (!processCode) return false;
        // Si el admin tiene acceso a todo, se podría agregar la lógica de user.isAdmin aquí
        return permittedMacros.includes(processCode);
    }, [permittedMacros]);

    // Por el momento, la pestaña "Documentos generales" puede validarse con esto mismo,
    // o con una regla de administrador. Si queremos que solo quienes tengan AL MENOS un permiso
    // puedan verla, podemos verificar el array:
    const canViewFolderExplorer = permittedMacros.length > 0;

    return {
        canViewProcess,
        canViewFolderExplorer,
        loading
    };
}
