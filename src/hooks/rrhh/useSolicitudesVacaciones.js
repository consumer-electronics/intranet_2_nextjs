'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    cambiarEstadoVacaciones,
    checkPermisoVacacionesTodos,
    crearVacaciones as crearVacacionesRequest,
    descargarPdfVacaciones,
    enviarCorreoVacaciones,
    getListaPersonalVacaciones,
    getNumeroVacaciones,
    getPeriodosYeminus,
    getVacacionesUsuario,
    modificarPdfVacaciones,
} from '@/api/rrhh/solicitudesVacaciones';

/**
 * Estados de una solicitud de vacaciones (coinciden con el backend legacy).
 */
export const ESTADO_VACACIONES = {
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
 * Descarga un Blob como archivo en el navegador.
 * @param {Blob} blob
 * @param {string} filename
 */
function descargarBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

/**
 * Hook central del módulo "Solicitudes de Vacaciones" (RRHH).
 *
 * Encapsula el fetching, loading/error state y las acciones de negocio,
 * dejando a los componentes de presentación libres de lógica de datos.
 *
 * @param {number|string} funId - id del funcionario autenticado.
 * @param {object} [usuario] - objeto del usuario autenticado (desde useAuth)
 *   con los campos necesarios para los flujos de correo/PDF:
 *   - nombre / fun_nombre_completo
 *   - cedula / fun_cedula
 *   - id_geminus / fun_empleado_geminus
 *   - car_nombre (rol)
 */
export function useSolicitudesVacaciones(funId, usuario) {
    // --- Acceso al submódulo "Todos" (vacaciones_todos) ---
    const [puedeVerTodos, setPuedeVerTodos] = useState(false);
    const [accessChecked, setAccessChecked] = useState(false);

    // --- Lista de personal (Personal a cargo / Todo el personal) ---
    const [personal, setPersonal] = useState([]);
    const [loadingPersonal, setLoadingPersonal] = useState(false);
    const [personalError, setPersonalError] = useState(null);
    const [modoLista, setModoLista] = useState('listaUsuario'); // 'listaUsuario' | 'listaUsuarioTodos'

    // --- Vacaciones de un usuario (modal) ---
    const [vacacionesUsuario, setVacacionesUsuario] = useState([]);
    const [loadingVacacionesUsuario, setLoadingVacacionesUsuario] = useState(false);
    const [vacacionesUsuarioError, setVacacionesUsuarioError] = useState(null);

    // --- Badge de vacaciones pendientes ---
    const [numeroVacaciones, setNumeroVacaciones] = useState(0);

    // --- Datos del usuario autenticado (para correo/PDF) ---
    const nombreUsuario =
        usuario?.nombre ??
        usuario?.fun_nombre_completo ??
        usuario?.nombre_completo ??
        '';
    const cedulaUsuario =
        usuario?.cedula ?? usuario?.fun_cedula ?? usuario?.dni ?? '';
    const idYemUsuario =
        usuario?.id_geminus ??
        usuario?.fun_empleado_geminus ??
        usuario?.geminus ??
        '';
    const rolUsuario = usuario?.car_nombre ?? usuario?.car_tag ?? '';

    // --- Validación de acceso al submódulo "Todos" ---
    useEffect(() => {
        if (!funId) return undefined;
        let active = true;

        checkPermisoVacacionesTodos(funId)
            .then((data) => {
                if (!active) return;
                setPuedeVerTodos(Boolean(data?.granted));
            })
            .catch(() => {
                if (active) setPuedeVerTodos(false);
            })
            .finally(() => {
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
            const data = await getNumeroVacaciones();
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
                const data = await getListaPersonalVacaciones(accion, { id: funId });
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
     * Carga las vacaciones de un usuario según el estado.
     * @param {{ idUsu: number|string, idEstado?: number, lider?: number }} params
     */
    const fetchVacacionesUsuario = useCallback(
        async ({ idUsu, idEstado = ESTADO_VACACIONES.EN_ESPERA, lider = 0 }) => {
            setLoadingVacacionesUsuario(true);
            setVacacionesUsuarioError(null);
            try {
                const data = await getVacacionesUsuario({ idUsu, idEstado, lider });
                const rows = extractRows(data);
                setVacacionesUsuario(rows);
                return rows;
            } catch (err) {
                setVacacionesUsuarioError(err.message);
                return [];
            } finally {
                setLoadingVacacionesUsuario(false);
            }
        },
        []
    );

    /**
     * Cambia el estado de una solicitud de vacaciones (aprobar/rechazar/anular)
     * y recarga la lista "En espera" del usuario.
     * @param {{ idUsu: number|string, idPermiso: number|string, idEstado: number }} payload
     */
    const cambiarEstado = useCallback(
        async ({ idUsu, idPermiso, idEstado }) => {
            await cambiarEstadoVacaciones({ idPermiso, idEstado });
            // Tras aprobar/rechazar desde el modal, recarga "En espera" con lider=1
            if (idUsu) {
                await fetchVacacionesUsuario({
                    idUsu,
                    idEstado: ESTADO_VACACIONES.EN_ESPERA,
                    lider: 1,
                });
            }
            // Refresca el badge y la lista de personal
            await Promise.all([fetchNumeroVacaciones(), fetchPersonal(modoLista)]);
        },
        [fetchVacacionesUsuario, fetchNumeroVacaciones, fetchPersonal, modoLista]
    );

    /**
     * Crea una solicitud de vacaciones.
     * @param {FormData} formData
     */
    const crearVacaciones = useCallback(async (formData) => {
        const data = await crearVacacionesRequest(formData);
        return data;
    }, []);

    /**
     * Descarga el PDF ya generado de una solicitud de vacaciones.
     * @param {{ idPermiso: number|string, idUsu?: number|string }} payload
     */
    const descargarPdf = useCallback(async ({ idPermiso, idUsu }) => {
        const blob = await descargarPdfVacaciones(idPermiso);
        descargarBlob(blob, `${idPermiso}.pdf`);
        return blob;
    }, []);

    /**
     * Genera el PDF de una solicitud de vacaciones rellenando la plantilla.
     * Equivale a `imprimirPermiso` del frontend legacy: primero consulta el
     * periodo vigente en Yeminus y luego llama a `modificar_pdf`.
     *
     * @param {object} datos - datos de la solicitud:
     *   { nombre, idUsu, dias, fechaInicio, fechaFin, fechaReintegro, idPermiso }
     */
    const generarPdf = useCallback(
        async (datos) => {
            const {
                nombre = nombreUsuario,
                idUsu,
                dias,
                fechaInicio,
                fechaFin,
                fechaReintegro,
                idPermiso,
            } = datos || {};

            if (!idYemUsuario) {
                throw new Error('Su usuario no está registrado en Yéminus');
            }

            // 1. Consulta el periodo vigente en Yeminus
            const periodo = await getPeriodosYeminus(idYemUsuario);
            const { fechaInicio: fechaIniYem, fechaFin: fechaFinYem } = periodo || {};

            if (fechaIniYem == null || fechaFinYem == null) {
                throw new Error('Tu cargo no permite saber periodos de vacaciones');
            }

            // 2. Genera/modifica el PDF
            const blob = await modificarPdfVacaciones({
                accion: 'modificar_pdf',
                nombre,
                idUsu,
                dias,
                cedula: cedulaUsuario,
                fechaInicio,
                fechaFin,
                fechaReintegro,
                idPermiso,
                fechaIniYem,
                fechaFinYem,
            });

            descargarBlob(blob, `${idPermiso}.pdf`);
            return blob;
        },
        [idYemUsuario, nombreUsuario, cedulaUsuario]
    );

    /**
     * Marca el PDF de una solicitud como "aprobado via intranet".
     * Equivale a `pdf_aprobado` del frontend legacy.
     * @param {{ idUsu: number|string, idPermiso: number|string }} payload
     */
    const marcarPdfAprobado = useCallback(async ({ idUsu, idPermiso }) => {
        return modificarPdfVacaciones({
            accion: 'pdf_aprobado',
            idUsu,
            idPermiso,
            via: 'intranet',
        });
    }, []);

    /**
     * Marca el PDF de una solicitud como "reversado via intranet".
     * Equivale a `pdf_reversado` del frontend legacy.
     * @param {{ idUsu: number|string, idPermiso: number|string }} payload
     */
    const marcarPdfReversado = useCallback(async ({ idUsu, idPermiso }) => {
        return modificarPdfVacaciones({
            accion: 'pdf_reversado',
            idUsu,
            idPermiso,
            via: 'intranet',
        });
    }, []);

    /**
     * Envía la notificación por correo al jefe al crear una solicitud.
     * Equivale a `enviarCorreoVacas` del frontend legacy.
     * @param {object} payload - { nombre, id, fechaIni, fechaFin, fechaReintegro,
     *   numDias, respPermiso, token, observaciones }
     */
    const enviarCorreoCreacion = useCallback(async (payload) => {
        return enviarCorreoVacaciones({ accion: 'enviarCorreoVacas', ...payload });
    }, []);

    /**
     * Envía la notificación por correo al usuario al aprobar su solicitud.
     * Equivale a `enviarCorreoVacasUserAprobar`.
     * @param {object} payload - { id, dias, fechaInicio, fechaFinal, fechaReintegro, idPermiso }
     */
    const enviarCorreoAprobacion = useCallback(async (payload) => {
        return enviarCorreoVacaciones({
            accion: 'enviarCorreoVacasUserAprobar',
            ...payload,
        });
    }, []);

    /**
     * Envía la notificación por correo al usuario al rechazar/reversar.
     * Equivale a `enviarCorreoVacasUserRechazo` / `enviarCorreoVacasUserReversado`.
     * @param {object} payload - { id, dias, fechaInicio, fechaFinal, fechaReintegro,
     *   idPermiso?, reversado? }
     */
    const enviarCorreoRechazo = useCallback(async (payload) => {
        const { reversado, ...resto } = payload || {};
        const accion = reversado
            ? 'enviarCorreoVacasUserReversado'
            : 'enviarCorreoVacasUserRechazo';
        return enviarCorreoVacaciones({ accion, ...resto });
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
        accessChecked,

        // Personal
        personal,
        loadingPersonal,
        personalError,
        fetchPersonal,
        modoLista,

        // Vacaciones de usuario
        vacacionesUsuario,
        loadingVacacionesUsuario,
        vacacionesUsuarioError,
        fetchVacacionesUsuario,

        // Acciones de estado / creación
        cambiarEstado,
        crearVacaciones,

        // PDF
        descargarPdf,
        generarPdf,
        marcarPdfAprobado,
        marcarPdfReversado,

        // Correos
        enviarCorreoCreacion,
        enviarCorreoAprobacion,
        enviarCorreoRechazo,

        // Badge
        numeroVacaciones,
        fetchNumeroVacaciones,
    };
}
