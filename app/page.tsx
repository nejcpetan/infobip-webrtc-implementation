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
