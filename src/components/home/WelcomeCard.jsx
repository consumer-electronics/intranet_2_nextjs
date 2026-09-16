'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import WavingHandIcon from '@mui/icons-material/WavingHand';

import { useAuth } from '@/hooks/useAuth';

const WEEKDAYS = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado',
];

/**
 * src/components/home/WelcomeCard.jsx
 * Saludo de bienvenida con el nombre del usuario autenticado.
 * El margen inferior ahora lo controla el Stack de HomeView, no el
 * propio componente, para que el espaciado sea consistente en todo
 * el Home.
 */
export default function WelcomeCard() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: false });

  const today = new Date();
  const weekday = WEEKDAYS[today.getDay()];
  const day = today.getDate();
  const hora = today.getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}
    >
      <CardContent sx={{ py: { xs: 2.5, md: 3 } }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              flexShrink: 0,
            }}
          >
            <WavingHandIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            {loading ? (
              <Skeleton width={220} height={32} />
            ) : (
              <Typography variant="h5" fontWeight={700} noWrap>
                {saludo}{user.name ? `, ${user.name}` : ''}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Hoy es {weekday} {day} · Bienvenido a la intranet de Consumer Electronics Group SAS.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}