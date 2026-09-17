'use client';

import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';

/**
 * Componente de tarjeta para documentos, carpetas y mapas de proceso.
 *
 * Movido desde components/sig/common/SigDocumentCard.jsx
 * — eliminado el prefijo "Sig" para hacerlo globalmente reutilizable.
 *
 * Props:
 * - item     {object}    Objeto de documento/carpeta con id, label, type, description, category.
 * - onSelect {function}  Callback cuando el usuario hace clic en la tarjeta.
 */
function getIconForItemType(type) {
    switch (type) {
        case 'folder':
            return FolderOutlinedIcon;
        case 'process_map':
            return AccountTreeOutlinedIcon;
        case 'document':
        default:
            return DescriptionOutlinedIcon;
    }
}

function getIconBgColor(type) {
    switch (type) {
        case 'folder':
            return 'warning.main';
        case 'process_map':
            return 'secondary.main';
        case 'document':
        default:
            return 'primary.main';
    }
}

function getActionLabel(type) {
    switch (type) {
        case 'folder':
            return 'Explorar carpeta';
        case 'process_map':
            return 'Ver mapa interactivo';
        default:
            return 'Ver documento';
    }
}

export default function DocumentCard({ item, onSelect }) {
    const IconComponent = getIconForItemType(item.type);

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.shadows[3],
                    borderColor: 'primary.main',
                },
            }}
        >
            <CardActionArea onClick={() => onSelect(item)} sx={{ height: '100%' }}>
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: 2,
                    }}
                >
                    <CardContent sx={{ p: 0, width: '100%' }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    bgcolor: getIconBgColor(item.type),
                                    color: 'primary.contrastText',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <IconComponent fontSize="medium" />
                            </Box>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography
                                    variant="subtitle1"
                                    component="h3"
                                    sx={{ fontWeight: 600, lineHeight: 1.3, color: 'text.primary' }}
                                >
                                    {item.label}
                                </Typography>
                                {item.category && (
                                    <Chip
                                        label={item.category}
                                        size="small"
                                        variant="outlined"
                                        sx={{ mt: 0.75, height: 20, fontSize: '0.7rem' }}
                                    />
                                )}
                            </Box>
                        </Stack>

                        {item.description && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {item.description}
                            </Typography>
                        )}
                    </CardContent>

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{
                            alignItems: 'center',
                            mt: 2,
                            pt: 1,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            width: '100%',
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {getActionLabel(item.type)}
                        </Typography>
                        <OpenInNewIcon fontSize="small" color="primary" />
                    </Stack>
                </Box>
            </CardActionArea>
        </Card>
    );
}
