"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown, Pencil, Check } from "lucide-react";
import {
  BrandLeaf,
  HeroProduce,
  FloatingLemon,
  FloatingTomato,
  SuccessBadge,
  PinIcon,
} from "./art";

type AreaOption = { id: string; label: string; city: string };
type Step = "welcome" | "phone" | "otp" | "shop" | "done";
type Mode = "signup" | "login";

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिंदी" },
  { id: "ta", label: "தமிழ்" },
];

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export function OnboardingFlow({
  businessTypes,
  areas,
}: {
  businessTypes: string[];
  areas: AreaOption[];
}) {
  const router = useRouter();

  const [step, setStep] = React.useState<Step>("welcome");
  const [mode, setMode] = React.useState<Mode>("signup");
  const [lang, setLang] = React.useState("en");

  // phone / otp
  const [phone, setPhone] = React.useState("");
  const [challenge, setChallenge] = React.useState("");
  const [devCode, setDevCode] = React.useState<string | null>(null);
  const [phoneDisplay, setPhoneDisplay] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [verifiedToken, setVerifiedToken] = React.useState("");
  const [resendIn, setResendIn] = React.useState(0);

  // shop
  const [shopName, setShopName] = React.useState("");
  const [businessType, setBusinessType] = React.useState(businessTypes[0] ?? "");
  const [areaId, setAreaId] = React.useState("");

  const [redirectTo, setRedirectTo] = React.useState("/");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // resend countdown
  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  function goPhone(m: Mode) {
    setMode(m);
    setError(null);
    setStep("phone");
  }

  async function requestCode() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send the code");
        return false;
      }
      setChallenge(data.challenge);
      setDevCode(data.devCode ?? null);
      setPhoneDisplay(data.phoneDisplay ?? phone);
      setResendIn(RESEND_SECONDS);
      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function onPhoneContinue(e: React.FormEvent) {
    e.preventDefault();
    const ok = await requestCode();
    if (ok) {
      setOtp("");
      setStep("otp");
    }
  }

  async function onResend() {
    if (resendIn > 0 || loading) return;
    setOtp("");
    await requestCode();
  }

  async function verifyCode(code: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not verify the code");
        setOtp("");
        return;
      }
      if (data.status === "logged_in") {
        // Returning phone account — straight into the app.
        setRedirectTo(data.redirect ?? "/");
        router.push(data.redirect ?? "/");
        router.refresh();
        return;
      }
      setVerifiedToken(data.verifiedToken);
      setStep("shop");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onShopContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!areaId) {
      setError("Please choose your delivery area.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verifiedToken,
          shopName,
          businessType,
          areaId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not finish setup");
        return;
      }
      setRedirectTo(data.redirect ?? "/");
      router.refresh();
      setStep("done");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function finish() {
    router.push(redirectTo);
    router.refresh();
  }

  const selectedArea = areas.find((a) => a.id === areaId) ?? null;

  return (
    <div className="font-jakarta">
      {step === "welcome" && (
        <WelcomeScreen
          lang={lang}
          onLang={setLang}
          onGetStarted={() => goPhone("signup")}
          onHaveAccount={() => goPhone("login")}
        />
      )}

      {step === "phone" && (
        <PhoneScreen
          mode={mode}
          phone={phone}
          onPhone={setPhone}
          loading={loading}
          error={error}
          onSubmit={onPhoneContinue}
        />
      )}

      {step === "otp" && (
        <OtpScreen
          phoneDisplay={phoneDisplay}
          otp={otp}
          onOtp={setOtp}
          devCode={devCode}
          resendIn={resendIn}
          loading={loading}
          error={error}
          onVerify={() => verifyCode(otp)}
          onComplete={(c) => verifyCode(c)}
          onResend={onResend}
          onEdit={() => {
            setError(null);
            setStep("phone");
          }}
        />
      )}

      {step === "shop" && (
        <ShopScreen
          shopName={shopName}
          onShopName={setShopName}
          businessTypes={businessTypes}
          businessType={businessType}
          onBusinessType={setBusinessType}
          areas={areas}
          selectedArea={selectedArea}
          onArea={setAreaId}
          loading={loading}
          error={error}
          onSubmit={onShopContinue}
        />
      )}

      {step === "done" && (
        <DoneScreen shopName={shopName} onStart={finish} />
      )}
    </div>
  );
}

