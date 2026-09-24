'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import RegistroTabContent from './registro/RegistroTabContent';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';

import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import { useAuth } from '@/hooks/useAuth';
import { useSolicitudes } from '@/hooks/rrhh/useSolicitudes';

import PermisosTab from './permisos/PermisosTab';
import VacacionesTab from './vacaciones/VacacionesTab';
import IncapacidadesTab from './incapacidades/IncapacidadesTab';

/**
 * Módulo principal de Solicitudes.
 *
 * Renderiza el encabezado, los Tabs de navegación y el contenido del Tab activo.
 * Cada Tab mantiene su propia lógica interna (hooks, estado, diálogos).
 *
 * La navegación entre Tabs actualiza la URL para soportar deep links y bookmarks:
 *   Tab "Permisos"             → /rrhh/solicitudes
 *   Tab "Vacaciones" → /rrhh/solicitudes/vacaciones
 *   Tab "Registro"             → /rrhh/solicitudes/registro  (solo si puedeVerRegistro)
 *
 * Props:
 *  - defaultTab {'permisos'|'vacaciones'|'registro'}  Tab activo inicial.
 */
export default function SolicitudesModulo({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();

    const funcionarioId =
        user?.fun_id ?? user?.funId ?? user?.id ?? user?.id_usuario ?? null;

    /* ──────────────────────────────────────────────────────────
     *  Permisos de acceso a submódulos + badge de vacaciones
     *  Se consultan aquí para controlar los Tabs visibles.
     * ────────────────────────────────────────────────────────── */
    const {
        puedeVerRegistro,
        accessChecked,
        numeroVacaciones,
    } = useSolicitudes(funcionarioId);

    /* ── Mapeo de Tabs ── */
    const TABS = useMemo(() => {
        const lista = [
            {
                key: 'permisos',
                label: 'Permisos',
                icon: <AssignmentIcon fontSize="small" />,
                href: '/rrhh/solicitudes',
            },
            {
                key: 'vacaciones',
                label: 'Vacaciones',
                icon: <BeachAccessIcon fontSize="small" />,
                href: '/rrhh/solicitudes/vacaciones',
                badge: numeroVacaciones > 0 ? numeroVacaciones : 0,
            },
            {
                key: 'incapacidades',
                label: 'Incapacidades',
                icon: <LocalHospitalIcon fontSize="small" />,
                href: '/rrhh/solicitudes/incapacidades',
            },
        ];
        // TODO: modulo no funciona en productivo, revisar, corregir y luego implementar aca, comentado para que no de error en compilacion
        if (puedeVerRegistro) {
            lista.push({
                key: 'registro',
                label: 'Registro',
                icon: <MenuBookIcon fontSize="small" />,
                href: '/rrhh/solicitudes/registro',
            });
        }
        return lista;
    }, [numeroVacaciones, puedeVerRegistro]);

    const activeTab = useMemo(() => {
        if (pathname.includes('/registro')) return 'registro';
        if (pathname.includes('/vacaciones')) return 'vacaciones';
        if (pathname.includes('/incapacidades')) return 'incapacidades';
        return 'permisos';
    }, [pathname]);

    const activeIndex = useMemo(() => {
        const idx = TABS.findIndex((t) => t.key === activeTab);
        return idx >= 0 ? idx : 0;
    }, [TABS, activeTab]);

    const handleTabChange = (_event, newIndex) => {
        const tab = TABS[newIndex];
        if (tab) router.push(tab.href);
    };

    /* ── Estados de carga ── */
    if (authLoading || !user) {
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

    if (!accessChecked) {
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

    /* ── Render ── */
    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 5, px: { xs: 1, sm: 0 } }}>
            <Paper
                variant="outlined"
                sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper' }}
            >
                {/* ── Encabezado ── */}
                <Box sx={{ px: 3, pt: 3, pb: 0 }}>
                    <Typography variant="h5" component="h1" fontWeight={700}>
                        Solicitudes
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Gestión de solicitudes de permisos y vacaciones del personal
                    </Typography>
                </Box>

                {/* ── Tabs de navegación ── */}
                <Tabs
                    value={activeIndex}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    aria-label="Módulos de solicitudes"
                    sx={{
                        px: 3,
                        mt: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            minHeight: 48,
                            gap: 0.75,
                        },
                        '& .MuiTab-root.Mui-selected': {
                            fontWeight: 700,
                        },
                    }}
                >
                    {TABS.map((tab) => (
                        <Tab
                            key={tab.key}
                            id={`solicitudes-tab-${tab.key}`}
                            aria-controls={`solicitudes-panel-${tab.key}`}
                            label={
                                tab.badge > 0 ? (
                                    <Stack direction="row" alignItems="center" spacing={0.75}>
                                        <span>{tab.label}</span>
                                        <Badge
                                            badgeContent={tab.badge}
                                            color="error"
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    position: 'relative',
                                                    transform: 'none',
                                                    fontSize: '0.65rem',
                                                    height: 17,
                                                    minWidth: 17,
                                                },
                                            }}
                                        />
                                    </Stack>
                                ) : (
                                    tab.label
                                )
                            }
                            icon={tab.icon}
                            iconPosition="start"
                        />
                    ))}
                </Tabs>

                {/* ── Paneles de cada Tab ──────────────────────────────────────
                 *  Todos se renderizan simultáneamente y se ocultan con CSS.
                 *  Esto evita desmontar/montar al cambiar de Tab, preservando
                 *  el estado de los hooks y eliminando el parpadeo de carga.
                 * ─────────────────────────────────────────────────────────── */}

                {/* Tab: Permisos */}
                <Box
                    role="tabpanel"
                    id="solicitudes-panel-permisos"
                    aria-labelledby="solicitudes-tab-permisos"
                    sx={{ display: activeTab === 'permisos' ? 'block' : 'none' }}
                >
                    <PermisosTab funcionarioId={funcionarioId} user={user} />
                </Box>

                {/* Tab: Vacaciones */}
                <Box
                    role="tabpanel"
                    id="solicitudes-panel-vacaciones"
                    aria-labelledby="solicitudes-tab-vacaciones"
                    sx={{ display: activeTab === 'vacaciones' ? 'block' : 'none' }}
                >
                    <VacacionesTab funcionarioId={funcionarioId} user={user} />
                </Box>

                {/* Tab: Incapacidades */}
                <Box
                    role="tabpanel"
                    id="solicitudes-panel-incapacidades"
                    aria-labelledby="solicitudes-tab-incapacidades"
                    sx={{ display: activeTab === 'incapacidades' ? 'block' : 'none' }}
                >
                    <IncapacidadesTab />
                </Box>

                {/* Tab: Registro (solo si el usuario tiene acceso) */}
                {puedeVerRegistro && (
                    <Box
                        role="tabpanel"
                        id="solicitudes-panel-registro"
                        aria-labelledby="solicitudes-tab-registro"
                        sx={{ display: activeTab === 'registro' ? 'block' : 'none' }}
                    >
                        <RegistroTabWrapper />
                    </Box>
                )}
                {/* Renderizamos el children del layout de forma oculta para Next.js */}
                {children && <Box sx={{ display: 'none' }}>{children}</Box>}
            </Paper>
        </Box>
    );
}

/**
 * Wrapper del Tab de Registro.
 * RegistroTabContent tiene su propia lógica de acceso y autenticación.
 */
function RegistroTabWrapper() {
    return <RegistroTabContent />;
}
