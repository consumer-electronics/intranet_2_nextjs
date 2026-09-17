'use client'
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Link from 'next/link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import EventNoteIcon from '@mui/icons-material/EventNoteOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined';
import HelpIcon from '@mui/icons-material/HelpOutlineOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';

import SectionCard from './SectionCard';

/**
 * src/components/home/QuickActions.jsx
 *
 * Accesos rápidos a los módulos de RRHH más usados (mismos href/
 * iconos de antes, no se agregan accesos nuevos). Ahora vive dentro
 * de SectionCard para tener el mismo peso visual que BirthdaySection
 * en la fila de 2 columnas del Home.
 */
const actions = [
  { label: 'Solicitudes', href: '/rrhh/solicitudes', icon: EventNoteIcon },
  { label: 'Certificado laboral', href: '/rrhh/certificado-laboral', icon: DescriptionIcon },
  { label: 'Desprendibles de nómina', href: '/rrhh/desprendibles', icon: ReceiptLongIcon },
  { label: 'Ayuda', href: '/ayuda', icon: HelpIcon },
];

export default function QuickActions() {
  return (
    <SectionCard
      icon={GridViewRoundedIcon}
      title="Accesos rápidos"
      subtitle="Trámites y consultas frecuentes de RRHH"
    >
      <Stack spacing={1}>
        {actions.map(({ label, href, icon: Icon }) => (
          <ButtonBase
            key={href}
            component={Link}
            href={href}
            focusRipple
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              width: '100%',
              px: 2,
              py: 1.5,
              borderRadius: 2,
              justifyContent: 'flex-start',
              color: 'text.primary',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.50',
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              <Icon fontSize="small" />
            </Box>

            <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
              {label}
            </Typography>

            <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
          </ButtonBase>
        ))}
      </Stack>
    </SectionCard>
  );
}