/* ─────────────────────────── shared UI ─────────────────────────── */

const SCREEN = "relative flex min-h-[100dvh] flex-col overflow-hidden";

function ErrorNote({ message, dark }: { message: string; dark?: boolean }) {
  return (
    <div
      role="alert"
      className={
        dark
          ? "mt-3 rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm font-medium text-white"
          : "mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
      }
    >
      {message}
    </div>
  );
}

function YellowButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#FFC233] px-4 py-[18px] text-[17px] font-bold text-[#0A3D1E] shadow-[0_10px_24px_rgba(0,0,0,.22)] transition active:scale-[.99] disabled:opacity-60"
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
}

function GreenButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#129E47] px-4 py-[18px] text-[17px] font-bold text-white shadow-[0_10px_24px_rgba(18,158,71,.28)] transition active:scale-[.99] disabled:opacity-60"
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
}

function Progress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="relative z-[2] flex gap-[7px]">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={
            i <= step
              ? "h-1.5 w-[26px] rounded-full bg-[#129E47]"
              : "h-1.5 w-[14px] rounded-full bg-[#CBD5C9]"
          }
        />
      ))}
    </div>
  );
}

/* ─────────────────────────── 01 · welcome ─────────────────────────── */

function WelcomeScreen({
  lang,
  onLang,
  onGetStarted,
  onHaveAccount,
}: {
  lang: string;
  onLang: (id: string) => void;
  onGetStarted: () => void;
  onHaveAccount: () => void;
}) {
  return (
    <div
      className={`${SCREEN} bg-[linear-gradient(170deg,#0C7A3C_0%,#0A5C2E_60%,#084A26_100%)] px-[26px] pb-10 pt-[62px]`}
    >
      <div className="pointer-events-none absolute -left-10 -top-16 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,.45),transparent_70%)]" />

      <div className="relative z-[2] flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
          <BrandLeaf size={20} />
        </span>
        <span className="font-display text-lg font-extrabold tracking-tight text-white">
          FreshKart
        </span>
      </div>

      <div className="relative z-[2] mt-4 flex gap-2">
        {LANGUAGES.map((l) => {
          const active = l.id === lang;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onLang(l.id)}
              className={
                active
                  ? "rounded-full bg-white/[.16] px-3.5 py-[7px] text-[13px] font-semibold text-white"
                  : "rounded-full border border-white/30 px-3.5 py-[7px] text-[13px] font-semibold text-white/[.78]"
              }
            >
              {l.label}
            </button>
          );
        })}
      </div>

      <div className="relative z-[2] flex flex-1 items-center justify-center">
        <HeroProduce className="animate-floaty" />
      </div>

      <div className="relative z-[2]">
        <h1 className="font-display text-[34px] font-extrabold leading-[1.08] tracking-tight text-white text-balance">
          Fresh produce,
          <br />
          before you open.
        </h1>
        <p className="mt-3.5 max-w-[300px] text-[15.5px] leading-relaxed text-white/[.82]">
          Wholesale fruits &amp; vegetables for your store — graded, priced, and
          at your door by 6&nbsp;AM.
        </p>
        <div className="mt-6">
          <YellowButton type="button" onClick={onGetStarted}>
            Get started
          </YellowButton>
        </div>
        <button
          type="button"
          onClick={onHaveAccount}
          className="mt-3 w-full rounded-2xl py-3.5 text-[15px] font-semibold text-white/90"
        >
          I already have an account
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── 02 · mobile number ─────────────────────────── */

