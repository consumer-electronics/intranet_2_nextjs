import { NextResponse } from 'next/server';

// Forzar ejecución dinámica para evitar que el Route Handler se cachee
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rango = searchParams.get('rango') || '1M'; // 1D, 5D, 1M, 3M, 6M, YTD, 1A, 5A, MAX

    const today = new Date();
    let startDate = new Date(today);
    
    let limitQuery = '';
    let whereQuery = '';

    switch (rango) {
      case '1D':
      case '5D':
        // Para rangos muy cortos, usamos limit por registros para garantizar puntos
        limitQuery = `&$limit=${rango === '1D' ? 2 : 7}`;
        break;
      case '1M':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case 'YTD':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      case '1A':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case '5A':
        startDate.setFullYear(today.getFullYear() - 5);
        break;
      case 'MAX':
        limitQuery = '&$limit=15000'; // Trae casi toda la historia
        break;
      default:
        startDate.setMonth(today.getMonth() - 1); // 1M fallback
    }

    if (!limitQuery && rango !== 'MAX') {
      const formattedDate = startDate.toISOString().split('T')[0] + 'T00:00:00.000';
      whereQuery = `&$where=vigenciadesde>='${formattedDate}'`;
      limitQuery = `&$limit=2000`; // Suficiente para 5 años
    }

    const url = `https://www.datos.gov.co/resource/ceyp-9c7c.json?$order=vigenciadesde ASC${limitQuery}${whereQuery}`;
    
    const response = await fetch(url, {
      next: { revalidate: 3600 } // 1 hora
    });

    if (!response.ok) {
      throw new Error('Fallo al obtener historial TRM');
    }

    const data = await response.json();
    
    // Normalizar para la gráfica recharts
    const history = data.map(item => ({
      fecha: item.vigenciadesde.split('T')[0],
      valor: parseFloat(item.valor)
    }));

    // Si usamos $order=ASC y limit sin where, puede traer los datos más antiguos del dataset (1991).
    // Espera, para 1D y 5D quiero los últimos N registros.
    // Socrata orden ASC con limit=7 traerá los primeros 7 registros desde 1991!
    // Entonces para 1D y 5D debo ordenarlo DESC, limit, y luego invertir el array (reverse)
    if (rango === '1D' || rango === '5D') {
        const fixUrl = `https://www.datos.gov.co/resource/ceyp-9c7c.json?$order=vigenciadesde DESC${limitQuery}`;
        const fixRes = await fetch(fixUrl, { next: { revalidate: 3600 } });
        const fixData = await fixRes.json();
        const fixHistory = fixData.map(item => ({
          fecha: item.vigenciadesde.split('T')[0],
          valor: parseFloat(item.valor)
        })).reverse();
        return NextResponse.json(fixHistory);
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching TRM history from datos.gov.co:', error);
    return NextResponse.json([]);
  }
}
