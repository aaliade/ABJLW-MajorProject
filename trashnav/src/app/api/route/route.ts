import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const apiUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    console.log('API URL:', apiUrl);
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('API key is missing');
      return NextResponse.json(
        { error: 'API key configuration is missing' },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Routes API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { error: `Routes API error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Routes API success response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Route computation error:', error);
    return NextResponse.json(
      { error: 'Failed to compute route', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
