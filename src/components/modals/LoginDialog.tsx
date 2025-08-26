"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  userData: {
    name: string;
    email?: string;
    phone?: string;
  };
}

export function LoginDialog({
  isOpen,
  onClose,
  onLoginSuccess,
  userData,
}: LoginDialogProps) {
  const handleSignIn = () => {
    // TODO: Add login functionality later
    toast.info("Sign in functionality will be added soon!");
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome back, {userData.name}!</DialogTitle>
          <DialogDescription>
            We found your account. Sign in to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={handleSignIn}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white"
          >
            Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
