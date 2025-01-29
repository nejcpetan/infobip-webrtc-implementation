interface InfobipRTCOptions {
  debug?: boolean;
  audio?: boolean;
}

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
  duration: () => number;
  startTime: () => Date;
  establishTime: () => Date;
  endTime: () => Date;
}

interface InfobipRTC {
  callPhone: (phoneNumber: string, options?: PhoneCallOptions) => InfobipCall;
  on: (event: string, callback: (data?: any) => void) => void;
  connect: () => Promise<void>;
  getStatus?: () => string;
}

interface AudioDebugInfo {
  hasAudioTrack: boolean;
  trackEnabled: boolean;
  trackMuted: boolean;
  trackReadyState: string;
  audioContextState?: string;
}

class WebRTCService {
  private rtc: InfobipRTC | null = null;
  private activeCall: InfobipCall | null = null;
  private isConnected: boolean = false;
  private localStream: MediaStream | null = null;
  private onRemoteStream: ((stream: MediaStream) => void) | null = null;
  private ringSound: HTMLAudioElement | null = null;
  private remoteAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Ring sound setup
      this.ringSound = document.createElement('audio');
      this.ringSound.src = '/call-ring.mp3';
      this.ringSound.loop = true;

      // Remote audio setup
      this.remoteAudio = document.createElement('audio');
      this.remoteAudio.autoplay = true;
      this.remoteAudio.playsInline = true;
      document.body.appendChild(this.remoteAudio);
    }
  }

  private async waitForInfobipSDK(timeout = 15000): Promise<void> {
    const startTime = Date.now();
    
    // Wait for script to be loaded
    while (!window.__infobipScriptLoaded && Date.now() - startTime < timeout) {
      console.log('Waiting for Infobip SDK to load...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Wait a bit more for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if the function is available
    if (!window.createInfobipRtc) {
      console.error('Infobip SDK failed to initialize properly');
      throw new Error('Infobip SDK not available after loading');
    }

    console.log('Infobip SDK loaded and ready');
  }

  private async waitForConnection(timeout = 10000): Promise<void> {
    if (!this.rtc) throw new Error('RTC client not initialized');

    const startTime = Date.now();
    console.log('Waiting for WebRTC connection...');
    
    // Wait for the initial connection
    while (!this.isConnected && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
      // Log status every second
      if ((Date.now() - startTime) % 1000 < 100) {
        console.log('Connection status:', this.rtc?.getStatus?.() || 'unknown');
      }
    }

    if (!this.isConnected) {
      throw new Error('Timeout waiting for WebRTC connection');
    }

    // Add extra delay to ensure full connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Connection established, final status:', this.rtc?.getStatus?.());
  }

  async initialize() {
    if (typeof window === 'undefined') return;

    try {
      this.isConnected = false;

      console.log('Waiting for Infobip SDK...');
      await this.waitForInfobipSDK();
      console.log('SDK loaded, proceeding with initialization...');

      // Request microphone access
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.localStream = stream;
      console.log('Microphone access granted');

      // Test audio track
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        console.log('Audio track settings:', audioTrack.getSettings());
        console.log('Audio track constraints:', audioTrack.getConstraints());
        console.log('Audio track capabilities:', audioTrack.getCapabilities());
      }

      const response = await fetch('/api/webrtc-token');
      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.error || 'Failed to get WebRTC token');
      }

      this.rtc = window.createInfobipRtc(data.token, {
        debug: true,
        audio: true
      });

      // Set up event handlers
      this.rtc.on('connected', () => {
        console.log('WebRTC client connected');
        this.isConnected = true;
      });

      this.rtc.on('disconnected', () => {
        console.log('WebRTC client disconnected');
        this.isConnected = false;
      });

      console.log('Connecting to WebRTC service...');
      await this.rtc.connect();
      await this.waitForConnection();
      
      console.log('RTC initialized and connected successfully');
    } catch (error) {
      console.error('Failed to initialize RTC:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async debugAudioState(): Promise<AudioDebugInfo> {
    const call = this.activeCall;
    if (!call) return {
      hasAudioTrack: false,
      trackEnabled: false,
      trackMuted: false,
      trackReadyState: 'no-call'
    };

    // Get the peer connection and audio track
    const pc = (call as any)._peerConnection as RTCPeerConnection;
    const audioTransceiver = pc?.getTransceivers()
      .find(t => t.receiver.track?.kind === 'audio');
    const audioTrack = audioTransceiver?.receiver.track;

    console.log('Audio Debug Info:', {
      peerConnection: {
        state: pc?.connectionState,
        iceState: pc?.iceConnectionState,
        signalingState: pc?.signalingState
      },
      audioTransceiver: {
        currentDirection: audioTransceiver?.currentDirection,
        direction: audioTransceiver?.direction
      },
      audioTrack: {
        exists: !!audioTrack,
        enabled: audioTrack?.enabled,
        muted: audioTrack?.muted,
        readyState: audioTrack?.readyState,
        id: audioTrack?.id
      }
    });

    return {
      hasAudioTrack: !!audioTrack,
      trackEnabled: audioTrack?.enabled ?? false,
      trackMuted: audioTrack?.muted ?? false,
      trackReadyState: audioTrack?.readyState ?? 'unknown'
    };
  }

  setRemoteStreamHandler(handler: (stream: MediaStream) => void) {
    this.onRemoteStream = handler;
  }

  private startRinging() {
    try {
      if (this.ringSound) {
        this.ringSound.currentTime = 0;
        this.ringSound.play();
      }
    } catch (error) {
      console.error('Failed to play ring sound:', error);
    }
  }

  private stopRinging() {
    try {
      if (this.ringSound) {
        this.ringSound.pause();
        this.ringSound.currentTime = 0;
      }
    } catch (error) {
      console.error('Failed to stop ring sound:', error);
    }
  }

  async makeCall(phoneNumber: string) {
    try {
      if (!this.rtc || !this.isConnected) {
        await this.initialize();
      }

      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      console.log('Creating phone call to:', formattedNumber);

      this.startRinging();

      const call = this.rtc!.callPhone(formattedNumber, {
        from: '+38613626000',
        audio: {
          enabled: true
        }
      });

      if (!call) {
        this.stopRinging();
        throw new Error('Failed to create call object');
      }

      this.activeCall = call;

      return new Promise((resolve) => {
        call.on('established', async (event: any) => {
          console.log('Call established');
          
          // Handle remote audio stream
          if (event.stream && this.remoteAudio) {
            console.log('Setting up remote audio stream');
            this.remoteAudio.srcObject = event.stream;
            await this.remoteAudio.play().catch(e => console.error('Error playing audio:', e));
          }

          const audioState = await this.debugAudioState();
          console.log('Initial audio state:', audioState);

          this.stopRinging();
          resolve(call);
        });

        call.on('hangup', () => {
          console.log('Call ended');
          if (this.remoteAudio) {
            this.remoteAudio.srcObject = null;
          }
          this.stopRinging();
          this.activeCall = null;
        });
      });
    } catch (error) {
      console.error('Error in makeCall:', error);
      this.stopRinging();
      this.activeCall = null;
      return null;
    }
  }

  async endCall() {
    if (this.activeCall) {
      try {
        await this.activeCall.hangup();
        this.activeCall = null;
        this.stopRinging(); // Make sure ringing stops

        // Stop local stream
        if (this.localStream) {
          this.localStream.getTracks().forEach(track => track.stop());
          this.localStream = null;
        }
      } catch (error) {
        console.error('Error ending call:', error);
        throw error;
      }
    }
  }

  setMuted(muted: boolean) {
    if (this.activeCall) {
      try {
        // The SDK expects mute(true) to mute, but our UI is reversed
        this.activeCall.mute(muted);
        console.log(`Call ${muted ? 'muted' : 'unmuted'}`);
        return true;
      } catch (error) {
        console.error('Error setting mute state:', error);
        return false;
      }
    }
    return false;
  }

  async checkAudioPermissions() {
    try {
      // Check if we already have permission
      const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (permissions.state === 'granted') {
        return true;
      }

      // Try to get audio permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Clean up
      return true;
    } catch (error) {
      console.error('Audio permission check failed:', error);
      return false;
    }
  }
}

export const webRTCService = new WebRTCService(); 