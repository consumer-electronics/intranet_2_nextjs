/**
 * Configuración estática para el Mapa de Procesos SIG (Sistema Integrado de Gestión)
 * Reemplaza completamente las llamadas PHP/Dynamics legacy por estructuras puras en JS.
 *
 * Los colores de las variantes reflejan los tokens del theme global (theme.js):
 * - orange   → warning  (theme.palette.warning.main = #ED6C02)
 * - turquoise → info    (theme.palette.info.main    = #0288D1)
 * - purple   → secondary (theme.palette.secondary.main = #1565C0 / custom purple)
 *
 * Se mantienen como valores literales para poder usarlos fuera de componentes React
 * (ej: en estilos sx que no tienen acceso al hook useTheme). Si el theme cambia,
 * actualizar también estos valores.
 */
export const PROCESS_COLOR_VARIANTS = {
    // Mapea a theme.palette.warning.*
    orange: {
        main: '#ED6C02',   // warning.main
        dark: '#C75B00',   // warning.dark
        light: '#FF9800',  // warning.light
        bg: '#FFF3E0',     // warning light background
        border: '#FFE0B2', // warning border
        text: '#E65100',   // warning dark text
    },
    // Mapea a theme.palette.info.*
    turquoise: {
        main: '#0288D1',   // info.main
        dark: '#01579B',   // info.dark
        light: '#03A9F4',  // info.light
        bg: '#E1F5FE',     // info light background
        border: '#B3E5FC', // info border
        text: '#01579B',   // info dark text
    },
    // Mapea a variante púrpura (complementaria al theme secondary)
    purple: {
        main: '#7B1FA2',   // purple.main
        dark: '#4A148C',   // purple.dark
        light: '#9C27B0',  // purple.light
        bg: '#F3E5F5',     // purple light background
        border: '#E1BEE7', // purple border
        text: '#4A148C',   // purple dark text
    },
};

