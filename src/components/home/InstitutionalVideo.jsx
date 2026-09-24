// src/components/home/InstitutionalVideo.jsx
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function InstitutionalVideo() {
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
                bgcolor: 'common.black',
            }}
        >
            {/* Video a pantalla completa dentro de la tarjeta */}
            <Box
                component="video"
                controls
                preload="metadata"
                poster="/images/tienda.jpg"
                sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                }}
            >
                <source src="https://intranet.appceg.com/videos/VC.mp4" type="video/mp4" />
                Tu navegador no soporta el elemento de video.
            </Box>

            {/* Degradado superior para legibilidad del título */}
            <Box
                aria-hidden="true"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 100,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 100%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Título anclado en la parte superior */}
            <Box
                sx={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    p: { xs: 2.5, md: 3 },
                    pointerEvents: 'none',
                }}
            >
                <Typography variant="h6" fontWeight={700} sx={{ color: 'common.white' }}>
                    Video institucional
                </Typography>
            </Box>
        </Card>
    );
}