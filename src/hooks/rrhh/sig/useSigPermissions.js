'use client';

/**
 * src/hooks/rrhh/sig/useSigPermissions.js
 *
 * Thin hook que expone los permisos SIG desde el AppPermissionsContext global.
 * El fetch real y el caché viven en AppPermissionsProvider (montado en DashboardLayout).
 *
 * API mantenida sin cambios para que los componentes existentes
 * (DocumentosGeneralesPanel, ProcessPalette, etc.) no requieran modificación.
 */

import { useContext } from 'react';
import { AppPermissionsContext } from '@/providers/AppPermissionsProvider';

export function useSigPermissions() {
    const { canViewProcess, canViewFolderExplorer, canView, loading } = useContext(AppPermissionsContext);
    return { canViewProcess, canViewFolderExplorer, canView, loading };
}

