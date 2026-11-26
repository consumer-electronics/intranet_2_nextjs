// src/lib/biometricoFormat.js

/**
 * Convierte 'HH:mm:ss' (24h) a 'hh:mm:ss am/pm' (12h),
 * equivalente al formato `h:i:s a` usado en la vista biométrico.
 */
export function formatTime12h(timeStr) {
    if (!timeStr) return '';
    const parts = String(timeStr).trim().split(':');
    if (parts.length < 2) return timeStr;

    const hour24 = parseInt(parts[0], 10);
    const min = parts[1] || '00';
    const sec = parts[2] || '00';

    if (isNaN(hour24)) return timeStr;

    const ampm = hour24 >= 12 ? 'pm' : 'am';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const hourStr = String(hour12).padStart(2, '0');

    return `${hourStr}:${min}:${sec} ${ampm}`;
}

/**
 * Convierte 'YYYY-MM-DD' a 'DD/MM/YYYY'.
 */
export function formatDateDDMMYYYY(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = String(dateStr).trim().split('-');
    if (!y || !m || !d) return dateStr;
    return `${d}/${m}/${y}`;
}

/**
 * Retorna la fecha actual en Colombia (America/Bogota) en formato 'YYYY-MM-DD'.
 */
export function getTodayBogota() {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());
}

