# WebRTC Phone Calling Implementation Guide

This guide explains how to implement WebRTC phone calling functionality using the Infobip SDK.

## Prerequisites

1. Infobip account with WebRTC enabled
2. API Key and other credentials
3. Next.js project (or similar React framework)

## Project Setup

### 1. Install Dependencies

```bash
npm install @infobip/rtc
```

### 2. Environment Variables

Create `.env.local`:
```env
INFOBIP_API_KEY=your_api_key
INFOBIP_BASE_URL=your_base_url
```

### 3. Load Infobip SDK

Add to your root layout or document:
```html
<script src="https://rtc.cdn.infobip.com/latest/infobip.rtc.js"></script>
```

## Implementation Steps

### 1. Create WebRTC Service

Create `services/webrtc.ts`:
```typescript
// First, define the necessary interfaces
interface PhoneCallOptions {
  from?: string;
  audio?: boolean;
}

interface InfobipCall {
  on: (event: string, callback: (data?: any) => void) => void;
  hangup: () => Promise<void>;
  muted: () => boolean;
  mute: (muted: boolean) => void;
  status: () => string;
}

interface InfobipRTC {
  callPhone: (phoneNumber: string, options?: PhoneCallOptions) => InfobipCall;
  on: (event: string, callback: (data?: any) => void) => void;
  connect: () => Promise<void>;
  getStatus?: () => string;
}

// Then create the service class
class WebRTCService {
  private rtc: InfobipRTC | null = null;
  private activeCall: InfobipCall | null = null;
  private isConnected: boolean = false;
  private localStream: MediaStream | null = null;
  private ringSound: HTMLAudioElement | null = null;
  private remoteAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize audio elements
      this.ringSound = document.createElement('audio');
      this.ringSound.src = '/call-ring.mp3';
      this.ringSound.loop = true;

      this.remoteAudio = document.createElement('audio');
      this.remoteAudio.autoplay = true;
      this.remoteAudio.playsInline = true;
      document.body.appendChild(this.remoteAudio);
    }
  }

  // ... [Include all methods from the webrtc.ts file]
}

export const webRTCService = new WebRTCService();
```

### 2. Create Token Generation API

Create `app/api/webrtc-token/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`${process.env.INFOBIP_BASE_URL}/webrtc/1/token`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identity: `browser-${Date.now()}`,
        applicationId: 'WEBRTC',
        displayName: 'Web Phone',
        capabilities: {
          recording: false,
        },
      }),
    });

    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
```

### 3. Create UI Components

#### DialPad Component
```typescript
// components/DialPad.tsx
export function DialPad() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("");
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);

  const handleCall = async () => {
    try {
      setCallStatus("Connecting...");
      setIsInCall(true);
      await webRTCService.initialize();

      const call = await webRTCService.makeCall(phoneNumber);
      if (call) {
        setActiveCall(call);

        call.on("established", () => {
          console.log("Call connected");
          setCallStatus("Connected");
          setCallStartTime(new Date());
        });

        call.on("hangup", () => {
          console.log("Call ended");
          handleHangup();
        });
      }
    } catch (error) {
      console.error("Call error:", error);
      handleHangup();
    }
  };

  // ... rest of the component
}
```

#### CallControls Component
```typescript
// components/CallControls.tsx
export function CallControls({
  onHangup,
  callStartTime,
  status,
}: CallControlsProps) {
  const [duration, setDuration] = useState("00:00");
  const [isMuted, setIsMuted] = useState(false);

  // ... rest of the component
}
```

## Key Features

1. **Audio Handling**
   - Automatic audio device setup
   - Remote audio stream handling
   - Mute/unmute functionality

2. **Call Status Management**
   - Connection state tracking
   - Call duration tracking
   - Status display

3. **Ring Feedback**
   - Audio feedback during call initiation
   - Automatic cleanup on call end/error

## Usage Example

```typescript
// Initialize the service
await webRTCService.initialize();

// Make a call
const call = await webRTCService.makeCall('+1234567890');

// Handle call events
call.on('established', () => {
  console.log('Call connected');
});

// End the call
await webRTCService.endCall();

// Mute/unmute
webRTCService.setMuted(true);
```

## Troubleshooting

