/**
 * src/config/sig/permissions.js
 *
 * Mapeo estático de permisos granulares para el módulo SIG (Sistema Integrado de Gestión).
 * Estas constantes vinculan los códigos/nombres del frontend con los `mod_nombre` 
 * definidos en la base de datos legacy de Dynamics CEG (`ceg_modulo`).
 */

/**
 * Mapea el código del macroproceso (E01, V01, etc.) al `mod_nombre` de la BD.
 * Se usa para habilitar/deshabilitar los botones en el Mapa de Procesos.
 */
export const PROCESS_PERMISSION_MAP = {
    'E01': 'sig_gestion_direccionamiento',
    'E02': 'sig_sistema_integrado_gestion',
    'V01': 'sig_gestion_cadena_suministros',
    'V02': 'sig_gestion_produccion',
    'V03': 'sig_comercializacion',
    'V04': 'sig_servicio_postventa',
    'A01': 'sig_admin_talento_humano',
    'A02': 'sig_infraestructura',
    'A03': 'sig_gestion_financiera',
};

/**
 * Mapea el nombre de la subcarpeta (primer o segundo nivel) dentro de "Documentos Generales"
 * al `mod_nombre` de la BD.
 * Se usa para ocultar las carpetas en el `FolderBrowser` si el usuario no tiene el permiso.
 */
export const FOLDER_PERMISSION_MAP = {
    // 'Almacenamiento': 'sig_proceso_almacenamiento_inversa',
    // 'Comercial y ventas Sell in': 'sig_proceso_comercial',
    // 'Comercio Exterior': 'sig_proceso_comercio_exterior',
    // 'Control de calidad de producto': 'sig_proceso_control_de_producto',
    // 'Control y calidad de producto': 'sig_proceso_control_calidad_producto',
    // 'Gestión de control interno': 'sig_proceso_gestion_control_interno',
    // 'Gestión del direccionamiento': 'sig_proceso_gestion_direccionamiento',
    // 'Gestión de Compra Nacional': 'sig_proceso_gestion_compra_nacional',
    // 'Gestión de Distribución': 'sig_proceso_gestion_distribucion',
    // 'Gestión de Inventarios': 'sig_proceso_gestion_inventarios',
    // 'Gestión Financiera': 'sig_proceso_gestion_financiera',
    // 'Gestión humana': 'sig_proceso_gestion_humana',
    // 'Gestión producción': 'sig_proceso_gestion_produccion',
    // 'Mantenimiento': 'sig_proceso_mantenimiento',
    // 'Mercadeo': 'sig_proceso_mercadeo',
    // 'Prevención de riesgos laborales e impactos ambientales': 'sig_proceso_prevencion_riesgos_laborales',
    // 'Seguridad': 'sig_proceso_seguridad',
    // 'Sistemas de Gestión': 'sig_proceso_sistema_gestion',
    // 'Tecnología de la información': 'sig_proceso_tic',
    // 'Ventas Sell Out': 'sig_proceso_ventas_sell_out',
    // Sub-items adicionales que no están mapeados granularmente se asumen heredados 
    // o se bloquean según las reglas de negocio. (Añadir aquí si aparecen nuevos).
};
