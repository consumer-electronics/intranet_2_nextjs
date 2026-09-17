'use client';

import PdfViewerModal from '@/components/common/documents/PdfViewerModal';

/**
 * Diálogo que muestra el certificado laboral (PDF) de un funcionario.
 *
 * Reutiliza el visor general del proyecto (PdfViewerModal → PdfViewer),
 * que internamente carga el PDF desde `src` con su propio estado de carga.
 *
 * Props:
 *  - open          {boolean}  Controla la visibilidad del modal.
 *  - row           {object}   Funcionario seleccionado (para el título).
 *  - previewUrl    {string}   Blob URL del PDF ya generado (o null).
 *  - onClose       {function} Callback para cerrar.
 */
export default function CertificadoPdfDialog({ open, row, previewUrl, onClose }) {
    const titulo = row?.fun_nombre_completo
        ? `Certificado laboral - ${row.fun_nombre_completo}`
        : 'Certificado laboral';

    return (
        <PdfViewerModal
            open={open}
            titulo={titulo}
            src={previewUrl}
            onClose={onClose}
        />
    );
}