export const MAPA_PROCESOS = {
    estrategicos: {
        id: 'estrategicos',
        title: 'PROCESOS ESTRATÉGICOS',
        colorVariant: 'orange',
        bgImage: '/images/mapa/7_Procesos-estratégicos.png',
        processes: [
            {
                id: 'E01',
                code: 'E01',
                title: 'GESTIÓN DEL DIRECCIONAMIENTO',
                colorVariant: 'orange',
                folderPath: '1.E01.Gestion del direccionamiento',
                items: [
                    {
                        id: 'e01-control-interno',
                        label: 'Gestión de control interno',
                        type: 'document',
                        file: '/sig/1. Documentos/1.E01.Gestion del direccionamiento/2. Gestion de control interno/1. Caracterización/E01.C002 CARACTERIZACIÓN CONTROL INTERNO.pdf',
                    },
                    {
                        id: 'e01-direccionamiento',
                        label: 'Gestión del direccionamiento',
                        type: 'label',
                    },
                ],
            },
            {
                id: 'E02',
                code: 'E02',
                title: 'SISTEMA INTEGRADO DE GESTIÓN',
                colorVariant: 'orange',
                folderPath: '2.E02. Sistema integrado de gestion',
                items: [
                    {
                        id: 'e02-sistemas-gestion',
                        label: 'Sistemas de Gestión',
                        type: 'document',
                        file: '/sig/1. Documentos/2.E02. Sistema integrado de gestion/1. Sistemas de gestion/1. Caracterización/E02.C001 CARACTERIZACIÓN SISTEMA INTEGRADO DE GESTIÓN.pdf',
                    },
                ],
            },
        ],
    },

    valor: {
        id: 'valor',
        title: 'PROCESOS DEL VALOR',
        colorVariant: 'turquoise',
        bgImage: '/images/mapa/8_Procesos-de-valor.png',
        processes: [
            {
                id: 'V01',
                code: 'V01',
                title: 'GESTIÓN DE LA CADENA DE SUMINISTROS',
                colorVariant: 'turquoise',
                folderPath: '3.V01.Gestion de la cadena de suministros',
                items: [
                    {
                        id: 'v01-almacenamiento',
                        label: 'Almacenamiento',
                        type: 'document',
                        file: '/sig/1. Documentos/3.V01.Gestion de la cadena de suministros/3. Almacenamiento/1. Caracterización/V01.C003 CARACTERIZACIÓN ALMACENAMIENTO.pdf',
                    },
                    {
                        id: 'v01-comercio-exterior',
                        label: 'Comercio Exterior',
                        type: 'label',
                    },
                    {
                        id: 'v01-compra-nacional',
                        label: 'Gestión de Compra Nacional',
                        type: 'label',
                    },
                    {
                        id: 'v01-distribucion',
                        label: 'Gestión de Distribución',
                        type: 'label',
                    },
                    {
                        id: 'v01-inventarios-inversa',
                        label: 'Gestión de Inventarios e inversa',
                        type: 'label',
                    },
                ],
            },
            {
                id: 'V02',
                code: 'V02',
                title: 'GESTIÓN DE PRODUCCIÓN',
                colorVariant: 'turquoise',
                folderPath: '4.V02. Gestion de produccion',
                items: [
                    {
                        id: 'v02-gestion-produccion',
                        label: 'Gestión producción',
                        type: 'document',
                        file: '/sig/1. Documentos/4.V02. Gestion de produccion/Gestión de producción/1. Caracterización/V02.C001 CARACTERIZACIÓN PRODUCCIÓN.pdf',
                    },
                ],
            },
            {
                id: 'V03',
                code: 'V03',
                title: 'COMERCIALIZACIÓN',
                colorVariant: 'turquoise',
                folderPath: '5.V03. Comercializacion',
                items: [
                    {
                        id: 'v03-comercial-sell-in',
                        label: 'Comercial y ventas Sell in',
                        type: 'document',
                        file: '/sig/1. Documentos/5.V03. Comercializacion/1.Comercial y Ventas Sell In/1. Caracterización/V03.C001 CARACTERIZACIÓN COMERCIALIZACION.pdf',
                    },
                    {
                        id: 'v03-mercadeo',
                        label: 'Mercadeo',
                        type: 'label',
                    },
                    {
                        id: 'v03-ventas-sell-out',
                        label: 'Ventas Sell out',
                        type: 'label',
                    },
                ],
            },
            {
                id: 'V04',
                code: 'V04',
                title: 'SERVICIO POSTVENTA',
                colorVariant: 'turquoise',
                folderPath: '6.V04. Servicio postventa',
                items: [
                    {
                        id: 'v04-servicio-cliente',
                        label: 'Servicio al Cliente',
                        type: 'label',
                    },
                    {
                        id: 'v04-soporte-tecnico',
                        label: 'Soporte Técnico',
                        type: 'label',
                    },
                ],
            },
        ],
    },

    apoyo: {
        id: 'apoyo',
        title: 'PROCESOS DE APOYO',
        colorVariant: 'purple',
        bgImage: '/images/mapa/9_Procesos-de-apoyo.png',
        processes: [
            {
                id: 'A01',
                code: 'A01',
                title: 'ADMINISTRACIÓN DE TALENTO HUMANO',
                colorVariant: 'purple',
                folderPath: '7.A01. Administracion del talento humano',
                items: [
                    {
                        id: 'a01-gestion-humana',
                        label: 'Gestión humana',
                        type: 'document',
                        file: '/sig/1. Documentos/7.A01. Administracion del talento humano/1.Gestion humana/1. Caracterización/A01.C001 CARACTERIZACIÓN GESTIÓN HUMANA.pdf',
                    },
                    {
                        id: 'a01-sst-ambiental',
                        label: 'Seguridad y salud en el trabajo y ambiental',
                        type: 'label',
                    },
                ],
            },
            {
                id: 'A02',
                code: 'A02',
                title: 'INFRAESTRUCTURA',
                colorVariant: 'purple',
                folderPath: '8.A02. Infraestructura',
                items: [
                    {
                        id: 'a02-mantenimiento',
                        label: 'Mantenimiento',
                        type: 'document',
                        file: '/sig/1. Documentos/8.A02. Infraestructura/2. Mantenimiento/1. Caracterización/A02.C003 CARACTERIZACIÓN MANTENIMIENTO.pdf',
                    },
                    {
                        id: 'a02-seguridad',
                        label: 'Seguridad',
                        type: 'label',
                    },
                    {
                        id: 'a02-ti',
                        label: 'Tecnología de la información',
                        type: 'label',
                    },
                ],
            },
            {
                id: 'A03',
                code: 'A03',
                title: 'GESTIÓN FINANCIERA',
                colorVariant: 'purple',
                folderPath: '9.A03. Gestion Financiera',
                items: [
                    {
                        id: 'a03-gestion-financiera',
                        label: 'Gestión Financiera',
                        type: 'document',
                        file: '/sig/1. Documentos/9.A03. Gestion Financiera/1. Caracterización/A03.C001 CARACTERIZACIÓN GESTIÓN FINANCIERA.pdf',
                    },
                ],
            },
        ],
    },
};
