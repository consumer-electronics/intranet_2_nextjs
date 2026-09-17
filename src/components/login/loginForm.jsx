'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';

import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { useThemeMode } from '@/hooks/useThemeMode';
import PasswordRecoveryDialogs from './PasswordRecoveryDialogs';

function LoginForm() {
  const { login, loginWithGoogle } = useAuth({ redirectOnUnauthenticated: false });
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [openRecovery, setOpenRecovery] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username || !password || submitting) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      await login({ usuario: username, password, remember });
    } catch (err) {
      setErrorMessage(err?.message || 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        // Fondo general mejorado. En modo claro usamos un gradiente sutil.
        background: mode === 'light'
          ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          : 'background.default',
        p: { xs: 2, md: 2 },
        gap: { xs: 0, md: 2 },
        position: 'relative',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ position: 'absolute', top: 20, right: 22, zIndex: 10 }}>
        <ThemeToggle />
      </Box>

      {/* Panel Izquierdo con Video de Fondo */}
      <Box
        sx={{
          width: '68%',
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          color: '#FFFFFF',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          p: 6,
          boxShadow: mode === 'light' ? '0 12px 40px rgba(0,0,0,0.1)' : '0 8px 40px rgba(0,0,0,0.35)',
        }}
      >
        {mounted && isMdUp && (
          <Box
            component="video"
            autoPlay
            loop
            muted
            playsInline
            src="https://dynamics.appceg.com/intranet_ignore/videos/HYUNDAI%20ELECTRONICS-ALTA%20v3.mp4"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
            }}
          />
        )}

        {/* Overlay de degradado */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* Marco interior sutil */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            borderRadius: 3,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
            pointerEvents: 'none',
          }}
        />

        {/* <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 480 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Bienvenido a la Intranet
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            Tu espacio de trabajo corporativo, siempre a un clic de distancia.
          </Typography>
        </Box> */}
      </Box>

      {/* Formulario de Login Derecha */}
      <Box
        sx={{
          width: { xs: '100%', md: '32%' },
          maxWidth: { xs: 400, md: 'none' },
          minWidth: { md: 380 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'background.paper',
          backdropFilter: mode === 'light' ? 'blur(10px)' : 'none',
          borderRadius: 3,
          boxShadow: mode === 'light'
            ? '0 12px 40px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.5)'
            : '0 8px 40px rgba(0,0,0,0.3)',
          p: { xs: 4, sm: 5, md: 4 },
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Paper elevation={0} sx={{ width: '100%', maxWidth: 400, border: 'none', p: { xs: 0, md: 1 }, backgroundColor: 'transparent' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: mode === 'light' ? '#fff' : 'rgba(255,255,255,0.05)',
                boxShadow: mode === 'light' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
                p: 1
              }}
            >
              <Image src="/images/logos/logo.png" alt="Logo" width={80} height={80} style={{ objectFit: 'contain' }} />
            </Box>
          </Box>

          <Typography variant="h4" align="center" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Bienvenido
          </Typography>

          <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mb: 4 }}>
            Ingresa tus credenciales para continuar
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Usuario"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              fullWidth
              disabled={submitting}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              fullWidth
              disabled={submitting}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((value) => !value)}
                        edge="end"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 1 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    color="primary"
                    disabled={submitting}
                  />
                }
                label="Recordarme"
              />

              <Typography
                component="a"
                href="#"
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: 500, cursor: 'pointer' }}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenRecovery(true);
                }}
              >
                ¿Olvidaste tu contraseña?
              </Typography>
            </Box>

            <Button type="submit" fullWidth size="large" disabled={submitting}>
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
            </Button>

            {/* Login con google deshabilitado hasta que se revisen los correos asociados a los funccionarios */}

            {/* <Divider sx={{ my: 3, typography: 'body2', color: 'text.secondary' }}>O ingresa con</Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setSubmitting(true);
                  setErrorMessage('');
                  try {
                    await loginWithGoogle(credentialResponse.credential);
                  } catch (err) {
                    setErrorMessage(err?.message || 'No se pudo iniciar sesión con Google');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                onError={() => {
                  setErrorMessage('El inicio de sesión con Google falló');
                }}
                shape="rectangular"
                theme={mode === 'dark' ? 'filled_black' : 'outline'}
                size="large"
                locale="es"
              />
            </Box> */}
          </Box>

          <PasswordRecoveryDialogs open={openRecovery} onClose={() => setOpenRecovery(false)} />

          <Typography variant="caption" align="center" sx={{ display: 'block', color: 'text.secondary', mt: 4 }}>
            © {new Date().getFullYear()} Intranet
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginForm;