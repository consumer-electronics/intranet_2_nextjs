import ConveniosPdfView from '@/components/rrhh/convenios/ConveniosPdfView';

// El PDF se sirve desde dynamics.appceg.com (servidor de origen) a través del proxy
// existente para evitar la lentitud de servirlo directamente desde Hostinger (public/).
const PDF_URL =
    '/api/proxy-pdf?url=' +
    encodeURIComponent(
        'https://dynamics.appceg.com/ceg/pantallas/intranet/paginas/gestion_humana/convenios/PDF_CONVENIOS/PEREIRA_CATALOGO%20DE%20BENEFICIOS%20Y%20CONVENIOS%20HYUNDAI%20ELECTRONICS.pdf'
    );

export default function ConveniosPage() {
    return (
        <ConveniosPdfView
            title="Convenios (Pereira)"
            description="Consulte el catálogo de beneficios y convenios de Hyundai Electronics para Pereira."
            pdfUrl={PDF_URL}
        />
    );
}
