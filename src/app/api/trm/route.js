import { NextResponse } from 'next/server';

// Forzar ejecución dinámica para que el Route Handler no se cachee
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Obtenemos los dos últimos registros para calcular la variación
    const url = 'https://www.datos.gov.co/resource/ceyp-9c7c.json?$limit=2&$order=vigenciadesde%20DESC';
    
    const response = await fetch(url, {
      // Revalidar la caché del fetch externo cada hora
      // (la TRM cambia una vez al día, pero así evitamos saturar la API)
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('No se pudo consultar la API de Datos Abiertos de Colombia');
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error('La API no retornó datos');
    }

    const currentRecord = data[0];
    const previousRecord = data.length > 1 ? data[1] : currentRecord;

    const currentValue = parseFloat(currentRecord.valor);
    const previousValue = parseFloat(previousRecord.valor);

    // Variación absoluta (cuántos pesos subió o bajó)
    const variationAbsolute = currentValue - previousValue;
    
    // Variación porcentual ((V2 - V1) / V1) * 100
    const variationPercent = previousValue > 0 
      ? (variationAbsolute / previousValue) * 100 
      : 0;

    const trmData = {
      current: {
        value: currentValue,
        currency: "COP",
        base: "USD",
        variation: parseFloat(variationAbsolute.toFixed(2)),
        variationPercent: parseFloat(variationPercent.toFixed(2)),
        date: currentRecord.vigenciadesde.split('T')[0]
      },
      source: {
        name: "Superintendencia Financiera de Colombia",
        url: "https://www.datos.gov.co/resource/ceyp-9c7c"
      },
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(trmData);
  } catch (error) {
    console.error('Error fetching TRM from datos.gov.co:', error);
    
    // Fallback a mock si la API falla
    const mockTrm = {
      current: {
        value: 4150.00,
        currency: "COP",
        base: "USD",
        variation: 0,
        variationPercent: 0,
        date: new Date().toISOString().split('T')[0]
      },
      source: {
        name: "Fallback (Simulada)",
        url: ""
      },
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockTrm);
  }
}