function PhoneScreen({
  mode,
  phone,
  onPhone,
  loading,
  error,
  onSubmit,
}: {
  mode: Mode;
  phone: string;
  onPhone: (v: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={`${SCREEN} bg-[#FBFBF6] px-[26px] pb-10 pt-[74px]`}
    >
      <div className="absolute -right-8 top-12 animate-floaty opacity-90">
        <FloatingLemon />
      </div>

      <Progress step={1} />

      <h1 className="relative z-[2] mt-[30px] font-display text-[28px] font-extrabold leading-[1.1] tracking-tight text-[#14271B]">
        {mode === "login" ? (
          <>
            Welcome back —
            <br />
            your mobile number?
          </>
        ) : (
          <>
            What&apos;s your
            <br />
            mobile number?
          </>
        )}
      </h1>
      <p className="relative z-[2] mt-3 text-[15px] leading-relaxed text-[#5F7065]">
        We&apos;ll send a 6-digit code to verify the shop owner.
      </p>

      <div className="relative z-[2] mt-[30px] flex gap-2.5">
        <div className="flex h-[60px] items-center gap-1.5 rounded-2xl border-[1.5px] border-[#E3E8E0] bg-white px-4 text-[17px] font-semibold text-[#14271B]">
          🇮🇳 +91
          <ChevronDown className="h-3.5 w-3.5 text-[#5F7065]" />
        </div>
        <input
          autoFocus
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="98765 43210"
          value={phone}
          onChange={(e) => onPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
          className="h-[60px] w-full rounded-2xl border-[1.5px] border-[#129E47] bg-white px-4 text-[19px] font-semibold tracking-wide text-[#14271B] shadow-[0_0_0_4px_rgba(18,158,71,.1)] outline-none placeholder:text-[#B6C2B8]"
        />
      </div>
      <p className="relative z-[2] mt-3.5 text-[13px] text-[#8A9A8E]">
        Standard SMS rates may apply.
      </p>

      {error && <ErrorNote message={error} />}

      <div className="relative z-[2] mt-auto pt-8">
        <GreenButton type="submit" loading={loading} disabled={phone.length < 10}>
          Continue
        </GreenButton>
        <p className="mt-4 text-center text-xs leading-relaxed text-[#8A9A8E]">
          By continuing you agree to FreshKart&apos;s{" "}
          <span className="font-semibold text-[#129E47]">Terms</span> &amp;{" "}
          <span className="font-semibold text-[#129E47]">Privacy Policy</span>.
        </p>
        <p className="mt-3 text-center text-[13px] text-[#8A9A8E]">
          <Link href="/login" className="font-semibold text-[#129E47]">
            Sign in with email instead
          </Link>
        </p>
      </div>
    </form>
  );
}

/* ─────────────────────────── 03 · verify code ─────────────────────────── */

function OtpScreen({
  phoneDisplay,
  otp,
  onOtp,
  devCode,
  resendIn,
  loading,
  error,
  onVerify,
  onComplete,
  onResend,
  onEdit,
}: {
  phoneDisplay: string;
  otp: string;
  onOtp: (v: string) => void;
  devCode: string | null;
  resendIn: number;
  loading: boolean;
  error: string | null;
  onVerify: () => void;
  onComplete: (code: string) => void;
  onResend: () => void;
  onEdit: () => void;
}) {
  return (
    <div className={`${SCREEN} bg-[#FBFBF6] px-[26px] pb-10 pt-[74px]`}>
      <div className="absolute -right-7 top-[54px] animate-floaty-slow">
        <FloatingTomato />
      </div>

      <Progress step={2} />

      <h1 className="relative z-[2] mt-[30px] font-display text-[28px] font-extrabold leading-[1.1] tracking-tight text-[#14271B]">
        Enter the code
      </h1>
      <p className="relative z-[2] mt-3 text-[15px] leading-relaxed text-[#5F7065]">
        Sent to {phoneDisplay} ·{" "}
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 font-semibold text-[#129E47]"
        >
          <Pencil className="h-3 w-3" /> Edit
        </button>
      </p>

      <div className="relative z-[2] mt-[30px]">
        <OtpInput
          value={otp}
          onChange={onOtp}
          length={OTP_LENGTH}
          disabled={loading}
          onComplete={onComplete}
        />
      </div>

      {devCode && (
        <button
          type="button"
          onClick={() => {
            onOtp(devCode);
            onComplete(devCode);
          }}
          className="relative z-[2] mt-4 flex w-full items-center justify-between gap-2 rounded-xl border border-dashed border-[#129E47]/40 bg-[#129E47]/[.06] px-3.5 py-2.5 text-left"
        >
          <span className="text-[13px] text-[#3A6B49]">
            Demo mode — no SMS sent. Your code is{" "}
            <span className="font-bold tracking-widest text-[#0A5C2E]">
              {devCode}
            </span>
          </span>
          <span className="shrink-0 rounded-lg bg-[#129E47] px-2.5 py-1 text-xs font-semibold text-white">
            Autofill
          </span>
        </button>
      )}

      <p className="relative z-[2] mt-[18px] text-sm text-[#8A9A8E]">
        Didn&apos;t get it?{" "}
        {resendIn > 0 ? (
          <>
            Resend in{" "}
            <span className="font-semibold text-[#14271B]">
              0:{String(resendIn).padStart(2, "0")}
            </span>
          </>
        ) : (
          <button
            type="button"
            onClick={onResend}
            className="font-semibold text-[#129E47]"
          >
            Resend code
          </button>
        )}
      </p>

      {error && <ErrorNote message={error} />}

      <div className="relative z-[2] mt-auto pt-8">
        <GreenButton
          type="button"
          loading={loading}
          disabled={otp.length < OTP_LENGTH}
          onClick={onVerify}
        >
          Verify &amp; continue
        </GreenButton>
      </div>
    </div>
  );
}

function OtpInput({
  value,
  onChange,
  length,
  disabled,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  length: number;
  disabled?: boolean;
  onComplete?: (code: string) => void;
}) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length }, (_, i) => value[i] ?? "");

  function setChar(i: number, ch: string) {
    const next = (value.slice(0, i) + ch + value.slice(i + 1)).slice(0, length);
    onChange(next);
    return next;
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setChar(i, "");
      return;
    }
    const digit = raw[raw.length - 1];
    const next = setChar(i, digit);
    if (i < length - 1) refs.current[i + 1]?.focus();
    // value is always contiguous (gaps collapse), so length implies complete
    if (next.length === length) onComplete?.(next);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (chars[i]) setChar(i, "");
      else if (i > 0) {
        refs.current[i - 1]?.focus();
        setChar(i - 1, "");
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    onChange(text);
    refs.current[Math.min(text.length, length - 1)]?.focus();
    if (text.length === length) onComplete?.(text);
  }

  const activeIdx = Math.min(value.length, length - 1);

  return (
    <div className="flex gap-2.5">
      {chars.map((ch, i) => {
        const filled = ch !== "";
        const isActive = i === activeIdx;
        const border = isActive
          ? "border-[#129E47]"
          : filled
            ? "border-[#CBD5C9]"
            : "border-[#E3E8E0]";
        const bg = filled || isActive ? "bg-white" : "bg-[#F6F8F3]";
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={ch}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            autoFocus={i === 0}
            className={`h-[60px] w-full min-w-0 rounded-[14px] border-[1.5px] text-center text-2xl font-bold text-[#14271B] caret-[#129E47] outline-none ${border} ${bg} ${
              isActive ? "shadow-[0_0_0_4px_rgba(18,158,71,.12)]" : ""
            }`}
          />
        );
      })}
    </div>
  );
}

