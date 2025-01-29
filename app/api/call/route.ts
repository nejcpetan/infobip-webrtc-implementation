import { NextResponse } from 'next/server';

const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
const INFOBIP_BASE_URL = 'https://api.infobip.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // First, initiate the call
    const response = await fetch(`${INFOBIP_BASE_URL}/calls/1/calls`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: {
          type: 'PHONE',
          phoneNumber: body.phoneNumber
        },
        from: '38613626000',
        callsConfigurationId: 'test-configuration-1',
        platform: {
          applicationId: 'calls_test_application_id'
        },
        webrtc: {
          enabled: true,
          token: process.env.NEXT_PUBLIC_INFOBIP_API_KEY // Add your WebRTC token here
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        ...data,
        webrtcEndpoint: data.webrtcEndpoint
      });
    }

    throw new Error('Failed to initiate call');
  } catch (error) {
    return NextResponse.json({ error: 'Failed to make call' }, { status: 500 });
  }
} 