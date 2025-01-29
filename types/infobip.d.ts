interface InfobipRTCOptions {
  debug?: boolean;
  audio?: boolean;
}

interface InfobipRTC {
  callPhone: (phoneNumber: string, options?: PhoneCallOptions) => InfobipCall;
  on: (event: string, callback: (data?: any) => void) => void;
  connect: () => Promise<void>;
}

declare global {
  interface Window {
    createInfobipRtc: (token: string, options?: InfobipRTCOptions) => InfobipRTC;
    __infobipScriptLoaded?: boolean;
  }
}

export {}; 