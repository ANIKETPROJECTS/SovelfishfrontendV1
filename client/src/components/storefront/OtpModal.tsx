import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import flagImg from "@assets/flag_(1)_1776403319572.png";
import loginFishIcon from "@assets/fish_1794989243100.png";
import otpFishIcon from "@assets/fish_(1)_1794989293465.png";
import { FreshStockXchangeLogo } from "@/components/storefront/FreshStockXchangeLogo";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { OTP_DIGIT_COUNT } from "@shared/otp";

const BRAND_BROWN = "#7B3A14";
const BRAND_ORANGE = "#C8651B";
const BRAND_HIGHLIGHT = "#E8883A";
const createEmptyOtp = () => Array.from({ length: OTP_DIGIT_COUNT }, () => "");

interface OtpModalProps {
  open: boolean;
  onClose: () => void;
}

function SolidButton({
  color,
  onClick,
  disabled,
  loading,
  loadingText,
  children,
  testId,
}: {
  color: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-full border-2 py-4 text-base font-bold hover:brightness-95 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        background: color,
        color: "white",
        borderColor: color,
      }}
      data-testid={testId}
    >
      {loading ? loadingText : children}
    </button>
  );
}

export function OtpModal({ open, onClose }: OtpModalProps) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [otp, setOtp] = useState<string[]>(createEmptyOtp);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState<number | null>(null);
  const [showWhatsAppNotif, setShowWhatsAppNotif] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const phoneRef = useRef<HTMLInputElement>(null);
  const o0 = useRef<HTMLInputElement>(null);
  const o1 = useRef<HTMLInputElement>(null);
  const o2 = useRef<HTMLInputElement>(null);
  const o3 = useRef<HTMLInputElement>(null);
  const o4 = useRef<HTMLInputElement>(null);
  const o5 = useRef<HTMLInputElement>(null);
  const otpRefs = [o0, o1, o2, o3, o4, o5];

  useEffect(() => {
    if (open) {
      setPhone("");
      setOtpSent(false);
      setShowSuccess(false);
      setOtp(createEmptyOtp());
      setTimeout(() => phoneRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    if (otpSent) {
      setTimeout(() => otpRefs[0].current?.focus(), 350);
    }
  }, [otpSent]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
  };

  const handlePhoneSubmit = async () => {
    if (phone.length !== 10) {
      toast({ title: "Enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/customer/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to send OTP");
      }
      setOtpSent(true);
      setShowWhatsAppNotif(true);
      setTimeout(() => setShowWhatsAppNotif(false), 3500);
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 1) {
      const next = [...otp];
      const inserted = digits.slice(0, OTP_DIGIT_COUNT - index);
      inserted.split("").forEach((digit, offset) => {
        next[index + offset] = digit;
      });
      setOtp(next);
      otpRefs[Math.min(index + inserted.length, OTP_DIGIT_COUNT) - 1]?.current?.focus();
      return;
    }

    const digit = digits.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_DIGIT_COUNT - 1) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_DIGIT_COUNT);
    if (text.length === OTP_DIGIT_COUNT) {
      e.preventDefault();
      setOtp(text.split(""));
      otpRefs[OTP_DIGIT_COUNT - 1].current?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== OTP_DIGIT_COUNT) {
      toast({ title: `Enter the ${OTP_DIGIT_COUNT}-digit OTP`, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/customer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      // Directly populate the cache with the returned customer data.
      // Do NOT call refetch() here — a refetch hitting a 401 would
      // overwrite this data and log the user back out immediately.
      queryClient.setQueryData(["/api/customer/me"], data);
      setShowSuccess(true);
      setTimeout(() => onClose(), 2500);
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isFull = phone.length === 10;

  return (
    <>
      {/* Static delivery confirmation keeps the login flow free of decorative motion. */}
      {createPortal(
        showWhatsAppNotif ? (
          <div
            role="status"
            aria-live="polite"
            className="fixed right-4 top-4 z-[99999] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full bg-[#7B3A14] px-4 py-2 text-sm font-semibold text-white shadow-lg"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>We sent a sign-in code to your WhatsApp.</span>
          </div>
        ) : null,
        document.body
      )}

    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="flex w-[calc(100vw-1.5rem)] max-w-[460px] max-h-[calc(100dvh-1.5rem)] flex-col gap-0 overflow-y-auto rounded-[28px] border border-[#d7b18d] bg-[#fbf1e6] p-0 font-sans text-[#542813] shadow-2xl [&>button]:right-4 [&>button]:top-4 [&>button]:z-20 [&>button]:h-9 [&>button]:w-9 [&>button]:bg-white/15 [&>button]:text-white [&>button]:shadow-none [&>button]:hover:bg-white/25"
        data-testid="auth-sheet"
      >
        <DialogHeader className="footer-wood-bg shrink-0 px-5 py-5 pr-16 text-left sm:px-7 sm:py-6">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white p-1">
              <FreshStockXchangeLogo className="h-full w-full scale-[1.12]" />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-white sm:text-xl">Fresh Stock Xchange</p>
              <p className="mt-1 text-xs font-medium text-white/85">Fresh seafood, packed with care</p>
            </div>
          </div>
          <div className="mt-5">
            <DialogTitle className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
              Welcome!
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm font-medium text-white/85">
              Sign in to order fresh seafood and meat.
            </DialogDescription>
          </div>
        </DialogHeader>

        {showSuccess && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#fbf1e6] px-6 text-center"
          >
            <span className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#C8651B] shadow-sm">
              <CheckCircle2 className="h-12 w-12" aria-hidden="true" />
            </span>
            <p className="font-display text-2xl font-bold text-[#7B3A14]">You’re all set</p>
            <p className="mt-2 max-w-xs text-sm text-[#80634e]">
              Your Fresh Stock Xchange account is ready for your next order.
            </p>
          </div>
        )}

        <div className="flex flex-1 flex-col px-4 py-4 sm:px-7 sm:py-6">
          <div className="rounded-2xl border border-[#ead7c3] bg-white p-5 shadow-sm sm:p-6">
          {!otpSent ? (
            <>
              <div className="mb-5 flex flex-col items-center text-center">
                <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fbf1e6] text-[#C8651B]">
                  <img
                    src={loginFishIcon}
                    alt=""
                    aria-hidden="true"
                    className="h-11 w-11 object-contain"
                    style={{ filter: "brightness(0) saturate(100%) invert(55%) sepia(90%) saturate(700%) hue-rotate(340deg) brightness(105%)" }}
                  />
                </span>
                <h2 className="font-display text-xl font-bold leading-snug text-[#7B3A14] sm:text-2xl">
                  Fresh catch starts here
                </h2>
                <p className="mt-2 text-sm font-medium text-[#80634e]">
                  Sign in to explore today’s seafood and place your order.
                </p>
              </div>

              <div className="mb-5">
                <label htmlFor="customer-login-phone" className="mb-2 block text-sm font-semibold text-[#542813]">
                  WhatsApp mobile number
                </label>
                <div
                  className="flex items-center gap-3 rounded-xl border-2 bg-[#fffaf4] px-3 py-3"
                  style={{ borderColor: focused ? BRAND_ORANGE : isFull ? `${BRAND_BROWN}88` : "#ead7c3" }}
                >
                  <div className="flex shrink-0 items-center gap-1.5 border-r border-[#e6d4c1] pr-3">
                    <img src={flagImg} alt="India" className="h-6 w-6 rounded-full object-cover" />
                    <span className="text-base font-bold text-[#542813]">+91</span>
                  </div>
                  <input
                    ref={phoneRef}
                    id="customer-login-phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={handlePhoneChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="0000000000"
                    className="w-full flex-1 bg-transparent text-xl font-semibold tracking-[0.12em] text-[#392719] outline-none placeholder:text-[#c8b6a8] placeholder:font-normal placeholder:text-lg placeholder:tracking-normal"
                    style={{ caretColor: BRAND_ORANGE }}
                    data-testid="input-phone"
                  />
                </div>
              </div>

              <SolidButton
                color={BRAND_ORANGE}
                onClick={handlePhoneSubmit}
                disabled={loading || !isFull}
                loading={loading}
                loadingText="Sending OTP..."
                testId="button-send-otp"
              >
                Continue
              </SolidButton>

              <p className="mt-3 text-center text-xs leading-relaxed text-[#80634e]">
                We’ll send a one-time sign-in code to this number.
              </p>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-[#8c796a]">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="font-semibold text-[#7B3A14] underline underline-offset-2">Terms</Link>
                {" & "}
                <Link href="/privacy" className="font-semibold text-[#7B3A14] underline underline-offset-2">Privacy Policy</Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-5 flex flex-col items-center text-center">
                <span className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fbf1e6]">
                  <img
                    src={otpFishIcon}
                    alt=""
                    aria-hidden="true"
                    className="h-10 w-10 object-contain"
                    style={{ filter: "brightness(0) saturate(100%) invert(24%) sepia(47%) saturate(1232%) hue-rotate(351deg) brightness(87%) contrast(92%)" }}
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#C8651B] text-white">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </span>
                <h3 className="font-display text-xl font-bold text-[#7B3A14] sm:text-2xl">Verify your number</h3>
                <p className="mt-1 text-sm text-[#80634e]">Enter the one-time code sent to WhatsApp at</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#542813]">+91 {phone}</p>
                  <button
                    className="text-xs font-bold text-[#C8651B] underline"
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(createEmptyOtp()); }}
                    data-testid="button-back-to-phone"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="mb-5 flex justify-center gap-1.5 sm:gap-2">
                {otpRefs.map((ref, i) => {
                  const isFocused = focusedOtpIndex === i;
                  return (
                    <input
                      key={i}
                      ref={ref}
                      type="tel"
                      inputMode="numeric"
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      maxLength={i === 0 ? OTP_DIGIT_COUNT : 1}
                      value={otp[i]}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onPaste={handleOtpPaste}
                      onFocus={() => setFocusedOtpIndex(i)}
                      onBlur={() => setFocusedOtpIndex(null)}
                      className="h-12 w-10 rounded-xl border-2 text-center text-xl font-bold outline-none sm:h-[54px] sm:w-[46px] sm:rounded-2xl sm:text-2xl"
                      style={{
                        borderColor: isFocused ? BRAND_HIGHLIGHT : "#ead7c3",
                        background: "#fffaf4",
                        color: BRAND_BROWN,
                        caretColor: BRAND_ORANGE,
                        boxShadow: isFocused ? `0 0 0 3px ${BRAND_ORANGE}33` : "none",
                      }}
                      data-testid={`input-otp-digit-${i}`}
                    />
                  );
                })}
              </div>

              <SolidButton
                color={BRAND_BROWN}
                onClick={handleOtpSubmit}
                disabled={loading || otp.join("").length !== OTP_DIGIT_COUNT}
                loading={loading}
                loadingText="Verifying..."
                testId="button-verify-otp"
              >
                Verify
              </SolidButton>

              <p className="mt-4 text-center text-[13px] text-[#8c796a]">
                Didn't get it?{" "}
                <button
                  type="button"
                  className="font-semibold text-[#C8651B] underline underline-offset-2"
                  onClick={handlePhoneSubmit}
                  disabled={loading}
                  data-testid="button-resend-otp"
                >
                  Resend OTP
                </button>
              </p>
            </>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
