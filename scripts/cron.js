const intranetUrl = (
    process.env.INTRANET_URL ||
    'https://intranet.consumerelectronicsgroup.com'
).replace(/\/+$/, '');
const cronSecret = process.env.CRON_BIOMETRIC_SECRET;
const lookbackDays = Math.max(1, Math.min(60, Number(process.env.BIOMETRIC_LOOKBACK_DAYS || '1')));

if (!cronSecret) {
    console.error('Falta CRON_BIOMETRIC_SECRET');
    process.exit(1);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

async function synchronizeDay(inicio, final) {
    const response = await fetch(`${intranetUrl}/api/cron/biometrico/sincronizar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-cron-secret': cronSecret,
            Accept: 'application/json',
        },
        body: JSON.stringify({ inicio, final }),
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
        throw new Error(`${inicio}: ${response.status} - ${data?.message || text}`);
    }

    return data?.data || data;
}

async function run() {
    const today = new Date();
    let totalUsers = 0;
    let marcasProcesadas = 0;
    let marcasNuevas = 0;

    for (let offset = lookbackDays - 1; offset >= 0; offset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - offset);
        const day = formatDate(date);

        console.log(`[Cron biométrico] Sincronizando ${day}`);
        const result = await synchronizeDay(day, day);

        totalUsers = result.totalUsuarios || totalUsers;
        marcasProcesadas += result.marcasProcesadas || 0;
        marcasNuevas += result.marcasNuevas || 0;
    }

    console.log('[Cron biométrico] Sincronización completa:', JSON.stringify({
        dias: lookbackDays,
        totalUsuarios: totalUsers,
        marcasProcesadas,
        marcasNuevas,
    }));
}

run().catch((error) => {
    console.error('[Cron biométrico] Error:', error?.message || error);
    process.exit(1);
});
