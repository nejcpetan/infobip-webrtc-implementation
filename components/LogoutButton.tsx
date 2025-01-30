"use client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/services/auth";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    auth.logout();
    router.push("/login");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="absolute top-4 right-4"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
}
