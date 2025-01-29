import { NextResponse } from 'next/server';

const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
const INFOBIP_BASE_URL = 'https://api.infobip.com';

export async function GET() {
  try {
    console.log('Requesting token with API key:', INFOBIP_API_KEY?.slice(0, 10) + '...');

    // Simplified request body according to Infobip docs
    const requestBody = {
      identity: `browser-${Date.now()}`,
      name: 'Browser User',
      applicationId: 'calls_test_application_id'
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${INFOBIP_BASE_URL}/webrtc/1/token`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid response format');
    }

    console.log('Parsed response data:', data);

    if (!response.ok) {
      const errorMessage = data.requestError?.serviceException?.text || 
                          data.requestError?.serviceException?.messageId ||
                          data.message || 
                          response.statusText;
      throw new Error(`Failed to get token: ${errorMessage}`);
    }

    if (!data.token) {
      throw new Error('No token in response');
    }

    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate token' },
      { status: 500 }
    );
  }
} 