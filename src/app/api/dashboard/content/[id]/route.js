import { NextResponse } from 'next/server';
import { mockContents, updateMockContents } from '../mockData';

export async function GET(request, { params }) {
  const { id } = await params;
  
  const content = mockContents.find(c => c.id === id);
  if (!content) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }
  
  return NextResponse.json(content);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  
  const index = mockContents.findIndex(c => c.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const updatedContent = {
      ...mockContents[index],
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    const newContents = [...mockContents];
    newContents[index] = updatedContent;
    updateMockContents(newContents);
    
    return NextResponse.json(updatedContent);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  
  const index = mockContents.findIndex(c => c.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }
  
  const newContents = mockContents.filter(c => c.id !== id);
  updateMockContents(newContents);
  
  return new NextResponse(null, { status: 204 });
}
