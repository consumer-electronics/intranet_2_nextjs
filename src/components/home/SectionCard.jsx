'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * src/components/home/SectionCard.jsx
 *
 * Contenedor visual reutilizable para las secciones del Home
 * (Accesos rápidos, Cumpleaños, etc.). Unifica el "chrome" que
 * antes estaba duplicado entre BirthdaySection y el resto: borde,
 * radio, sombra suave y header con icono + título + subtítulo.
 */
export default function SectionCard({
    icon: Icon,
    title,
    subtitle,
    action,
    children,
    sx,
}) {
    return (
        <Box
            sx={{
                height: '100%',
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                ...sx,
            }}
        >
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                    mb: 3,
                    justifyContent: 'space-between',
                    alignItems: {
                        xs: 'flex-start',
                        sm: 'center',
                    },
                }}
            >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    {Icon && (
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                flexShrink: 0,
                            }}
                        >
                            <Icon />
                        </Box>
                    )}

                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={700} noWrap>
                            {title}
                        </Typography>

                        {subtitle && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                {action}
            </Stack>

            <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
        </Box>
    );
}