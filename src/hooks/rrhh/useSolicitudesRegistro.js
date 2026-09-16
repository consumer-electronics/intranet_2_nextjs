'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    getMesesPermisos,
    getRegistrosPermisos,
    getYearsPermisos,
} from '@/api/rrhh/solicitudesRegistro';

/**
 * Motivos de permiso (coinciden con el backend legacy).
 * 1=Médica, 2=Urgencia Médica, 3=Laboral, 4=Personal, 5=Todos (→ '').
 */
export const MOTIVOS_REGISTRO = [
    { id: 1, label: 'Médica' },
    { id: 2, label: 'Urgencia Médica' },
    { id: 3, label: 'Laboral' },
    { id: 4, label: 'Personal' },
    { id: 5, label: 'Todos' },
];

/**
 * Nombres de los meses en español (índice 0 = Enero).
 */
export const NOMBRES_MESES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

/**
 * Extrae el arreglo de filas de la respuesta normalizada `{ rows: [...] }`.
 */
function extractRows(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

/**
 * Hook del submódulo "Registro de permisos por fecha".
 *
 * Encapsula la carga de años/meses disponibles y la consulta de registros
 * según año/mes/motivo, replicando el flujo del archivo legacy
 * `solicitud_permisos_registro.php`.
 */
export function useSolicitudesRegistro() {
    // Años y meses disponibles
    const [years, setYears] = useState([]);
    const [months, setMonths] = useState([]);
    const [loadingYears, setLoadingYears] = useState(false);
    const [loadingMonths, setLoadingMonths] = useState(false);

    // Selección actual
    const [ano, setAno] = useState('');
    const [mes, setMes] = useState('');
    const [motivo, setMotivo] = useState('');

    // Registros consultados
    const [rows, setRows] = useState([]);
    const [loadingRows, setLoadingRows] = useState(false);
    const [error, setError] = useState(null);

    // Indica si ya se realizó al menos una consulta de registros.
    const [consultado, setConsultado] = useState(false);

    /**
     * Carga los años disponibles (orden descendente).
     */
    const fetchYears = useCallback(async () => {
        setLoadingYears(true);
        try {
            const data = await getYearsPermisos();
            const lista = extractRows(data)
                .map((r) => Number(r?.ano))
                .filter((n) => !Number.isNaN(n))
                .sort((a, b) => b - a);
            setYears(lista);
        } catch (_) {
            setYears([]);
        } finally {
            setLoadingYears(false);
        }
    }, []);

    /**
     * Carga los meses disponibles para el año seleccionado.
     * @param {number|string} anio
     */
    const fetchMonths = useCallback(async (anio) => {
        if (anio === '' || anio === null || anio === undefined) {
            setMonths([]);
            return;
        }
        setLoadingMonths(true);
        try {
            const data = await getMesesPermisos(anio);
            const lista = extractRows(data)
                .map((r) => Number(r?.mes))
                .filter((n) => !Number.isNaN(n))
                .sort((a, b) => a - b);
            setMonths(lista);
        } catch (_) {
            setMonths([]);
        } finally {
            setLoadingMonths(false);
        }
    }, []);

    /**
     * Consulta los registros de permisos según año/mes/motivo.
     * @param {{ ano?: number|string, mes?: number|string, motivo?: number|string }} [sel]
     */
    const fetchRegistros = useCallback(async (sel = {}) => {
        const anio = sel.ano ?? ano;
        const mesSel = sel.mes ?? mes;
        const motivoSel = sel.motivo ?? motivo;

        if (anio === '' || mesSel === '' || mesSel === null || mesSel === undefined) {
            setRows([]);
            setConsultado(false);
            return;
        }

        setLoadingRows(true);
        setError(null);
        try {
            // motivo 5 (Todos) se envía como cadena vacía al backend.
            const motivoBackend = motivoSel === 5 || motivoSel === '' ? '' : motivoSel;
            const data = await getRegistrosPermisos({
                ano: anio,
                mes: mesSel,
                motivo: motivoBackend,
            });
            setRows(extractRows(data));
            setConsultado(true);
        } catch (err) {
            setRows([]);
            setConsultado(true);
            setError(err?.message || 'No se han podido traer los registros.');
        } finally {
            setLoadingRows(false);
        }
    }, [ano, mes, motivo]);

    // Carga inicial de años.
    useEffect(() => {
        let active = true;
        async function cargar() {
            await fetchYears();
            if (active) {
                // Sin selección aún, no se consulta nada.
            }
        }
        cargar();
        return () => {
            active = false;
        };
    }, [fetchYears]);

    return {
        // Datos disponibles
        years,
        months,
        loadingYears,
        loadingMonths,

        // Selección
        ano,
        setAno,
        mes,
        setMes,
        motivo,
        setMotivo,

        // Registros
        rows,
        loadingRows,
        error,
        consultado,

        // Acciones
        fetchYears,
        fetchMonths,
        fetchRegistros,
    };
}
