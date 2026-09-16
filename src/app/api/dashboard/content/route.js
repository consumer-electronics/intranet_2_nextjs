import { NextResponse } from 'next/server';
import { mockContents, updateMockContents } from './mockData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('estado');
  const type = searchParams.get('tipo');

  let filteredContents = [...mockContents];

  if (status) {
    filteredContents = filteredContents.filter(c => c.estado === status);
  }
  
  if (type) {
    filteredContents = filteredContents.filter(c => c.tipo === type);
  }

  // Sort by order ascending
  filteredContents.sort((a, b) => a.orden - b.orden);

  return NextResponse.json(filteredContents);
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const newContent = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Auto-assign next order if not provided
      orden: body.orden || (mockContents.length > 0 ? Math.max(...mockContents.map(c => c.orden || 0)) + 1 : 1)
    };

    const newContents = [...mockContents, newContent];
    updateMockContents(newContents);

    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