/* ─────────────────────────── 04 · shop details ─────────────────────────── */

function ShopScreen({
  shopName,
  onShopName,
  businessTypes,
  businessType,
  onBusinessType,
  areas,
  selectedArea,
  onArea,
  loading,
  error,
  onSubmit,
}: {
  shopName: string;
  onShopName: (v: string) => void;
  businessTypes: string[];
  businessType: string;
  onBusinessType: (v: string) => void;
  areas: AreaOption[];
  selectedArea: AreaOption | null;
  onArea: (id: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={`${SCREEN} bg-[#FBFBF6] px-[26px] pb-10 pt-[74px]`}
    >
      <Progress step={3} />

      <h1 className="mt-[30px] font-display text-[28px] font-extrabold leading-[1.1] tracking-tight text-[#14271B]">
        Set up your shop
      </h1>

      <label className="mb-2 mt-[26px] block text-[13px] font-semibold text-[#5F7065]">
        SHOP NAME
      </label>
      <input
        required
        value={shopName}
        onChange={(e) => onShopName(e.target.value)}
        placeholder="Sri Balaji Stores"
        className="h-14 w-full rounded-2xl border-[1.5px] border-[#E3E8E0] bg-white px-4 text-base font-semibold text-[#14271B] outline-none focus:border-[#129E47] focus:shadow-[0_0_0_4px_rgba(18,158,71,.1)] placeholder:text-[#B6C2B8]"
      />

      <label className="mb-2.5 mt-[22px] block text-[13px] font-semibold text-[#5F7065]">
        BUSINESS TYPE
      </label>
      <div className="flex flex-wrap gap-2.5">
        {businessTypes.map((t) => {
          const active = t === businessType;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onBusinessType(t)}
              className={
                active
                  ? "flex items-center gap-1.5 rounded-full bg-[#129E47] px-4 py-2.5 text-sm font-semibold text-white"
                  : "rounded-full border-[1.5px] border-[#E3E8E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#5F7065]"
              }
            >
              {active && <Check className="h-3.5 w-3.5" />}
              {t}
            </button>
          );
        })}
      </div>

      <label className="mb-2 mt-[22px] block text-[13px] font-semibold text-[#5F7065]">
        DELIVERY AREA
      </label>
      <AreaPicker areas={areas} selected={selectedArea} onSelect={onArea} />

      {error && <ErrorNote message={error} />}

      <div className="mt-auto pt-8">
        <GreenButton type="submit" loading={loading} disabled={shopName.trim().length < 2}>
          Continue
        </GreenButton>
      </div>
    </form>
  );
}

