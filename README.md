# Infobip Web Calling Helper

A Next.js application that enables browser-based phone calls using Infobip's WebRTC SDK. This project provides a simple, user-friendly interface for making phone calls directly from a web browser.

## Features

- 📞 Make phone calls from browser to phone numbers
- 🎵 Call status feedback with ring tones
- 🎚️ Audio controls (mute/unmute)
- ⏱️ Call duration tracking
- 📱 Responsive dial pad interface
- 🔒 Secure WebRTC communication

## Prerequisites

- Node.js 18+ 
- Infobip account with WebRTC enabled
- Valid SSL certificate for production use
- API credentials from Infobip

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nejcpetan/infobip-webrtc-implementation.git
cd infobip-web-calling
```

2. Install dependencies:
```bash
npm install
```

1. Create `.env` file:
```env
INFOBIP_API_KEY=your_api_key_here
INFOBIP_BASE_URL=infobip_api_url_here
```

1. For development with SSL (required for WebRTC):
```bash
# Install mkcert
mkcert -install
mkcert localhost 127.0.0.1 ::1

# This will generate:
# - localhost.pem
# - localhost-key.pem
```

## Development

Run the development server:

```bash
npm run dev
```

The application will be available at `https://localhost:3000`

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### SSL Configuration

WebRTC requires HTTPS to work. Choose one of these options:

1. **Let's Encrypt** (recommended for production)
2. **mkcert** (for development)
3. **Vercel** (automatic SSL handling)

See [WEBRTC_IMPLEMENTATION.md](./WEBRTC_IMPLEMENTATION.md) for detailed SSL setup instructions.

## Usage

1. Open the application in a WebRTC-compatible browser
2. Enter a phone number using the dial pad or keyboard
3. Click the "Call" button or press Enter to initiate the call
4. Use the in-call controls to:
   - Mute/unmute the call
   - End the call
   - Monitor call duration

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── call/
│   │   └── webrtc-token/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DialPad.tsx
│   ├── CallControls.tsx
│   └── InfobipScript.tsx
├── services/
│   └── webrtc.ts
├── types/
│   └── infobip.d.ts
└── utils/
    └── audioTest.ts
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| INFOBIP_API_KEY | Your Infobip API key | Yes |
| INFOBIP_BASE_URL | Infobip API base URL | Yes |

## Browser Support

- Chrome 60+
- Firefox 52+
- Safari 11+
- Edge 79+

## Common Issues

1. **Audio not working**
   - Check browser permissions
   - Verify microphone access
   - Ensure SSL is properly configured

2. **Calls not connecting**
   - Verify API credentials
   - Check network connectivity
   - Confirm WebRTC compatibility

3. **SSL Certificate Issues**
   - Follow SSL setup guide in documentation
   - Ensure certificates are properly installed
   - Check certificate expiration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your chosen license]

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Infobip WebRTC SDK](https://www.infobip.com/docs/webrtc)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
