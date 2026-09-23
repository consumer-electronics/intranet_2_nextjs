'use client';

import { Box, Alert } from '@mui/material';

import FolderBrowser from './FolderBrowser';
import { useSigPermissions } from '@/hooks/rrhh/sig/useSigPermissions';

export default function DocumentosGeneralesPanel({ active }) {
    const { canViewFolderExplorer } = useSigPermissions();

    if (!canViewFolderExplorer) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="warning">No tienes permisos para visualizar los documentos generales del SIG.</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <FolderBrowser active={active} tituloRaiz="Documentos generales" carpetaBase="https://dynamics.appceg.com/sig/1.%20Documentos/" />
        </Box>
    );
}