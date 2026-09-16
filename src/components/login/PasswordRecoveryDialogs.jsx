import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function PasswordRecoveryDialogs({ open, onClose }) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = User input, 2 = Code input
  
  const [userData, setUserData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [idUsuario, setIdUsuario] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState('');

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleClose = () => {
    setStep(1);
    setUserData('');
    setError('');
    setSuccessMsg('');
    setIdUsuario(null);
    setMaskedEmail('');
    setOtp(['', '', '', '', '', '']);
    onClose();
  };

  const handleSendUser = async (e) => {
    e.preventDefault();
    if (!userData.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/password-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifyUser',
          userDataToSearch: userData
        })
      });

      const data = await response.json();

      if (!response.ok || data.success === 0) {
        setError('No se ha encontrado el usuario o no tiene un correo asociado.');
        setLoading(false);
        return;
      }

      // Success
      setIdUsuario(data.fun_fk);
      
      // Enmascarar correo
      const correo = data.correo || '';
      const parts = correo.split('@');
      if (parts.length === 2) {
        const username = parts[0];
        const domain = parts[1];
        let masked = username;
        if (username.length > 4) {
          masked = username.slice(0, 2) + '*'.repeat(username.length - 4) + username.slice(-2);
        } else if (username.length > 2) {
          masked = username.slice(0, 1) + '*'.repeat(username.length - 2) + username.slice(-1);
        }
        setMaskedEmail(`${masked}@${domain}`);
      } else {
        setMaskedEmail('*****@****.***');
      }

      setStep(2);
      setSuccessMsg('Código enviado exitosamente.');
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(value.length - 1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const codigoVerificado = otp.join('');
    if (codigoVerificado.length < 6) {
      setError('Por favor, ingrese el código completo de 6 dígitos.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/password-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifyCode',
          codigoVerificado,
          id_usuario: idUsuario
        })
      });

      const data = await response.json();

      if (!response.ok || data.success === 0) {
        setError('El código ingresado es incorrecto o ha expirado.');
        setLoading(false);
        return;
      }

      // Guardar id_usuario en un sessionStorage temporal para el cambio de clave
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('recovery_user_id', idUsuario);
        if (data.usuario) {
          sessionStorage.setItem('recovery_user_username', data.usuario);
        }
      }
      
      handleClose();
      // Redirigir a change-password
      router.push('/login/change-password');
      
    } catch (err) {
      setError('Error de conexión al validar código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open && step === 1} onClose={!loading ? handleClose : undefined} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Recuperar Contraseña</DialogTitle>
        <Box component="form" onSubmit={handleSendUser}>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Ingresa tu usuario o número de documento de identidad, y te enviaremos un correo a la <b>dirección asociada a tu cuenta</b> con las instrucciones para restablecer tu contraseña.
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
              fullWidth
              autoFocus
              label="Nombre de usuario o número de identidad"
              variant="outlined"
              value={userData}
              onChange={(e) => setUserData(e.target.value)}
              disabled={loading}
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={open && step === 2} onClose={!loading ? handleClose : undefined} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Código de Recuperación</DialogTitle>
        <Box component="form" onSubmit={handleVerifyCode}>
          <DialogContent>
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg} <b>{maskedEmail}</b></Alert>}
            
            <Typography variant="body2" sx={{ mb: 3 }}>
              Por favor, ingresa el código de recuperación que te hemos enviado por correo.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
              {otp.map((digit, idx) => (
                <TextField
                  key={idx}
                  inputRef={(el) => (inputRefs.current[idx] = el)}
                  variant="outlined"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', padding: '10px 0' },
                  }}
                  sx={{ width: '45px' }}
                  disabled={loading}
                  required
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verificar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
