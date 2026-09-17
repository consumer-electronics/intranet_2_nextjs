'use client';

import { useEffect, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

function getInitials(nombre = '', apellido = '') {
    const firstName = nombre.trim().charAt(0);
    const lastName = apellido.trim().charAt(0);

    return (
        `${firstName}${lastName}`.toUpperCase() ||
        'U'
    );
}

function stringToColor(value = '') {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash =
            value.charCodeAt(index) +
            ((hash << 5) - hash);
    }

    let color = '#';

    for (let index = 0; index < 3; index += 1) {
        const component =
            (hash >> (index * 8)) & 0xff;

        color += `00${component
            .toString(16)
            .slice(-2)}`;
    }

    return color;
}

function getFullName(user) {
    return (
        user.fun_nombre_completo ||
        [
            user.fun_nombre,
            user.fun_nombre2,
            user.fun_apellido,
            user.fun_apellido2,
        ]
            .filter(Boolean)
            .join(' ') ||
        'Colaborador'
    );
}

function getPhotoUrl(user, storageUrl) {
    const baseUrl =
        storageUrl ||
        process.env.NEXT_PUBLIC_STORAGE_URL ||
        '';

    const cleanBaseUrl = baseUrl.replace(/\/?$/, '/');

    if (user.fun_foto) {
        return user.fun_foto.startsWith('http')
            ? user.fun_foto
            : `${cleanBaseUrl}${user.fun_foto.replace(
                /^\//,
                ''
            )}`;
    }

    if (user.fun_usuario) {
        return `${cleanBaseUrl}foto-usuario/${user.fun_usuario}.png`;
    }

    return null;
}

