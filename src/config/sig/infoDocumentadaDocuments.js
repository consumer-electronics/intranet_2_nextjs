/**
 * Configuración estática para el módulo SIG - Sección: Información documentada
 */

export const DOCUMENTOS_GENERALES_ITEM = {
    id: 'documentos_generales',
    label: 'Documentos generales',
    description: 'Explorador recursivo y búsqueda de documentos generales del SIG.',
    type: 'folder',
    actionType: 'modal_explorer',
};

export const MAPA_PROCESOS_ITEM = {
    id: 'mapa_procesos',
    label: 'Mapa de procesos',
    description: 'Visualización interactiva del mapa de procesos organizacionales.',
    type: 'process_map',
};

export const INFO_DOCUMENTADA_ITEMS = [
    DOCUMENTOS_GENERALES_ITEM,
    MAPA_PROCESOS_ITEM,
];