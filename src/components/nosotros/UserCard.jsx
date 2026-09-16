'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

function getInitials(fullName = '') {
    const parts = fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return 'U';
    }

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(
        0
    )}`.toUpperCase();
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

    return `${cleanBaseUrl}foto-usuario/0.png`;
}

export default function UserCard({
    user,
    storageUrl,
    viewMode = 'grid',
    onSelectUser,
}) {
    const [imgError, setImgError] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

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

    const initials = getInitials(fullName);
    const avatarBg = stringToColor(fullName);

    const photoUrl = getPhotoUrl(
        user,
        storageUrl
    );

    const handleCopyEmail = async (event) => {
        event.stopPropagation();

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

    const handleSelectUser = () => {
        onSelectUser?.(user);
    };

    if (viewMode === 'list') {
        return (
            <Card
                elevation={0}
                sx={{
                    width: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 2,
                    },
                }}
            >
                <CardContent
                    sx={{
                        p: {
                            xs: 1.5,
                            sm: 2,
                        },
                        '&:last-child': {
                            pb: {
                                xs: 1.5,
                                sm: 2,
                            },
                        },
                    }}
                >
                    <Stack
                        direction={{
                            xs: 'column',
                            md: 'row',
                        }}
                        spacing={{
                            xs: 1.5,
                            md: 2,
                        }}
                        alignItems={{
                            xs: 'stretch',
                            md: 'center',
                        }}
                    >
                        {/* Usuario */}
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            sx={{
                                minWidth: 0,
                                flex: 1,
                            }}
                        >
                            <Avatar
                                src={
                                    !imgError
                                        ? photoUrl
                                        : undefined
                                }
                                alt={fullName}
                                onError={() =>
                                    setImgError(true)
                                }
                                sx={{
                                    width: {
                                        xs: 44,
                                        sm: 48,
                                    },
                                    height: {
                                        xs: 44,
                                        sm: 48,
                                    },
                                    bgcolor: avatarBg,
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    border: '2px solid',
                                    borderColor: 'divider',
                                    flexShrink: 0,
                                }}
                            >
                                {initials}
                            </Avatar>

                            <Box
                                sx={{
                                    minWidth: 0,
                                    flex: 1,
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={700}
                                    noWrap
                                >
                                    {fullName}
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    flexWrap="wrap"
                                    useFlexGap
                                >
                                    <Chip
                                        label={cargo}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{
                                            height: 23,
                                            maxWidth: '100%',
                                            fontSize:
                                                '0.72rem',
                                            fontWeight: 600,
                                            '& .MuiChip-label':
                                            {
                                                overflow:
                                                    'hidden',
                                                textOverflow:
                                                    'ellipsis',
                                            },
                                        }}
                                    />

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        noWrap
                                        sx={{
                                            maxWidth: {
                                                xs: 180,
                                                sm: 300,
                                            },
                                        }}
                                    >
                                        • {dependencia}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>

                        {/* Información y acción */}
                        <Stack
                            direction={{
                                xs: 'column',
                                sm: 'row',
                            }}
                            spacing={1}
                            alignItems={{
                                xs: 'stretch',
                                sm: 'center',
                            }}
                            sx={{
                                flexShrink: 0,
                            }}
                        >
                            {correo && (
                                <Tooltip
                                    title={
                                        copiedEmail
                                            ? '¡Correo copiado!'
                                            : correo
                                    }
                                >
                                    <Chip
                                        icon={
                                            copiedEmail ? (
                                                <CheckIcon
                                                    color="success"
                                                    sx={{
                                                        fontSize:
                                                            '0.9rem !important',
                                                    }}
                                                />
                                            ) : (
                                                <EmailOutlinedIcon
                                                    sx={{
                                                        fontSize:
                                                            '0.9rem !important',
                                                    }}
                                                />
                                            )
                                        }
                                        label={correo}
                                        size="small"
                                        onClick={
                                            handleCopyEmail
                                        }
                                        clickable
                                        variant="filled"
                                        sx={{
                                            maxWidth: {
                                                xs: '100%',
                                                sm: 230,
                                            },
                                            bgcolor:
                                                'action.hover',
                                            '& .MuiChip-label':
                                            {
                                                overflow:
                                                    'hidden',
                                                textOverflow:
                                                    'ellipsis',
                                            },
                                        }}
                                    />
                                </Tooltip>
                            )}

                            {telefono && (
                                <Chip
                                    icon={
                                        <PhoneOutlinedIcon
                                            sx={{
                                                fontSize:
                                                    '0.9rem !important',
                                            }}
                                        />
                                    }
                                    label={`Ext. ${telefono}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        width: {
                                            xs: '100%',
                                            sm: 'auto',
                                        },
                                    }}
                                />
                            )}

                            <Button
                                size="small"
                                variant="text"
                                onClick={handleSelectUser}
                                startIcon={
                                    <VisibilityOutlinedIcon />
                                }
                                sx={{
                                    minWidth: {
                                        xs: '100%',
                                        sm: 'auto',
                                    },
                                }}
                            >
                                Ver
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            elevation={0}
            sx={{
                width: '100%',
                height: '100%',
                minHeight: {
                    xs: 345,
                    sm: 355,
                    md: 365,
                },
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                transition:
                    'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                    transform: {
                        xs: 'none',
                        sm: 'translateY(-3px)',
                    },
                    boxShadow: {
                        xs: 1,
                        sm: 3,
                    },
                    borderColor: 'primary.main',
                },
            }}
        >
            {/* Decoración superior */}
            <Box
                sx={{
                    height: {
                        xs: 48,
                        sm: 52,
                        md: 56,
                    },
                    flexShrink: 0,
                    bgcolor: 'primary.main',
                    opacity: 0.08,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            />

            <CardContent
                sx={{
                    pt: 0,
                    px: {
                        xs: 2,
                        sm: 2.5,
                    },
                    pb: {
                        xs: 2,
                        sm: 2.5,
                    },
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    '&:last-child': {
                        pb: {
                            xs: 2,
                            sm: 2.5,
                        },
                    },
                }}
            >
                {/* Identidad */}
                <Stack
                    alignItems="center"
                    sx={{
                        mt: {
                            xs: -3.25,
                            sm: -3.5,
                        },
                        flexShrink: 0,
                    }}
                >
                    <Avatar
                        src={
                            !imgError
                                ? photoUrl
                                : undefined
                        }
                        alt={fullName}
                        onError={() =>
                            setImgError(true)
                        }
                        sx={{
                            width: {
                                xs: 68,
                                sm: 72,
                                md: 76,
                            },
                            height: {
                                xs: 68,
                                sm: 72,
                                md: 76,
                            },
                            bgcolor: avatarBg,
                            fontWeight: 700,
                            fontSize: {
                                xs: '1.3rem',
                                sm: '1.45rem',
                            },
                            border: '4px solid',
                            borderColor:
                                'background.paper',
                            boxShadow: 2,
                        }}
                    >
                        {initials}
                    </Avatar>

                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        textAlign="center"
                        sx={{
                            mt: 1.5,
                            width: '100%',
                            minHeight: {
                                xs: 42,
                                sm: 44,
                            },
                            lineHeight: 1.35,
                            display:
                                '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient:
                                'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {fullName}
                    </Typography>

                    <Chip
                        label={cargo}
                        size="small"
                        color="primary"
                        sx={{
                            mt: 1,
                            maxWidth: '90%',
                            minHeight: 24,
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow:
                                    'ellipsis',
                                whiteSpace:
                                    'nowrap',
                            },
                        }}
                    />
                </Stack>

                {/* Información */}
                <Stack
                    spacing={1}
                    sx={{
                        mt: 'auto',
                        pt: 1.5,
                        borderTop: '1px dashed',
                        borderColor: 'divider',
                        minHeight: {
                            xs: 105,
                            sm: 110,
                        },
                    }}
                >
                    <InfoRow
                        icon={<BusinessOutlinedIcon />}
                        value={dependencia}
                    />

                    {correo ? (
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ minWidth: 0 }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexShrink: 0,
                                    color: 'text.secondary',
                                }}
                            >
                                <EmailOutlinedIcon fontSize="small" />
                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
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
                    ) : (
                        <Box sx={{ height: 32 }} />
                    )}

                    {telefono ? (
                        <InfoRow
                            icon={<PhoneOutlinedIcon />}
                            value={`Ext. ${telefono}`}
                        />
                    ) : (
                        <Box sx={{ height: 24 }} />
                    )}
                </Stack>

                {/* Acción */}
                <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={handleSelectUser}
                    startIcon={
                        <VisibilityOutlinedIcon />
                    }
                    sx={{
                        mt: 2,
                        borderRadius: 2,
                        flexShrink: 0,
                    }}
                >
                    Ver detalle
                </Button>
            </CardContent>
        </Card>
    );
}

function InfoRow({ icon, value }) {
    return (
        <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ minWidth: 0 }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexShrink: 0,
                    color: 'text.secondary',
                }}
            >
                {icon}
            </Box>

            <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{
                    minWidth: 0,
                    flex: 1,
                }}
            >
                {value}
            </Typography>
        </Stack>
    );
}