"use client";
import { useState, KeyboardEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, X, PhoneOff } from "lucide-react";
import { CallControls } from "./CallControls";
import { webRTCService } from "@/services/webrtc";

export function DialPad() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("");
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);

  const dialPadNumbers = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "*",
    "0",
    "#",
  ];

  const handleNumberClick = (number: string) => {
    setPhoneNumber((prev) => prev + number);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, plus sign, and hash/star symbols
    const value = e.target.value.replace(/[^\d*#+]/g, "");
    setPhoneNumber(value);
  };

  const handleClear = () => {
    setPhoneNumber("");
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && phoneNumber) {
      handleCall();
    }
  };

  const handleCall = async () => {
    if (!phoneNumber) return;

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

  const handleHangup = async () => {
    try {
      await webRTCService.endCall();
    } finally {
      setIsInCall(false);
      setCallStatus("");
      setCallStartTime(null);
      setActiveCall(null);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-8">
        Infobip Web Calling Helper
      </h1>

      <div className="space-y-6 bg-white rounded-xl shadow-lg p-6">
        {callStatus && (
          <div className="text-center font-medium text-gray-600 animate-pulse">
            {callStatus}
          </div>
        )}

        <Input
          type="tel"
          value={phoneNumber}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="text-center text-2xl font-mono tracking-wider"
          placeholder="Enter phone number"
          disabled={isInCall}
          inputMode="numeric"
        />

        {!isInCall ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              {dialPadNumbers.map((number) => (
                <Button
                  key={number}
                  variant="outline"
                  className="h-16 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  onClick={() => handleNumberClick(number)}
                >
                  <span className="text-xl font-semibold">{number}</span>
                </Button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 h-12 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={handleClear}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                className="flex-1 h-12 bg-green-600 hover:bg-green-700 transition-colors"
                onClick={handleCall}
                disabled={!phoneNumber}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </div>
          </>
        ) : (
          <CallControls
            onHangup={handleHangup}
            callStartTime={callStartTime}
            status={callStatus}
          />
        )}
      </div>
    </div>
  );
}
