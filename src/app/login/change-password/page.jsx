'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

export default function ChangePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [idUsuario, setIdUsuario] = useState(null);
  const [username, setUsername] = useState('');
  const { login } = useAuth({ redirectOnUnauthenticated: false });

  useEffect(() => {
    // Intentar recuperar ID de usuario del session storage (viene de la recuperación de contraseña)
    // O si en el futuro se implementa un JWT con mustChangePassword = true, se leería de context.
    const storedId = sessionStorage.getItem('recovery_user_id');
    const storedUsername = sessionStorage.getItem('recovery_user_username');
    if (storedId) {
      setIdUsuario(storedId);
    }
    if (storedUsername) {
      setUsername(storedUsername);
    }
    // Nota: Si este componente también se usará para usuarios logueados que deben cambiar clave,
    // se debería sacar el idUsuario del hook useAuth().
  }, []);

  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$+%^&*(),.?":{}|<>_\-=\[\]`~;'/\\¿¡]/.test(password),
    noSpaces: password.length > 0 && !/\s/.test(password),
  };

  const isPasswordValid = Object.values(validations).every(Boolean);
  const doPasswordsMatch = password === repeatPassword && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setError('La contraseña no cumple con todos los requisitos.');
      return;
    }
    if (!doPasswordsMatch) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!idUsuario) {
      setError('No se pudo identificar el usuario. Intente solicitar la recuperación nuevamente.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          id_usuario: idUsuario
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Hubo un error al actualizar la contraseña.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      sessionStorage.removeItem('recovery_user_id');
      sessionStorage.removeItem('recovery_user_username');

      // Intentar iniciar sesión automáticamente si tenemos el nombre de usuario
      if (username) {
        try {
          await login({ usuario: username, password, remember: false });
          // El hook de login redirigirá automáticamente a /home
        } catch (loginErr) {
          // Si falla el login automático, redirigir al login
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } else {
        // Redirigir al login si no se pudo hacer login automático
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }

    } catch (err) {
      setError('Error de conexión al servidor.');
      setLoading(false);
    }
  };

  const ValidationItem = ({ isValid, text }) => (
    <ListItem sx={{ py: 0, px: 1 }}>
      <ListItemIcon sx={{ minWidth: 32 }}>
        {isValid ? (
          <CheckCircleIcon color="success" fontSize="small" />
        ) : (
          <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={text}
        primaryTypographyProps={{
          variant: 'caption',
          color: isValid ? 'text.primary' : 'text.secondary'
        }}
      />
    </ListItem>
  );

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'background.default' }}>
        <Paper elevation={3} sx={{ p: 5, maxWidth: 450, textAlign: 'center', borderRadius: 3 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            Contraseña Actualizada
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Su contraseña ha sido modificada satisfactoriamente. Iniciando sesión...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'background.default' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 3 }}>
        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
          Cambiar Contraseña
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Por favor, defina una nueva contraseña segura para su cuenta.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Nueva Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            disabled={loading}
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Repetir Nueva Contraseña"
            type={showRepeatPassword ? 'text' : 'password'}
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            fullWidth
            required
            disabled={loading || !isPasswordValid}
            error={repeatPassword.length > 0 && !doPasswordsMatch}
            helperText={repeatPassword.length > 0 && !doPasswordsMatch ? "Las contraseñas no coinciden" : ""}
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowRepeatPassword(!showRepeatPassword)} edge="end" disabled={!isPasswordValid}>
                      {showRepeatPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1, mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', px: 1 }}>
              Requisitos de la contraseña:
            </Typography>
            <List dense disablePadding>
              <ValidationItem isValid={validations.length} text="Mínimo 8 caracteres" />
              <ValidationItem isValid={validations.uppercase} text="Al menos una letra mayúscula" />
              <ValidationItem isValid={validations.lowercase} text="Al menos una letra minúscula" />
              <ValidationItem isValid={validations.number} text="Al menos un número" />
              <ValidationItem isValid={validations.special} text="Al menos un carácter especial (!@#$%)" />
              <ValidationItem isValid={validations.noSpaces} text="Sin espacios en blanco" />
            </List>
          </Box>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !isPasswordValid || !doPasswordsMatch}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Cambiar Contraseña'}
          </Button>

          <Button
            variant="text"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => router.push('/login')}
            disabled={loading}
          >
            Volver al Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}