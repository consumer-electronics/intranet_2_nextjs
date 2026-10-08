'use client';

import { useState } from 'react';
import { Stack, useMediaQuery, useTheme } from '@mui/material';

import DocumentList from '@/components/common/documents/DocumentList';
import PdfViewerModal from '@/components/common/documents/PdfViewerModal';

import { POLITICAS_ITEMS } from '@/config/sig/politicasDocuments';

/**
 * Vista de políticas SIG.
 * El título de la sección lo muestra el TopBar via menuConfig.js.
 */
export default function PoliticasView() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [documentoActivo, setDocumentoActivo] = useState(null);

    return (
        <Stack spacing={4}>
            <DocumentList
                items={POLITICAS_ITEMS}
                onSelect={(item) => {
                    if (item.type === 'folder' || isMobile) {
                        window.open(item.file, '_blank');
                    } else {
                        setDocumentoActivo(item);
                    }
                }}
                emptyMessage="No hay políticas o manuales configurados."
            />

            <PdfViewerModal
                open={Boolean(documentoActivo)}
                titulo={documentoActivo?.label}
                src={documentoActivo?.file}
                onClose={() => setDocumentoActivo(null)}
            />
        </Stack>
    );
}
