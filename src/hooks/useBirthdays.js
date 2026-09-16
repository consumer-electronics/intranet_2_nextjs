'use client';

import { useCallback, useEffect, useState } from 'react';
import { getBirthdays } from '@/api/home';

export function useBirthdays() {
    const [birthdays, setBirthdays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadBirthdays = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getBirthdays();

            /*
             * Dynamics devuelve:
             *
             * {
             *   success: true,
             *   data: [...]
             * }
             */

            if (!response?.success) {
                throw new Error(
                    response?.msj || 'No se pudieron obtener los cumpleaños'
                );
            }

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            const sorted = [...data].sort(
                (a, b) => Number(a.birthday) - Number(b.birthday)
            );

            setBirthdays(sorted);
        } catch (err) {
            console.error('[useBirthdays] Error:', err);

            setBirthdays([]);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBirthdays();
    }, [loadBirthdays]);

    return {
        birthdays,
        loading,
        error,
        reload: loadBirthdays,
    };
}