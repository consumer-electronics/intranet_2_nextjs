'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import { keyframes } from '@mui/material/styles';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CakeIcon from '@mui/icons-material/Cake';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import CelebrationIcon from '@mui/icons-material/Celebration';

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || '';
const FALLBACK_PHOTO = `${STORAGE_URL}foto-usuario/0.png`;

const MONTHS = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Animación de pulso para resaltar las tarjetas del día de hoy
const celebratePulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

// Animación suave de rebote para el icono festivo
const partyBounce = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-4px) rotate(-8deg);
  }
`;

function getPhotoUrl(photo) {
    if (!photo) return FALLBACK_PHOTO;
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    return `${STORAGE_URL}${photo}`;
}

function BirthdayCard({ birthday }) {
    const today = new Date().getDate();
    const isToday = Number(birthday.birthday) === today;
    const month = MONTHS[new Date().getMonth()];

    return (
        <Box
            sx={{
                minWidth: { xs: 125, sm: 175, md: 185 },
                maxWidth: { xs: 135, sm: 195, md: 205 },
                flex: '0 0 auto',
                scrollSnapAlign: 'start',
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2.5,
                position: 'relative',
                border: '1.5px solid',
                borderColor: isToday ? 'primary.main' : 'divider',
                bgcolor: isToday ? 'primary.50' : 'background.paper',
                animation: isToday ? `${celebratePulse} 2s infinite` : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4,
                },
            }}
        >
            <Stack spacing={{ xs: 1, sm: 1.5 }} sx={{ alignItems: 'center', textAlign: 'center' }}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    badgeContent={
                        isToday ? (
                            <CelebrationIcon
                                color="primary"
                                sx={{
                                    fontSize: 22,
                                    bgcolor: 'background.paper',
                                    borderRadius: '50%',
                                    p: 0.3,
                                    boxShadow: 1,
                                    animation: `${partyBounce} 1.2s infinite ease-in-out`,
                                }}
                            />
                        ) : null
                    }
                >
                    <Avatar
                        src={birthday.photo ? getPhotoUrl(birthday.photo) : undefined}
                        alt={birthday.name}
                        sx={{
                            width: { xs: 52, sm: 64 },
                            height: { xs: 52, sm: 64 },
                            border: isToday ? '2px solid' : 'none',
                            borderColor: 'primary.main',
                        }}
                    />
                </Badge>

                <Box sx={{ minWidth: 0, width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.875rem' } }} noWrap title={birthday.name}>
                        {birthday.name}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }} title={birthday.process}>
                        {birthday.process}
                    </Typography>
                </Box>

                <Chip
                    size="small"
                    icon={isToday ? <CakeIcon /> : <CakeOutlinedIcon />}
                    label={isToday ? '¡Hoy Cumple!' : `${birthday.birthday} de ${month}`}
                    color={isToday ? 'primary' : 'default'}
                    variant={isToday ? 'filled' : 'outlined'}
                    sx={{
                        fontWeight: isToday ? 700 : 400,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        height: { xs: 20, sm: 24 },
                        '& .MuiChip-icon': {
                            fontSize: { xs: '0.875rem', sm: '1.25rem' }
                        }
                    }}
                />
            </Stack>
        </Box>
    );
}

function BirthdaySkeleton() {
    return (
        <Stack direction="row" spacing={2} sx={{ overflow: 'hidden' }}>
            {[1, 2, 3, 4].map((item) => (
                <Box
                    key={item}
                    sx={{
                        minWidth: { xs: 125, sm: 175, md: 185 },
                        maxWidth: { xs: 135, sm: 195, md: 205 },
                        flex: '0 0 auto',
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={{ xs: 1, sm: 1.5 }} sx={{ alignItems: 'center' }}>
                        <Skeleton variant="circular" sx={{ width: { xs: 52, sm: 64 }, height: { xs: 52, sm: 64 } }} />
                        <Skeleton width="80%" height={20} />
                        <Skeleton width="60%" height={16} />
                        <Skeleton variant="rounded" sx={{ width: { xs: 70, sm: 90 }, height: { xs: 20, sm: 24 } }} />
                    </Stack>
                </Box>
            ))}
        </Stack>
    );
}

export default function BirthdayCarousel({ birthdays = [], loading }) {
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [activePage, setActivePage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const today = new Date().getDate();

    // Ordenar los cumpleaños: los que cumplen hoy van al principio
    const sortedBirthdays = useMemo(() => {
        return [...birthdays].sort((a, b) => {
            const isAToday = Number(a.birthday) === today;
            const isBToday = Number(b.birthday) === today;

            if (isAToday && !isBToday) return -1;
            if (!isAToday && isBToday) return 1;
            return 0;
        });
    }, [birthdays, today]);

    const updateScrollState = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const { scrollLeft, scrollWidth, clientWidth } = el;

        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);

        if (clientWidth > 0 && scrollWidth > clientWidth) {
            const pages = Math.ceil((scrollWidth - 10) / clientWidth);
            const currentPage = Math.min(
                Math.max(0, Math.round(scrollLeft / clientWidth)),
                pages - 1
            );
            setTotalPages(pages);
            setActivePage(currentPage);
        } else {
            setTotalPages(1);
            setActivePage(0);
        }
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        updateScrollState();

        const handleScroll = () => updateScrollState();
        el.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            el.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [updateScrollState, sortedBirthdays]);

    if (loading) {
        return <BirthdaySkeleton />;
    }

    if (!sortedBirthdays.length) {
        return (
            <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography color="text.secondary">
                    No hay cumpleaños registrados este mes.
                </Typography>
            </Box>
        );
    }

    const previous = () => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const scrollAmount = el.clientWidth * 0.75;
        el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    };

    const next = () => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const scrollAmount = el.clientWidth * 0.75;
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    const handleDotClick = (index) => {
        const el = scrollContainerRef.current;
        if (!el) return;
        el.scrollTo({ left: index * el.clientWidth * 0.75, behavior: 'smooth' });
    };

    return (
        <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <IconButton
                    onClick={previous}
                    disabled={!canScrollLeft}
                    aria-label="Cumpleaños anteriores"
                    size="small"
                    sx={{ flexShrink: 0 }}
                >
                    <ChevronLeftIcon />
                </IconButton>

                <Box
                    ref={scrollContainerRef}
                    sx={{
                        display: 'flex',
                        gap: { xs: 1, sm: 2 },
                        overflowX: 'auto',
                        flex: 1,
                        py: 1,
                        scrollSnapType: 'x mandatory',
                        scrollBehavior: 'smooth',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}
                >
                    {sortedBirthdays.map((birthday) => (
                        <BirthdayCard
                            key={`${birthday.name}-${birthday.birthday}`}
                            birthday={birthday}
                        />
                    ))}
                </Box>

                <IconButton
                    onClick={next}
                    disabled={!canScrollRight}
                    aria-label="Siguientes cumpleaños"
                    size="small"
                    sx={{ flexShrink: 0 }}
                >
                    <ChevronRightIcon />
                </IconButton>
            </Stack>

            {totalPages > 1 && (
                <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'center', mt: 2 }}>
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <Box
                            key={index}
                            onClick={() => handleDotClick(index)}
                            sx={{
                                width: index === activePage ? 20 : 6,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: index === activePage ? 'primary.main' : 'action.disabled',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: index === activePage ? 'primary.main' : 'text.disabled',
                                },
                            }}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
}