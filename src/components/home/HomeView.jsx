import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import WelcomeCard from './WelcomeCard';
import QuickActions from './QuickActions';
import BirthdaySection from './BirthdaySection';
import InstitutionalVideo from './InstitutionalVideo';
import PresidentMessage from './PresidentMessage';
import CompanyInfo from './CompanyInfo';
import TrmMiniWidget from '../dashboard/TrmMiniWidget';

/**
 * src/components/home/HomeView.jsx
 *
 * Componente principal del Home. Server Component: no usa hooks ni
 * APIs de navegador directamente, solo compone client components
 * que sí los necesitan (WelcomeCard, BirthdaySection).
 *
 * Jerarquía: bienvenida y TRM → acciones frecuentes + cumpleaños →
 * contenido institucional (video + carta) → información corporativa.
 */
export default function HomeView() {
  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Stack spacing={4}>
        {/* BIENVENIDA Y TRM */}
        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 8, lg: 9 }}>
            <WelcomeCard />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <TrmMiniWidget />
          </Grid>
        </Grid>

        {/* ACCIONES + CUMPLEAÑOS */}
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <QuickActions />
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <BirthdaySection />
          </Grid>
        </Grid>

        {/* CONTENIDO INSTITUCIONAL */}
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 1, fontWeight: 700 }}
          >
            Contenido institucional
          </Typography>

          <Grid container spacing={3} sx={{ alignItems: 'stretch', mt: 0.5 }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <InstitutionalVideo />
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <PresidentMessage />
            </Grid>
          </Grid>
        </Box>

        {/* INFORMACIÓN CORPORATIVA */}
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 1, fontWeight: 700 }}
          >
            Información corporativa
          </Typography>

          <Box sx={{ mt: 0.5 }}>
            <CompanyInfo />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}