export default function UserDetailModal({
    user,
    storageUrl,
    open,
    onClose,
}) {
    const [imgError, setImgError] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    useEffect(() => {
        if (!open) {
            setImgError(false);
            setCopiedEmail(false);
        }
    }, [open, user]);

    if (!user) {
        return null;
    }

    const fullName = getFullName(user);

    const cargo =
        user.car_tag ||
        user.car_nombre ||
        'Colaborador';

    const dependencia =
        user.dep_tag ||
        'Sin dependencia asignada';

    const correo = user.fun_correo;

    const telefono =
        user.fun_extension ||
        user.fun_telefono ||
        user.extension_numero;

    const usuario = user.fun_usuario;

    const initials = getInitials(
        user.fun_nombre,
        user.fun_apellido
    );

    const avatarBg = stringToColor(fullName);

    const photoUrl = getPhotoUrl(
        user,
        storageUrl
    );

    const handleCopyEmail = async () => {
        if (!correo) {
            return;
        }

        try {
            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {
                await navigator.clipboard.writeText(
                    correo
                );

                setCopiedEmail(true);

                window.setTimeout(() => {
                    setCopiedEmail(false);
                }, 2000);
            }
        } catch {
            setCopiedEmail(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            scroll="paper"
            PaperProps={{
                sx: {
                    width: '100%',
                    m: {
                        xs: 1.5,
                        sm: 2,
                    },
                    borderRadius: {
                        xs: 2.5,
                        sm: 3,
                    },
                    position: 'relative',
                    overflow: 'hidden',
                },
            }}
        >
            {/* Botón de cerrar (X negra) */}
            <IconButton
                onClick={onClose}
                aria-label="Cerrar detalle"
                sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    color: 'text.primary',
                    zIndex: 1,
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent
                sx={{
                    pt: {
                        xs: 3,
                        sm: 4,
                    },
                    px: {
                        xs: 2,
                        sm: 3,
                    },
                    pb: 2.5,
                }}
            >
                {/* Identidad */}
                <Stack alignItems="center">
                    <Avatar
                        src={
                            !imgError && photoUrl
                                ? photoUrl
                                : undefined
                        }
                        alt={fullName}
                        onError={() =>
                            setImgError(true)
                        }
                        sx={{
                            width: {
                                xs: 84,
                                sm: 96,
                            },
                            height: {
                                xs: 84,
                                sm: 96,
                            },
                            bgcolor: avatarBg,
                            fontWeight: 700,
                            fontSize: {
                                xs: '1.75rem',
                                sm: '2rem',
                            },
                            boxShadow: 2,
                        }}
                    >
                        {initials}
                    </Avatar>

                    <Typography
                        variant="h6"
                        fontWeight={700}
                        textAlign="center"
                        sx={{
                            mt: 1.5,
                            lineHeight: 1.3,
                            maxWidth: '100%',
                        }}
                    >
                        {fullName}
                    </Typography>

                    <Chip
                        label={cargo}
                        color="primary"
                        size="small"
                        sx={{
                            mt: 1,
                            maxWidth: '100%',
                            fontWeight: 600,
                            '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow:
                                    'ellipsis',
                            },
                        }}
                    />
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                {/* Información */}
                <Stack spacing={1.5}>
                    <DetailItem
                        icon={
                            <BusinessOutlinedIcon color="primary" />
                        }
                        label="Dependencia / Área"
                        value={dependencia}
                    />

                    {correo && (
                        <DetailItem
                            icon={
                                <EmailOutlinedIcon color="primary" />
                            }
                            label="Correo electrónico"
                            value={
                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="center"
                                    sx={{
                                        minWidth: 0,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        color="text.primary"
                                        sx={{
                                            minWidth: 0,
                                            flex: 1,
                                            overflow:
                                                'hidden',
                                            textOverflow:
                                                'ellipsis',
                                            whiteSpace:
                                                'nowrap',
                                        }}
                                    >
                                        {correo}
                                    </Typography>

                                    <IconButton
                                        size="small"
                                        onClick={
                                            handleCopyEmail
                                        }
                                        title={
                                            copiedEmail
                                                ? 'Correo copiado'
                                                : 'Copiar correo'
                                        }
                                        aria-label={
                                            copiedEmail
                                                ? 'Correo copiado'
                                                : 'Copiar correo'
                                        }
                                        sx={{
                                            flexShrink: 0,
                                        }}
                                    >
                                        {copiedEmail ? (
                                            <CheckIcon
                                                fontSize="small"
                                                color="success"
                                            />
                                        ) : (
                                            <ContentCopyIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                </Stack>
                            }
                        />
                    )}

                    {telefono && (
                        <DetailItem
                            icon={
                                <PhoneOutlinedIcon color="primary" />
                            }
                            label="Extensión / Teléfono"
                            value={`Ext. ${telefono}`}
                        />
                    )}

                    {usuario && (
                        <DetailItem
                            icon={
                                <AccountCircleOutlinedIcon color="primary" />
                            }
                            label="Usuario Intranet"
                            value={usuario}
                        />
                    )}
                </Stack>
            </DialogContent>

            <DialogActions
                sx={{
                    px: {
                        xs: 2,
                        sm: 3,
                    },
                    pb: {
                        xs: 2,
                        sm: 2.5,
                    },
                    pt: 0,
                }}
            >
                {correo && (
                    <Button
                        component="a"
                        href={`mailto:${correo}`}
                        variant="contained"
                        fullWidth
                        startIcon={
                            <EmailOutlinedIcon />
                        }
                        sx={{
                            borderRadius: 2,
                        }}
                    >
                        Enviar correo
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

function DetailItem({
    icon,
    label,
    value,
}) {
    return (
        <Box
            sx={{
                p: {
                    xs: 1.25,
                    sm: 1.5,
                },
                borderRadius: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
            >
                <Box
                    sx={{
                        p: 0.9,
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: 1,
                    }}
                >
                    {icon}
                </Box>

                <Box
                    sx={{
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mb: 0.25 }}
                    >
                        {label}
                    </Typography>

                    {typeof value === 'string' ? (
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                            sx={{
                                overflow: 'hidden',
                                textOverflow:
                                    'ellipsis',
                                whiteSpace:
                                    'nowrap',
                            }}
                        >
                            {value}
                        </Typography>
                    ) : (
                        value
                    )}
                </Box>
            </Stack>
        </Box>
    );
}