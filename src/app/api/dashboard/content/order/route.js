import { NextResponse } from 'next/server';
import { mockContents, updateMockContents } from '../mockData';

export async function PUT(request) {
  try {
    // Expected body: [{ id: '1', orden: 1 }, { id: '2', orden: 2 }]
    const body = await request.json();
    
    if (!Array.isArray(body)) {
       return NextResponse.json({ error: 'Body must be an array of objects with id and orden' }, { status: 400 });
    }

    const newContents = [...mockContents];
    
    body.forEach(item => {
      const index = newContents.findIndex(c => c.id === item.id);
      if (index !== -1) {
        newContents[index] = { ...newContents[index], orden: item.orden };
      }
    });

    updateMockContents(newContents);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
