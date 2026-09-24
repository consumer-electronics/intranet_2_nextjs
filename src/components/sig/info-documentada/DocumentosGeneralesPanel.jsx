'use client';

import { Box, Alert } from '@mui/material';

import FolderBrowser from './FolderBrowser';
import { useSigPermissions } from '@/hooks/rrhh/sig/useSigPermissions';

export default function DocumentosGeneralesPanel({ active }) {
    return (
        <Box>
            <FolderBrowser 
                active={active} 
                tituloRaiz="Documentos generales" 
                carpetaBase="https://dynamics.appceg.com/sig/1.%20Documentos/" 
                soloGenerales={true}
            />
        </Box>
    );
}