function AreaPicker({
  areas,
  selected,
  onSelect,
}: {
  areas: AreaOption[];
  selected: AreaOption | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-full items-center gap-2.5 rounded-2xl border-[1.5px] border-[#E3E8E0] bg-white px-4 text-left outline-none focus:border-[#129E47]"
      >
        <PinIcon />
        <span
          className={`flex-1 text-base font-semibold ${selected ? "text-[#14271B]" : "text-[#B6C2B8]"}`}
        >
          {selected ? selected.label : "Choose your area"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[#5F7065] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-[#E3E8E0] bg-white p-1.5 shadow-[0_16px_40px_rgba(0,0,0,.14)]">
          {areas.map((a) => {
            const active = selected?.id === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  onSelect(a.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium ${
                  active ? "bg-[#129E47]/10 text-[#0A5C2E]" : "text-[#14271B] hover:bg-gray-50"
                }`}
              >
                <PinIcon size={15} />
                {a.label}
                {active && <Check className="ml-auto h-4 w-4 text-[#129E47]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── 05 · all set ─────────────────────────── */

function DoneScreen({
  shopName,
  onStart,
}: {
  shopName: string;
  onStart: () => void;
}) {
  return (
    <div
      className={`${SCREEN} bg-[linear-gradient(170deg,#0C7A3C_0%,#0A5C2E_70%)] px-[26px] pb-10 pt-[74px]`}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,.5),transparent_70%)]" />

      <div className="relative z-[2] flex flex-1 flex-col items-center justify-center">
        <div className="animate-pop">
          <SuccessBadge />
        </div>
        <h1 className="mt-[30px] font-display text-3xl font-extrabold tracking-tight text-white">
          You&apos;re all set!
        </h1>
        <p className="mt-3 max-w-[290px] text-center text-[15.5px] leading-relaxed text-white/[.82]">
          {shopName ? `${shopName} is verified.` : "Your shop is verified."}{" "}
          Browse today&apos;s fresh arrivals and place your first order.
        </p>
        <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-white/[.18] bg-white/[.12] px-[18px] py-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 13h2l2 5h10l3-9H6"
              stroke="#FFC233"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="20" r="1.5" fill="#FFC233" />
            <circle cx="17" cy="20" r="1.5" fill="#FFC233" />
          </svg>
          <span className="text-sm font-semibold text-white">
            Free delivery on your first 3 orders
          </span>
        </div>
      </div>

      <div className="relative z-[2]">
        <YellowButton type="button" onClick={onStart}>
          Start ordering
        </YellowButton>
      </div>
    </div>
  );
}
