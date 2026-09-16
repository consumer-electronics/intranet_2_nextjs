'use client';

import { useMemo, useState } from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import SectionCard from './SectionCard';
import BirthdayCarousel from './BirthdayCarousel';
import BirthdayDialog from './BirthdayDialog';

import { useBirthdays } from '@/hooks/useBirthdays';

const MONTHS = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export default function BirthdaySection() {
    const [dialogOpen, setDialogOpen] = useState(false);

    const { birthdays, loading, error } = useBirthdays();

    const currentMonth = useMemo(() => MONTHS[new Date().getMonth()], []);

    if (!loading && !error && birthdays.length === 0) {
        return null;
    }

    return (
        <>
            <SectionCard
                icon={CakeOutlinedIcon}
                title="Cumpleaños"
                subtitle={`Celebraciones de ${currentMonth}`}
                action={
                    !loading && birthdays.length > 0 ? (
                        <Button
                            variant="text"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => setDialogOpen(true)}
                        >
                            Ver todos
                        </Button>
                    ) : null
                }
            >
                <BirthdayCarousel birthdays={birthdays} loading={loading} />

                {error && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        No fue posible cargar los cumpleaños.
                    </Typography>
                )}
            </SectionCard>

            <BirthdayDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                birthdays={birthdays}
                month={currentMonth}
            />
        </>
    );
}