'use client';

import { Box } from '@mui/material';

import FolderBrowser from './FolderBrowser';

export default function DocumentosGeneralesPanel({ active }) {
    return (
        <Box>
            <FolderBrowser active={active} tituloRaiz="Documentos generales" carpetaBase="https://dynamics.appceg.com/sig/2.%20Documentos%20generales/" />
        </Box>
    );
}