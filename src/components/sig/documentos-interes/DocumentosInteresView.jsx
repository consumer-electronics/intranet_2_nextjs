'use client';

import { useState } from 'react';
import { Stack, useMediaQuery, useTheme } from '@mui/material';

import DocumentList from '@/components/common/documents/DocumentList';
import PdfViewerModal from '@/components/common/documents/PdfViewerModal';

import { DOCUMENTOS_INTERES_ITEMS } from '@/config/sig/documentosInteresDocuments';

/**
 * Vista de documentos de interés SIG.
 * El título de la sección lo muestra el TopBar via menuConfig.js.
 */
export default function DocumentosInteresView() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [documentoActivo, setDocumentoActivo] = useState(null);

    return (
        <Stack spacing={4}>
            <DocumentList
                items={DOCUMENTOS_INTERES_ITEMS}
                onSelect={(item) => {
                    if (item.type === 'folder' || isMobile) {
                        window.open(item.file, '_blank');
                    } else {
                        setDocumentoActivo(item);
                    }
                }}
                emptyMessage="No hay documentos de interés configurados."
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
