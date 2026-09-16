'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';

import SyncIcon from '@mui/icons-material/Sync';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ListIcon from '@mui/icons-material/List';

import { useAuth } from '@/hooks/useAuth';
import { usePermisosPorteria } from '@/hooks/rrhh/usePermisosPorteria';

import PermisosTable from './PermisosTable';
import VisitantesTable from './VisitantesTable';
import EntregadosDialog from './EntregadosDialog';
import PersonaDialog from './PersonaDialog';
import FinalizarPermisoDialog from './FinalizarPermisoDialog';
import ConfirmarEntregaDialog from './ConfirmarEntregaDialog';
import AccessDeniedAlert from './AccessDeniedAlert';

/*
 * Valores del tab — coinciden con el estado `view` del hook.
 */
const TAB_PERMISOS = 'permisos';
const TAB_VISITANTES = 'visitantes';

export default function PermisosPorteriaView() {
  /*
   * =========================================================
   * SESIÓN
   * =========================================================
   *
   * La autenticación viene del sistema central del proyecto.
   *
   * useAuth() consulta /api/auth/me.
   *
   * No se utiliza:
   * - useSession()
   * - localStorage
   * - session PHP
   * - lectura manual de cookies
   */
  const { user, loading: authLoading } = useAuth();

  /*
   * =========================================================
   * PERMISOS DE PORTERÍA
   * =========================================================
   *
   * El hook recibe únicamente el identificador que necesita
   * el módulo para realizar sus consultas.
   *
   * La autenticación de las peticiones NO depende de este id.
   * Las cookies httpOnly se envían automáticamente mediante
   * apiFetch().
   */
  const funcionarioId =
    user?.fun_id ?? user?.funId ?? user?.id ?? null;

  const {
    accessGranted,
    view,
    setView,

    permisos,
    loadingPermisos,
    finalizarPermiso,
    fetchPermisos,

    visitantes,
    loadingVisitantes,
    fetchVisitantes,

    entregar,

    entregados,
    loadingEntregados,
    fetchEntregados,
  } = usePermisosPorteria(funcionarioId);

  /*
   * =========================================================
   * ESTADO DE DIÁLOGOS
   * =========================================================
   */

  // Finalizar permiso (mantenido en código aunque la columna
  // fue eliminada de la tabla, por si se reactiva en el futuro)
  const [finalizarOpen, setFinalizarOpen] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState(null);

  // Datos de persona
  const [personaOpen, setPersonaOpen] = useState(false);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);

  // Carnets entregados
  const [entregadosOpen, setEntregadosOpen] = useState(false);

  // Confirmación de entrega de carné
  const [confirmarOpen, setConfirmarOpen] = useState(false);
  const [visitanteSeleccionado, setVisitanteSeleccionado] = useState(null);
  const [entregandoId, setEntregandoId] = useState(false);

  /*
   * =========================================================
   * NOTIFICACIONES
   * =========================================================
   */

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const notify = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  /*
   * =========================================================
   * ACCIONES
   * =========================================================
   */

  const handleFinalizar = (id) => {
    setIdSeleccionado(id);
    setFinalizarOpen(true);
  };

  const handleFinalizarSubmit = async (formLlegadaHora) => {
    try {
      await finalizarPermiso(idSeleccionado, formLlegadaHora);
      setFinalizarOpen(false);
      setIdSeleccionado(null);
      notify('Permiso finalizado correctamente');
    } catch (err) {
      notify(
        err?.message || 'No se ha podido enviar el formulario.',
        'error'
      );
    }
  };

  /** Abre el modal de confirmación antes de entregar el carné */
  const handleSolicitarEntregar = (visitante) => {
    setVisitanteSeleccionado(visitante);
    setConfirmarOpen(true);
  };

  /** Ejecuta la entrega tras la confirmación del modal */
  const handleConfirmarEntregar = async () => {
    if (!visitanteSeleccionado) return;
    setEntregandoId(true);
    try {
      await entregar(visitanteSeleccionado.id);
      setConfirmarOpen(false);
      setVisitanteSeleccionado(null);
      notify('Carné entregado correctamente');
    } catch (err) {
      notify(err?.message || 'Carné no entregado', 'error');
    } finally {
      setEntregandoId(false);
    }
  };

  const handleVerPersona = (persona) => {
    setPersonaSeleccionada(persona);
    setPersonaOpen(true);
  };

  const handleTabChange = (_, newValue) => {
    setView(newValue);
  };

  const handleSync = () => {
    if (view === TAB_PERMISOS) {
      fetchPermisos();
    } else {
      fetchVisitantes();
    }
  };

  /*
   * =========================================================
   * CARGA DE AUTENTICACIÓN
   * =========================================================
   *
   * Primero esperamos a que useAuth determine quién es
   * el usuario.
   */
  if (authLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /*
   * useAuth() se encarga de redirigir al login si no existe
   * una sesión válida.
   *
   * Este return es una protección adicional para evitar
   * renderizar el módulo mientras no tenemos usuario.
   */
  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /*
   * =========================================================
   * VALIDACIÓN DE ACCESO AL MÓDULO
   * =========================================================
   */

  if (accessGranted === null) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (accessGranted === false) {
    return <AccessDeniedAlert />;
  }

  /*
   * =========================================================
   * VISTA PRINCIPAL
   * =========================================================
   */

  return (
    <Box
      sx={{
        maxWidth:
          view === TAB_PERMISOS ? 900 : '95%',
        mx: 'auto',
        mt: 4,
        mb: 5,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {/* ── Encabezado ── */}
        <Box sx={{ px: 3, pt: 3, pb: 0 }}>
          <Typography
            variant="h5"
            component="h1"
            fontWeight={700}
            gutterBottom
          >
            Portería
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Gestión de permisos aprobados y control de visitantes
          </Typography>
        </Box>

        {/* ── Tabs + acciones ── */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tabs
            value={view}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            aria-label="Secciones de portería"
          >
            <Tab
              value={TAB_PERMISOS}
              label="Permisos aprobados"
              icon={<AssignmentIcon fontSize="small" />}
              iconPosition="start"
              id="tab-permisos"
              aria-controls="tabpanel-permisos"
            />
            <Tab
              value={TAB_VISITANTES}
              label="Visitantes"
              icon={<PeopleAltIcon fontSize="small" />}
              iconPosition="start"
              id="tab-visitantes"
              aria-controls="tabpanel-visitantes"
            />
          </Tabs>

          {/* Acciones contextuales al tab activo */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            {view === TAB_VISITANTES && (
              <Tooltip title="Carnets entregados">
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={() => setEntregadosOpen(true)}
                  aria-label="Ver carnets entregados"
                >
                  <ListIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Sincronizar">
              <IconButton
                size="small"
                color="primary"
                onClick={handleSync}
                aria-label="Sincronizar datos"
              >
                <SyncIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* ── Contenido del tab ── */}
        <Box sx={{ p: 3 }}>
          <Box
            role="tabpanel"
            id="tabpanel-permisos"
            aria-labelledby="tab-permisos"
            hidden={view !== TAB_PERMISOS}
          >
            {view === TAB_PERMISOS && (
              <PermisosTable
                rows={permisos}
                loading={loadingPermisos}
              />
            )}
          </Box>

          <Box
            role="tabpanel"
            id="tabpanel-visitantes"
            aria-labelledby="tab-visitantes"
            hidden={view !== TAB_VISITANTES}
          >
            {view === TAB_VISITANTES && (
              <VisitantesTable
                rows={visitantes}
                loading={loadingVisitantes}
                onSolicitarEntregar={handleSolicitarEntregar}
                onVerPersona={handleVerPersona}
              />
            )}
          </Box>
        </Box>
      </Paper>

      {/* ── Diálogos ── */}

      {/*
       * FinalizarPermisoDialog: mantenido en código aunque la columna
       * fue eliminada de la tabla. Si se desea reactivar, añadir
       * onFinalizar={handleFinalizar} a <PermisosTable>.
       */}
      <FinalizarPermisoDialog
        open={finalizarOpen}
        onClose={() => {
          setFinalizarOpen(false);
          setIdSeleccionado(null);
        }}
        onSubmit={handleFinalizarSubmit}
      />

      <ConfirmarEntregaDialog
        open={confirmarOpen}
        onClose={() => {
          if (!entregandoId) {
            setConfirmarOpen(false);
            setVisitanteSeleccionado(null);
          }
        }}
        onConfirm={handleConfirmarEntregar}
        visitante={visitanteSeleccionado?.guest_name}
        loading={entregandoId}
      />

      <PersonaDialog
        open={personaOpen}
        onClose={() => setPersonaOpen(false)}
        persona={personaSeleccionada}
      />

      <EntregadosDialog
        open={entregadosOpen}
        onClose={() => setEntregadosOpen(false)}
        rows={entregados}
        loading={loadingEntregados}
        onBuscar={fetchEntregados}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
