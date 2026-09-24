// src/components/home/PresidentMessage.jsx
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

export default function PresidentMessage() {
    return (
        <Card
            sx={{
                position: 'relative',
                height: '100%',
                minHeight: { xs: 260, sm: 300 },
                overflow: 'hidden',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                '&:hover .president-photo': {
                    transform: 'scale(1.03)',
                },
            }}
        >
            {/* Foto de fondo, ocupa toda la tarjeta */}
            <Box
                component="img"
                className="president-photo"
                src="/images/_JUL5446.jpg"
                alt="Presidente"
                sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 20%',
                    transition: 'transform 0.4s ease',
                }}
            />

            {/* Degradado inferior: solo para que el texto sea legible sobre la foto */}
            <Box
                aria-hidden="true"
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.78) 100%)',
                }}
            />

            {/* Contenido, anclado sobre la foto */}
            <Box
                sx={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    p: { xs: 2.5, md: 3 },
                    gap: 0.5,
                }}
            >

                <Typography variant="h6" fontWeight={700} sx={{ color: 'common.white', mt: 0.5 }}>
                    Presidente
                </Typography>

                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    Consumer Electronics Group
                </Typography>
            </Box>
        </Card>
    );
}