1. **No Audio**
   - Check browser permissions
   - Verify audio device selection
   - Check audio debug info in console

2. **Connection Issues**
   - Verify token generation
   - Check network connectivity
   - Review console for connection states

3. **Call Establishment**
   - Monitor call events
   - Check audio stream availability
   - Verify codec compatibility

## Notes

- Ensure proper error handling
- Monitor call states
- Clean up resources after calls
- Handle browser compatibility
- Test across different devices

## Resources & References

### Official Documentation
- [Infobip WebRTC Documentation](https://www.infobip.com/docs/webrtc)
- [Infobip WebRTC JavaScript SDK](https://github.com/infobip/infobip-rtc-js)
- [Infobip WebRTC JS Wiki](https://github.com/infobip/infobip-rtc-js/wiki/InfobipRTC)
- [Infobip API Reference](https://www.infobip.com/docs/api)

### WebRTC Standards & Specifications
- [WebRTC API on MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [WebRTC.org](https://webrtc.org/)
- [WebRTC Standards](https://w3c.github.io/webrtc-pc/)
- [Media Capture and Streams API](https://w3c.github.io/mediacapture-main/)

### Browser Compatibility
- [WebRTC Browser Compatibility](https://caniuse.com/?search=webrtc)
- [getUserMedia Browser Support](https://caniuse.com/?search=getusermedia)
- [Infobip Browser Compatibility List](https://www.infobip.com/docs/webrtc/supported-browsers)

### Audio & Media Handling
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
- [Audio Worklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)

### Security & Best Practices
- [WebRTC Security](https://webrtc-security.github.io/)
- [STUN/TURN Server Configuration](https://www.infobip.com/docs/webrtc/stun-turn-servers)
- [WebRTC Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Security)

### Code Examples
- [Infobip WebRTC Examples](https://github.com/infobip/infobip-rtc-showcase)
- [WebRTC Samples](https://webrtc.github.io/samples/)
- [MDN WebRTC Examples](https://github.com/mdn/samples-server/tree/master/s/webrtc-from-chat)

### Tools & Debugging
- [WebRTC Internals (chrome://webrtc-internals)](chrome://webrtc-internals)
- [WebRTC Troubleshooter](https://test.webrtc.org/)
- [WebRTC Stats](https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport)

### Related Specifications
- [SDP Specification](https://tools.ietf.org/html/rfc4566)
- [ICE Protocol](https://tools.ietf.org/html/rfc8445)
- [DTLS Protocol](https://tools.ietf.org/html/rfc6347)
- [SRTP Protocol](https://tools.ietf.org/html/rfc3711)

## Common Issues & Solutions

### Audio Playback Issues

One common issue with WebRTC calls is audio playback not working even when the call is connected. This usually happens due to improper handling of the audio stream or browser audio context.

#### The Problem
Initially, the audio wasn't playing because:
1. The audio stream wasn't being properly attached to an audio element
2. The audio element wasn't being properly initialized
3. Browser autoplay policies were blocking audio playback

#### The Solution
We implemented a proper audio handling setup:

```typescript
class WebRTCService {
  private remoteAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Create and configure audio element
      this.remoteAudio = document.createElement('audio');
      this.remoteAudio.autoplay = true;
      this.remoteAudio.playsInline = true;
      document.body.appendChild(this.remoteAudio);
    }
  }

  // In the makeCall method:
  call.on('established', async (event: any) => {
    if (event.stream && this.remoteAudio) {
      console.log('Setting up remote audio stream');
      this.remoteAudio.srcObject = event.stream;
      await this.remoteAudio.play().catch(e => 
        console.error('Error playing audio:', e)
      );
    }
  });
}
```

#### Key Components:
1. **Audio Element Creation**: Create the audio element early and attach it to the DOM
2. **Autoplay & PlaysInline**: Set these attributes to handle browser autoplay policies
3. **Stream Attachment**: Properly attach the WebRTC stream to the audio element
4. **Error Handling**: Catch and log any audio playback errors

#### Browser Considerations
- Chrome and Firefox typically work without issues once properly set up
- Safari requires the `playsInline` attribute
- Mobile browsers may require user interaction before audio can play

#### Testing Audio
To verify audio is working:
1. Check browser console for stream-related logs
2. Use the audio debug info to verify track states
3. Verify audio permissions are granted
4. Check audio output device selection

## API Integration

### Token Generation
The first step in establishing WebRTC calls is obtaining a token from Infobip's API.

```typescript
// app/api/webrtc-token/route.ts
export async function GET() {
  try {
    const response = await fetch(`${process.env.INFOBIP_BASE_URL}/webrtc/1/token`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identity: `browser-${Date.now()}`, // Unique identifier for this client
        applicationId: 'WEBRTC',           // Your Infobip application ID
        displayName: 'Web Phone',          // Display name for this client
        capabilities: {
          recording: false,
        },
      }),
    });

    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
```

#### Token API Details
- **Endpoint**: `POST /webrtc/1/token`
- **Purpose**: Generates a token for WebRTC authentication
- **Validity**: Tokens are valid for 24 hours
- **Rate Limit**: Depends on your Infobip plan

### Making Calls

The SDK handles most of the API calls internally, but here's what happens under the hood:

```typescript
// services/webrtc.ts
async makeCall(phoneNumber: string) {
  // 1. Initialize WebRTC connection
  await this.initialize();

  // 2. Create the call
  const call = this.rtc!.callPhone(phoneNumber, {
    from: '+38613626000',  // Your Infobip phone number
    audio: true
  });

  // 3. SDK internally makes API calls to:
  // - Set up STUN/TURN servers
  // - Handle SDP negotiation
  // - Manage ICE candidates
  // - Handle media streams
}
```

#### Call Flow
1. **Token Generation** (`POST /webrtc/1/token`)
   - Gets authentication token
   - Sets up client identity

2. **WebSocket Connection**
   - Establishes real-time communication
   - Handles signaling

3. **Call Setup**
   - SDP offer generation
   - ICE candidate gathering
   - Media negotiation

4. **Call Management**
   ```typescript
   // Example of call management API calls
   call.on('established', () => {
     // Call is connected
   });

   // Mute/unmute
   call.mute(true);

   // End call
   call.hangup();
   ```

### API Response Examples

#### Token Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expirationTime": "2024-01-20T12:00:00.000Z"
}
```

#### Call Events
```typescript
// Various events emitted during call lifecycle
{
  event: 'established',
  callId: '177e0598-810e-4bea-9acc-24b58b20ed78',
  status: {
    id: 10000,
    name: 'NORMAL_HANGUP',
    description: 'The call has ended with hangup initiated by caller'
  }
}
```

### Error Handling

```typescript
try {
  const call = await webRTCService.makeCall(phoneNumber);
} catch (error) {
  // Common API errors:
  // - 401: Invalid token
  // - 403: Unauthorized (invalid API key)
  // - 429: Rate limit exceeded
  // - 503: Service unavailable
}
```

### API Configuration

Required environment variables:
```env
INFOBIP_API_KEY=your_api_key
INFOBIP_BASE_URL=your_base_url  # e.g., https://api.infobip.com
```

### API Limitations & Considerations
- Token expiration handling
- Rate limiting considerations
- Error retry strategies
- Call recording limitations
- Geographic restrictions
- Audio codec support

For detailed API documentation, see [Infobip API Reference](https://www.infobip.com/docs/api).

### Additional API Endpoints

#### 1. Call Status Check
```typescript
// GET /webrtc/1/calls/{callId}
async getCallStatus(callId: string) {
  const response = await fetch(`${process.env.INFOBIP_BASE_URL}/webrtc/1/calls/${callId}`, {
    headers: {
      'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
    },
  });
  return response.json();
}

// Response example:
{
  "callId": "177e0598-810e-4bea-9acc-24b58b20ed78",
  "status": "ESTABLISHED",
  "startTime": "2024-01-19T10:30:00.000Z",
  "establishTime": "2024-01-19T10:30:05.000Z",
  "duration": 120
}
```

#### 2. Active Calls List
```typescript
// GET /webrtc/1/calls
async getActiveCalls() {
  const response = await fetch(`${process.env.INFOBIP_BASE_URL}/webrtc/1/calls`, {
    headers: {
      'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
    },
  });
  return response.json();
}

// Response example:
{
  "calls": [
    {
      "callId": "177e0598-810e-4bea-9acc-24b58b20ed78",
      "status": "ESTABLISHED",
      "direction": "OUTBOUND",
      "from": "+38613626000",
      "to": "+38651226881"
    }
  ]
}
```

#### 3. Call Recording
```typescript
// POST /webrtc/1/calls/{callId}/recording/start
async startRecording(callId: string) {
  const response = await fetch(
    `${process.env.INFOBIP_BASE_URL}/webrtc/1/calls/${callId}/recording/start`,
    {
      method: 'POST',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
}

// POST /webrtc/1/calls/{callId}/recording/stop
async stopRecording(callId: string) {
  const response = await fetch(
    `${process.env.INFOBIP_BASE_URL}/webrtc/1/calls/${callId}/recording/stop`,
    {
      method: 'POST',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
      },
    }
  );
  return response.json();
}
```

#### 4. Call Metrics
```typescript
// GET /webrtc/1/calls/{callId}/metrics
async getCallMetrics(callId: string) {
  const response = await fetch(
    `${process.env.INFOBIP_BASE_URL}/webrtc/1/calls/${callId}/metrics`,
    {
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
      },
    }
  );
  return response.json();
}

// Response example:
{
  "callId": "177e0598-810e-4bea-9acc-24b58b20ed78",
  "metrics": {
    "audio": {
      "packetsLost": 0,
      "roundTripTime": 45,
      "jitter": 2.5,
      "codec": "OPUS"
    },
    "connection": {
      "iceConnectionState": "connected",
      "currentIceCandidate": "relay",
      "networkType": "wifi"
    }
  }
}
```

#### 5. Force Call Termination
```typescript
// DELETE /webrtc/1/calls/{callId}
async forceTerminateCall(callId: string) {
  const response = await fetch(
    `${process.env.INFOBIP_BASE_URL}/webrtc/1/calls/${callId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
      },
    }
  );
  return response.status === 204;
}
```

### WebSocket Events

The WebRTC service also uses WebSocket connections for real-time events:

```typescript
// Example WebSocket events
{
  "event": "ice_candidate",
  "callId": "177e0598-810e-4bea-9acc-24b58b20ed78",
  "candidate": {
    "candidate": "candidate:1 1 UDP 2013266431 192.168.1.2 52128 typ host",
    "sdpMLineIndex": 0,
    "sdpMid": "0"
  }
}

{
  "event": "call_established",
  "callId": "177e0598-810e-4bea-9acc-24b58b20ed78",
  "timestamp": "2024-01-19T10:30:05.000Z"
}

{
  "event": "call_ended",
  "callId": "177e0598-810e-4bea-9acc-24b58b20ed78",
  "reason": "NORMAL_CLEARING",
  "timestamp": "2024-01-19T10:32:05.000Z"
}
```

### Rate Limiting

The API has rate limits that vary by endpoint:
- Token generation: 10 requests per second
- Call initiation: 5 calls per second
- Status checks: 20 requests per second
- Recording operations: 2 requests per second

### Error Codes

Common error responses:
```json
{
  "requestError": {
    "serviceException": {
      "messageId": "BAD_REQUEST",
      "text": "Invalid request format"
    }
  }
}
```

Error code ranges:
- 400-499: Client errors (invalid requests, authentication)
- 500-599: Server errors (internal errors, service unavailable)
- 10000-19999: WebRTC specific errors (call setup, media handling)

For the complete API reference and detailed error codes, see the [Infobip API Documentation](https://www.infobip.com/docs/api).

## Step-by-Step Implementation Tutorial

### 1. Project Setup
```bash
# Create a new Next.js project
npx create-next-app@latest my-webrtc-app --typescript --tailwind --eslint

# Install required dependencies
npm install @infobip/rtc lucide-react @radix-ui/react-icons
```

### 2. Environment Configuration
Create `.env.local` in your project root:
```env
INFOBIP_API_KEY=your_api_key_here
INFOBIP_BASE_URL=https://api.infobip.com
```

### 3. Add Infobip SDK Script
Update `app/layout.tsx`:
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://rtc.cdn.infobip.com/latest/infobip.rtc.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 4. Create WebRTC Service
Create `services/webrtc.ts`:
```typescript
class WebRTCService {
  private rtc: InfobipRTC | null = null;
  private activeCall: InfobipCall | null = null;
  private remoteAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.remoteAudio = document.createElement('audio');
      this.remoteAudio.autoplay = true;
      this.remoteAudio.playsInline = true;
      document.body.appendChild(this.remoteAudio);
    }
  }

  async initialize() {
    // Implementation from the service code above
  }

  async makeCall(phoneNumber: string) {
    // Implementation from the service code above
  }

  // Add other methods as needed
}

export const webRTCService = new WebRTCService();
```

### 5. Create Token Generation API
Create `app/api/webrtc-token/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`${process.env.INFOBIP_BASE_URL}/webrtc/1/token`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identity: `browser-${Date.now()}`,
        applicationId: 'WEBRTC',
        displayName: 'Web Phone',
        capabilities: {
          recording: false,
        },
      }),
    });

    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
```

### 6. Create UI Components
Create `components/DialPad.tsx`:
```typescript
"use client";
import { useState } from "react";
import { webRTCService } from "@/services/webrtc";

export function DialPad() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isInCall, setIsInCall] = useState(false);

  const handleCall = async () => {
    try {
      setIsInCall(true);
      const call = await webRTCService.makeCall(phoneNumber);
      // Handle call events
    } catch (error) {
      console.error("Call error:", error);
      setIsInCall(false);
    }
  };

  // Rest of the component implementation
}
```

### 7. Update Main Page
Update `app/page.tsx`:
```typescript
import { DialPad } from "@/components/DialPad";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <DialPad />
      </div>
    </main>
  );
}
```

### 8. Testing
1. Start the development server:
```bash
npm run dev
```

2. Open `http://localhost:3000` in your browser

3. Test a call:
   - Enter a phone number
   - Click "Call"
   - Check browser console for connection status
   - Verify audio playback

### Common Issues & Debugging
1. If audio isn't working:
   - Check browser console for errors
   - Verify audio permissions
   - Check audio device selection

2. If calls aren't connecting:
   - Verify API key and base URL
   - Check network connectivity
   - Review WebSocket connection status

3. If token generation fails:
   - Verify environment variables
   - Check API key permissions
   - Review network requests in browser dev tools

### Next Steps
1. Add error handling and user feedback
2. Implement call controls (mute, hangup)
3. Add call duration display
4. Implement call history
5. Add audio device selection

For production deployment, remember to:
- Secure your API key
- Add error boundaries
- Implement proper logging
- Add analytics tracking
- Test across different browsers and devices
- Install certificates - WebRTC requires certificates for secure connections and won't work without them.

## SSL Certificate Setup

### Option 1: Using Let's Encrypt (Recommended for Production)

1. Install Certbot:
```bash
# On Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot

# On CentOS/RHEL
sudo dnf install certbot
```

2. Generate certificate:
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

3. Configure your web server (example for Nginx):
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS (uncomment if you're sure)
    # add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Using mkcert (For Development)

1. Install mkcert:
```bash
# On macOS
brew install mkcert
brew install nss # for Firefox

# On Windows
choco install mkcert

# On Linux
sudo apt install libnss3-tools
sudo apt install mkcert
```

2. Create and install local CA:
```bash
mkcert -install
```

3. Generate certificates for your domain:
```bash
mkcert localhost 127.0.0.1 ::1
```

4. Configure Next.js to use SSL:

Create `server.js` in your project root:
```javascript
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
  });
});
```

5. Update package.json:
```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js"
  }
}
```

### Option 3: Using Vercel (Easiest for Production)

If deploying to Vercel, SSL is automatically handled:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy your app:
```bash
vercel
```

### Important Security Considerations

1. **Certificate Renewal**:
   - Let's Encrypt certificates expire after 90 days
   - Set up auto-renewal:
   ```bash
   sudo certbot renew --dry-run
   ```
   - Add to crontab:
   ```bash
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

2. **Browser Security**:
   - Ensure your domain is properly configured
   - Set up proper CORS headers
   - Enable HSTS if possible

3. **WebRTC-Specific**:
   - Configure ICE servers properly
   - Use TURN servers for fallback
   - Enable secure WebSocket connections

4. **Environment Variables**:
   - Update your .env.local for HTTPS:
   ```env
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

Remember: WebRTC requires HTTPS in production. The only exception is localhost during development.
