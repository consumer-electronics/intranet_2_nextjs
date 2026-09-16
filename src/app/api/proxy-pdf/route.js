import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                // Mimic a standard browser request
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/pdf,*/*;q=0.8',
            },
        });

        if (!response.ok) {
            return new NextResponse(`Failed to fetch from remote server: ${response.statusText}`, {
                status: response.status,
            });
        }

        // Return the response directly to the client, piped from the remote server
        return new NextResponse(response.body, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/pdf',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Error proxying PDF:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
