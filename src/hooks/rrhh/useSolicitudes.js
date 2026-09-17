'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    cambiarEstadoPermiso,
    checkPermisoSolicitudes,
    crearPermiso as crearPermisoRequest,
    getListaPersonal,
    getNumeroSolicitudes,
    getPermisosUsuario,
} from '@/api/rrhh/solicitudes';

/**
 * Estados de un permiso (coinciden con el backend legacy).
 */
export const ESTADO_PERMISO = {
    EN_ESPERA: 1,
    ANULADO: 2,
    APROBADO: 3,
    RECHAZADO: 4,
    FINALIZADO: 5,
};

/**
 * Extrae el arreglo de filas de la respuesta normalizada de las rutas
 * internas. Las rutas devuelven `{ data: { rows: [...] } }`.
 */
function extractRows(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

/**
 * Hook central del módulo "Solicitudes de Permisos".
 *
 * Encapsula el fetching, loading/error state y las acciones de negocio,
 * dejando a los componentes de presentación libres de lógica de datos.
 *
 * @param {number|string} funId - id del funcionario autenticado.
 */
export function useSolicitudes(funId) {
    // --- Acceso a submódulos (solicitud_permisos_todos / solicitud_permisos_registros) ---
    const [puedeVerTodos, setPuedeVerTodos] = useState(false);
    const [puedeVerRegistro, setPuedeVerRegistro] = useState(false);
    const [accessChecked, setAccessChecked] = useState(false);

    // --- Lista de personal (Personal a cargo / Todo el personal) ---
    const [personal, setPersonal] = useState([]);
    const [loadingPersonal, setLoadingPersonal] = useState(false);
    const [personalError, setPersonalError] = useState(null);
    const [modoLista, setModoLista] = useState('listaUsuario'); // 'listaUsuario' | 'listaUsuarioTodos'

    // --- Permisos de un usuario (modal) ---
    const [permisosUsuario, setPermisosUsuario] = useState([]);
    const [loadingPermisosUsuario, setLoadingPermisosUsuario] = useState(false);
    const [permisosUsuarioError, setPermisosUsuarioError] = useState(null);

    // --- Badge de vacaciones pendientes ---
    const [numeroVacaciones, setNumeroVacaciones] = useState(0);

    // --- Validación de acceso a los submódulos "Todos" y "Registro" ---
    useEffect(() => {
        if (!funId) return undefined;
        let active = true;

        const checkPermiso = (modNombre, setter) =>
            checkPermisoSolicitudes(funId, modNombre)
                .then((data) => {
                    if (active) setter(Boolean(data?.granted));
                })
                .catch(() => {
                    if (active) setter(false);
                });

        Promise.all([
            checkPermiso('solicitud_permisos_todos', setPuedeVerTodos),
            checkPermiso('solicitud_permisos_registros', setPuedeVerRegistro),
        ]).finally(() => {
            if (active) setAccessChecked(true);
        });

        return () => {
            active = false;
        };
    }, [funId]);

    /**
     * Carga el badge de vacaciones pendientes.
     */
    const fetchNumeroVacaciones = useCallback(async () => {
        try {
            const data = await getNumeroSolicitudes();
            setNumeroVacaciones(Number(data?.numero ?? 0));
        } catch (_) {
            setNumeroVacaciones(0);
        }
    }, []);

    /**
     * Carga la lista de personal según el modo.
     * @param {'listaUsuario'|'listaUsuarioTodos'} [accion]
     */
    const fetchPersonal = useCallback(
        async (accion = 'listaUsuario') => {
            setLoadingPersonal(true);
            setPersonalError(null);
            try {
                const data = await getListaPersonal(accion, { id: funId });
                const rows = extractRows(data);
                setPersonal(rows);
                setModoLista(accion);
            } catch (err) {
                setPersonalError(err.message);
            } finally {
                setLoadingPersonal(false);
            }
        },
        [funId]
    );

    /**
     * Carga los permisos de un usuario según el estado.
     * @param {{ idUsu: number|string, idEstado?: number, lider?: number }} params
     */
    const fetchPermisosUsuario = useCallback(
        async ({ idUsu, idEstado = ESTADO_PERMISO.EN_ESPERA, lider = 0 }) => {
            setLoadingPermisosUsuario(true);
            setPermisosUsuarioError(null);
            try {
                const data = await getPermisosUsuario({ idUsu, idEstado, lider });
                const rows = extractRows(data);
                setPermisosUsuario(rows);
                return rows;
            } catch (err) {
                setPermisosUsuarioError(err.message);
                return [];
            } finally {
                setLoadingPermisosUsuario(false);
            }
        },
        []
    );

    /**
     * Aprobar / rechazar / anular un permiso y recarga la lista "En espera".
     * @param {{ idUsu: number|string, idPermiso: number|string, idEstado: number }} payload
     */
    const cambiarEstado = useCallback(
        async ({ idUsu, idPermiso, idEstado }) => {
            await cambiarEstadoPermiso({ idPermiso, idEstado });
            // Tras aprobar/rechazar desde el modal, recarga "En espera" con lider=1
            if (idUsu) {
                await fetchPermisosUsuario({
                    idUsu,
                    idEstado: ESTADO_PERMISO.EN_ESPERA,
                    lider: 1,
                });
            }
            // Refresca el badge y la lista de personal
            await Promise.all([fetchNumeroVacaciones(), fetchPersonal(modoLista)]);
        },
        [fetchPermisosUsuario, fetchNumeroVacaciones, fetchPersonal, modoLista]
    );

    /**
     * Crea una solicitud de permiso.
     * @param {FormData} formData
     */
    const crearPermiso = useCallback(async (formData) => {
        const data = await crearPermisoRequest(formData);
        return data;
    }, []);

    // Carga inicial: badge + lista "Personal a cargo"
    useEffect(() => {
        if (!funId) return undefined;
        let active = true;

        async function cargarInicial() {
            await fetchNumeroVacaciones();
            if (active) await fetchPersonal('listaUsuario');
        }

        cargarInicial();

        return () => {
            active = false;
        };
    }, [funId, fetchNumeroVacaciones, fetchPersonal]);

    return {
        // Acceso
        puedeVerTodos,
        puedeVerRegistro,
        accessChecked,

        // Personal
        personal,
        loadingPersonal,
        personalError,
        fetchPersonal,
        modoLista,

        // Permisos de usuario
        permisosUsuario,
        loadingPermisosUsuario,
        permisosUsuarioError,
        fetchPermisosUsuario,

        // Acciones
        cambiarEstado,
        crearPermiso,

        // Badge
        numeroVacaciones,
        fetchNumeroVacaciones,
    };
}
