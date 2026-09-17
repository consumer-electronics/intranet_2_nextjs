'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';

/** Duración del token en ms (debe coincidir con el Route Handler) */
const SSO_TTL_MS = 5 * 60 * 1000;

/** Umbral de alerta visual en ms */
const SSO_WARN_MS = 30 * 1000;

/**
 * Formatea milisegundos restantes como MM:SS.
 * @param {number} ms
 * @returns {string}
 */
function formatCountdown(ms) {
    if (ms <= 0) return '00:00';
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Tab de Incapacidades.
 *
 * Estados:
 *   idle    → muestra botón "Ir al Portal"
 *   loading → spinner mientras se genera el token SSO
 *   ready   → botón habilitado + contador regresivo
 *   error   → mensaje de error + botón reintentar
 */
export default function IncapacidadesTab() {
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const [redirectUrl, setRedirectUrl] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [timeLeft, setTimeLeft] = useState(SSO_TTL_MS);
    const [isWarning, setIsWarning] = useState(false);

    const intervalRef = useRef(null);

    /** Limpia el contador regresivo */
    const clearCountdown = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    /** Inicia el contador regresivo a partir de expiresAt */
    const startCountdown = useCallback(
        (exp) => {
            clearCountdown();
            intervalRef.current = setInterval(() => {
                const remaining = exp - Date.now();
                if (remaining <= 0) {
                    clearCountdown();
                    setTimeLeft(0);
                    setIsWarning(false);
                    setStatus('idle');
                    setRedirectUrl(null);
                } else {
                    setTimeLeft(remaining);
                    setIsWarning(remaining <= SSO_WARN_MS);
                }
            }, 1000);
        },
        [clearCountdown]
    );

    // Limpieza al desmontar
    useEffect(() => () => clearCountdown(), [clearCountdown]);

    /** Solicita el token SSO al Route Handler y activa el contador */
    const generateAccess = useCallback(async (autoOpen = false) => {
        setStatus('loading');
        setErrorMsg('');

        let newWindow = null;
        if (autoOpen) {
            newWindow = window.open('about:blank', '_blank');
            if (!newWindow) {
                setErrorMsg('El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para este sitio.');
                setStatus('error');
                return;
            }
        }

        try {
            const res = await fetch('/api/rrhh/incapacidades/sso-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || 'No se pudo generar el acceso');
            }

            const { redirectUrl: url, expiresAt: exp } = data;

            setRedirectUrl(url);
            setExpiresAt(exp);
            setTimeLeft(exp - Date.now());
            setIsWarning(false);
            setStatus('ready');
            startCountdown(exp);

            if (autoOpen && newWindow) {
                newWindow.location.href = url;
            }
        } catch (err) {
            console.error('[IncapacidadesTab]', err);
            setErrorMsg(err.message || 'Error inesperado al generar el acceso al portal');
            setStatus('error');
            if (autoOpen && newWindow) {
                newWindow.close();
            }
        }
    }, [startCountdown]);

    /** Abre el portal en una pestaña nueva */
    const handleOpenPortal = useCallback(() => {
        if (!redirectUrl) return;
        // Nota: NO usar 'noopener' — con ese flag el navegador no retorna
        // la referencia y la pestaña queda en blanco.
        // Abrimos directamente con la URL para evitar el problema.
        const win = window.open(redirectUrl, '_blank');
        if (!win) {
            setErrorMsg(
                'El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para este sitio.'
            );
            setStatus('error');
            return;
        }
    }, [redirectUrl]);

    return (
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
            {/* ── Encabezado del tab ── */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <LocalHospitalIcon color="primary" fontSize="medium" />
                <Typography variant="h6" fontWeight={700}>
                    Portal de Incapacidades
                </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Accede al portal para registrar y gestionar tus incapacidades médicas.
                Se generará un acceso temporal (válido por 5 minutos) que te identificará
                automáticamente en el sistema.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* ── Tarjeta de acceso al portal ── */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                }}
            >
                {/* Info del portal */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <LocalHospitalIcon sx={{ color: 'white', fontSize: 26 }} />
                    </Box>
                    <Box>
                        <Typography variant="body1" fontWeight={600}>
                            Portal de Incapacidades
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Registro y seguimiento de incapacidades médicas
                        </Typography>

                        {/* ── Contador regresivo ── */}
                        {status === 'ready' && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                                sx={{ mt: 0.75 }}
                            >
                                <AccessTimeIcon
                                    fontSize="small"
                                    sx={{
                                        color: isWarning ? 'error.main' : 'text.secondary',
                                        fontSize: 15,
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: isWarning ? 'error.main' : 'text.secondary',
                                        fontWeight: isWarning ? 700 : 400,
                                        animation: isWarning
                                            ? 'incap-pulse 1s ease-in-out infinite'
                                            : 'none',
                                        '@keyframes incap-pulse': {
                                            '0%, 100%': { opacity: 1 },
                                            '50%': { opacity: 0.4 },
                                        },
                                    }}
                                >
                                    El enlace expira en{' '}
                                    <strong>{formatCountdown(timeLeft)}</strong>
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </Stack>

                {/* ── Botón de acción ── */}
                <Box sx={{ flexShrink: 0 }}>
                    {status === 'idle' && (
                        <Button
                            id="btn-incapacidades-portal"
                            variant="contained"
                            startIcon={<OpenInNewIcon />}
                            onClick={() => generateAccess(true)}
                            size="medium"
                        >
                            Ir al Portal
                        </Button>
                    )}

                    {status === 'loading' && (
                        <Button
                            variant="contained"
                            disabled
                            startIcon={
                                <CircularProgress size={16} color="inherit" />
                            }
                            size="medium"
                        >
                            Generando acceso…
                        </Button>
                    )}

                    {status === 'ready' && (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Button
                                id="btn-incapacidades-portal"
                                variant="contained"
                                startIcon={<OpenInNewIcon />}
                                onClick={handleOpenPortal}
                                size="medium"
                            >
                                Ir al Portal
                            </Button>
                            <Button
                                id="btn-incapacidades-refresh"
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={() => generateAccess(false)}
                                size="medium"
                                title="Regenerar acceso"
                            >
                                Renovar
                            </Button>
                        </Stack>
                    )}

                    {status === 'error' && (
                        <Button
                            id="btn-incapacidades-retry"
                            variant="outlined"
                            color="error"
                            startIcon={<RefreshIcon />}
                            onClick={() => generateAccess(true)}
                            size="medium"
                        >
                            Reintentar
                        </Button>
                    )}
                </Box>
            </Box>

            {/* ── Alerta de error ── */}
            {status === 'error' && errorMsg && (
                <Alert
                    severity="error"
                    icon={<ErrorOutlineIcon />}
                    sx={{ mt: 2, borderRadius: 2 }}
                >
                    {errorMsg}
                </Alert>
            )}

            {/* ── Nota informativa ── */}
            <Box sx={{ mt: 3 }}>
                <Chip
                    icon={<AccessTimeIcon fontSize="small" />}
                    label="El acceso generado es temporal y válido por 5 minutos"
                    size="small"
                    variant="outlined"
                    color="default"
                    sx={{ fontSize: '0.75rem' }}
                />
            </Box>
        </Box>
    );
}
