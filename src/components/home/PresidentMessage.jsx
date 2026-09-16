// PresidentMessage.jsx
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function PresidentMessage() {
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
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'minmax(150px, 35%) 1fr' },
                    height: '100%',
                }}
            >
                <Box
                    component="img"
                    src="/images/_JUL5446.jpg"
                    alt="Carta del presidente"
                    sx={{
                        width: '100%',
                        height: { xs: 280, sm: '100%' },
                        objectFit: 'cover',
                    }}
                />

                <CardContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        p: { xs: 2, md: 3 },
                    }}
                >
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Carta del presidente
                    </Typography>

                    <Typography variant="body1" color="text.secondary">
                        Próximamente.
                    </Typography>
                </CardContent>
            </Box>
        </Card>
    );
}