"use client";

import * as React from "react";
import { Leaf, Phone, KeyRound, CheckCircle2, Loader2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

export function OtpAuthDialog() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<"phone" | "otp" | "success">("phone");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [generatedOtp, setGeneratedOtp] = React.useState<string | null>(null);
  const [userToken, setUserToken] = React.useState<string | null>(null);
  const [userProfile, setUserProfile] = React.useState<any>(null);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.sendOtp(phone);
      setGeneratedOtp(res.otpCode || "123456");
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.verifyOtp(phone, code, name || "Annam Customer");
      setUserToken(res.data.token);
      setUserProfile(res.data.user);
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  }

  function resetFlow() {
    setStep("phone");
    setPhone("");
    setCode("");
    setName("");
    setGeneratedOtp(null);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetFlow(); }}>
      <DialogTrigger
        render={
          <Button variant="default" className="gap-2">
            {userProfile ? (
              <>
                <UserCheck className="size-4" />
                Hi, {userProfile.name?.split(" ")[0] || "User"}
              </>
            ) : (
              <>
                <Phone className="size-4" />
                Login with Phone OTP
              </>
            )}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Leaf className="size-5 text-primary" />
            Annam Kitchen Auth
          </DialogTitle>
          <DialogDescription>
            {step === "phone" && "Enter your 10-digit phone number to receive an instant OTP code."}
            {step === "otp" && `Enter the 6-digit OTP sent to +91 ${phone}`}
            {step === "success" && "Authentication successful! Connected to backend."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded">
            {error}
          </div>
        )}

        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium px-3 py-2 border border-input rounded bg-muted">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP Code"
              )}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 py-2">
            {generatedOtp && (
              <div className="p-3 bg-primary/10 border border-primary/20 text-primary text-xs rounded flex justify-between items-center">
                <span>Demo OTP Code: <strong>{generatedOtp}</strong></span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={() => setCode(generatedOtp)}
                >
                  Auto-fill
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Your Name (Optional for new users)</Label>
              <Input
                id="name"
                placeholder="Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="code">6-Digit OTP Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("phone")}
                className="w-1/3"
              >
                Back
              </Button>
              <Button type="submit" disabled={loading} className="w-2/3">
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "success" && (
          <div className="flex flex-col gap-4 py-4 text-center items-center">
            <CheckCircle2 className="size-12 text-primary" />
            <h3 className="font-serif text-lg font-semibold">Welcome, {userProfile?.name || "Customer"}!</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              JWT Token issued by backend:
            </p>
            <div className="p-2 bg-muted rounded font-mono text-[10px] break-all max-h-20 overflow-y-auto w-full text-left">
              {userToken}
            </div>
            <Button onClick={() => setOpen(false)} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
