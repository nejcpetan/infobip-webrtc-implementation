"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { webRTCService } from "@/services/webrtc";

interface CallControlsProps {
  onHangup: () => void;
  callStartTime?: Date;
  status: string;
}

export function CallControls({
  onHangup,
  callStartTime,
  status,
}: CallControlsProps) {
  const [duration, setDuration] = useState("00:00");
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (callStartTime && status === "Connected") {
      const updateDuration = () => {
        const diff = new Date().getTime() - callStartTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setDuration(
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      };

      updateDuration();
      interval = setInterval(updateDuration, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStartTime, status]);

  const handleMuteToggle = () => {
    const success = webRTCService.setMuted(!isMuted);
    if (success) {
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="text-2xl font-semibold">{status}</div>
        {status === "Connected" && (
          <div className="text-xl font-mono">{duration}</div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <Button
          variant={isMuted ? "destructive" : "outline"}
          onClick={handleMuteToggle}
          className="h-16 w-16 rounded-full"
        >
          {isMuted ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="destructive"
          onClick={onHangup}
          className="h-16 w-16 rounded-full"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
