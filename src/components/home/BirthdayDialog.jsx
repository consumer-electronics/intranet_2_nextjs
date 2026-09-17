'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const STORAGE_URL =
    process.env.NEXT_PUBLIC_STORAGE_URL || '';

const FALLBACK_PHOTO =
    `${STORAGE_URL}foto-usuario/0.png`;

function getPhotoUrl(photo) {
    if (!photo) {
        return FALLBACK_PHOTO;
    }

    if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo;
    }

    return `${STORAGE_URL}${photo}`;
}

export default function BirthdayDialog({
    open,
    onClose,
    birthdays = [],
    month,
}) {
    const today = new Date().getDate();

    // Ordenar: los que cumplen hoy van primero
    const sortedBirthdays = [...birthdays].sort((a, b) => {
        const isAToday = Number(a.birthday) === today;
        const isBToday = Number(b.birthday) === today;

        if (isAToday && !isBToday) return -1;
        if (!isAToday && isBToday) return 1;
        return 0; // Conserva el orden original para el resto
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                <Stack spacing={0.5}>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        Cumpleaños
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Cumpleaños de {month}
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <List disablePadding>
                    {sortedBirthdays.map((birthday) => {
                        const isToday =
                            Number(birthday.birthday) === today;

                        return (
                            <ListItem
                                key={`${birthday.name}-${birthday.birthday}`}
                                sx={{
                                    borderRadius: 2,
                                    mb: 0.5,
                                    bgcolor: isToday
                                        ? 'action.hover'
                                        : 'transparent',
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        src={getPhotoUrl(
                                            birthday.photo
                                        )}
                                        alt={birthday.name}
                                    />
                                </ListItemAvatar>

                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body2"
                                            fontWeight={
                                                isToday
                                                    ? 700
                                                    : 600
                                            }
                                        >
                                            {birthday.name}
                                        </Typography>
                                    }
                                    secondary={
                                        birthday.process
                                    }
                                />

                                <Chip
                                    size="small"
                                    label={
                                        isToday
                                            ? 'Hoy'
                                            : `${birthday.birthday} de ${month}`
                                    }
                                    color={
                                        isToday
                                            ? 'primary'
                                            : 'default'
                                    }
                                    variant={
                                        isToday
                                            ? 'filled'
                                            : 'outlined'
                                    }
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}