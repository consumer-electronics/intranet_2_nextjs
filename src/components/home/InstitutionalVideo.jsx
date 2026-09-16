// InstitutionalVideo.jsx
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function InstitutionalVideo() {
    return (
        <Card
            sx={{
                height: '100%',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    bgcolor: 'common.black',
                }}
            >
                <Box
                    component="video"
                    controls
                    preload="metadata"
                    poster="/images/tienda.jpg"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                >
                    <source src="https://intranet.appceg.com/videos/VC.mp4" type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                </Box>
            </Box>

            <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                    Video institucional
                </Typography>
            </Box>
        </Card>
    );
}