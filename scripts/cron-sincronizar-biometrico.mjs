const intranetUrl = (process.env.INTRANET_URL || '').replace(/\/+$/, '');
const cronSecret = process.env.CRON_BIOMETRIC_SECRET;
const identifiers = (process.env.BIOMETRIC_IDENTIFIERS || '')
    .split(',')
    .map((identifier) => identifier.trim())
    .filter(Boolean);
const lookbackDays = process.env.BIOMETRIC_LOOKBACK_DAYS || '1';

if (!intranetUrl || !cronSecret) {
    console.error('Faltan INTRANET_URL o CRON_BIOMETRIC_SECRET');
    process.exit(1);
}

if (identifiers.length === 0) {
    console.error('Falta BIOMETRIC_IDENTIFIERS');
    process.exit(1);
}

const response = await fetch(`${intranetUrl}/api/cron/biometrico/sincronizar`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': cronSecret,
        Accept: 'application/json',
    },
    body: JSON.stringify({ identifiers, lookbackDays: Number(lookbackDays) }),
    cache: 'no-store',
});

const text = await response.text();
let data;
try {
    data = JSON.parse(text);
} catch {
    data = { message: text };
}

if (!response.ok) {
    console.error(`[Cron biométrico] ${response.status}: ${data?.message || text}`);
    process.exit(1);
}

console.log('[Cron biométrico] Sincronización completada:', JSON.stringify(data?.data || data));
