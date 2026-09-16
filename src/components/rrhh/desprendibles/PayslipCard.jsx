'use client';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function PayslipCard({ file, isLatest, onSelect }) {
    return (
        <Card variant="outlined">
            <CardActionArea onClick={onSelect} sx={{ px: 2, py: 1.5 }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <PictureAsPdfIcon color="error" />
                        <Typography>{file.doc}</Typography>
                        {isLatest && <Chip label="Último" size="small" color="primary" />}
                    </Stack>
                    <Typography color="text.secondary" variant="body2">
                        {file.date}
                    </Typography>
                </Stack>
            </CardActionArea>
        </Card>
    );
}