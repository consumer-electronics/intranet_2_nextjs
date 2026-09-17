'use client';

import { useState } from 'react';
import { Stack } from '@mui/material';

import DocumentList from '@/components/common/documents/DocumentList';
import PdfViewerModal from '@/components/common/documents/PdfViewerModal';

import { INFO_INTERES_GENERAL_ITEMS } from '@/config/sig/infoInteresGeneralDocuments';

/**
 * Vista de Información de Interés General SIG.
 * El título de la sección lo muestra el TopBar via menuConfig.js.
 */
export default function InfoInteresGeneralView() {
    const [documentoActivo, setDocumentoActivo] = useState(null);

    return (
        <Stack spacing={4}>
            <DocumentList
                items={INFO_INTERES_GENERAL_ITEMS}
                onSelect={(item) => {
                    if (item.type === 'folder') {
                        window.open(item.file, '_blank');
                    } else {
                        setDocumentoActivo(item);
                    }
                }}
                emptyMessage="No hay documentos de interés general configurados."
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
