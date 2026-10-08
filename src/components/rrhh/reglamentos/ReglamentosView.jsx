'use client';

import { useState } from 'react';
import { Stack, useMediaQuery, useTheme } from '@mui/material';

import DocumentList from '@/components/common/documents/DocumentList';
import PdfViewerModal from '@/components/common/documents/PdfViewerModal';

import { REGLAMENTOS_ITEMS } from '@/config/rrhh/reglamentos/reglamentosDocuments';

/**
 * Vista de reglamentos.
 * El título de la sección lo muestra el TopBar via menuConfig.js.
 */
export default function ReglamentosView() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [documentoActivo, setDocumentoActivo] = useState(null);

    return (
        <Stack spacing={4}>
            <DocumentList
                items={REGLAMENTOS_ITEMS}
                onSelect={(item) => {
                    if (item.type === 'folder' || isMobile) {
                        window.open(item.file, '_blank');
                    } else {
                        setDocumentoActivo(item);
                    }
                }}
                emptyMessage="No hay reglamentos o manuales configurados."
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
