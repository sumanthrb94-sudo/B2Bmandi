"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * FreshCart onboarding — a full-bleed, branded sign-up & login flow.
 * Faithful to the supplied design (Greengrocer palette, Bricolage display font,
 * pillowy radii). Five steps: Welcome → Mobile → OTP → Shop details → All set.
 *
 * Demo bridge: at "Shop details → Continue" we create a real BUYER account via
 * the existing /api/auth/register endpoint (which sets the session cookie), so
 * the closed demo loop keeps working without any SMS backend. Returning users
 * ("I already have an account") sign in with the seeded demo accounts.
 */

// ── Greengrocer palette (from the design's default theme) ──
const P = {
  primary: "#129E47",
  g1: "#0C7A3C",
  g2: "#0A5C2E",
  g3: "#084A26",
  accent: "#FFC233",
  accentInk: "#0A3D1E",
  glow: "34,197,94",
  ring1: "#16A34A",
  ring2: "#22C55E",
  blobSoft: "#FFE7AE",
  blobCore: "#FFC233",
};
const HERO_GRAD = `linear-gradient(170deg, ${P.g1} 0%, ${P.g2} 62%, ${P.g3} 100%)`;
const INK = "#14271B";
const MUTED = "#5F7065";
const FAINT = "#8A9A8E";
const BORDER = "#E3E8E0";
const SURFACE = "#FBFBF6";
const FIELD = "#F6F8F3";
const DOT = "#CBD5C9";
const R_BTN = 18;
const R_FIELD = 16;
const R_PILL = 999;
const DISPLAY = "'Bricolage Grotesque', sans-serif";

type Step = "welcome" | "phone" | "otp" | "shop" | "done";

const BIZ_TYPES = [
  "Kirana store",
  "Restaurant",
  "Hotel",
  "Cloud kitchen",
  "Reseller",
] as const;

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("welcome");
  const [signinOpen, setSigninOpen] = React.useState(false);

  // form state
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState<string[]>(["", "", "", "", "", ""]);
  const [shopName, setShopName] = React.useState("Sri Balaji Stores");
  const [bizType, setBizType] = React.useState<string>("Kirana store");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const phoneDigits = phone.replace(/\D/g, "");

  function go(next: Step) {
    setError(null);
    setStep(next);
  }

  // ── OTP box handlers ──
  function setOtpAt(i: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const copy = [...prev];
      copy[i] = digit;
      return copy;
    });
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  }
  function onOtpKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }
  const otpComplete = otp.every((d) => d !== "");

  // ── Finalize: create a real session via register (login fallback) ──
  async function finishOnboarding() {
    setSubmitting(true);
    setError(null);
    const email = `shop.${phoneDigits}@freshcart.demo`;
    const password = `Fresh${phoneDigits}`;
    const payload = {
      name: shopName.trim() || "Shop Owner",
      businessName: shopName.trim() || undefined,
      businessType: bizType,
      email,
      phone: `+91 ${phoneDigits}`,
      city: "Bengaluru",
      password,
    };
    try {
      let res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // Same phone onboarded before → just sign that demo account back in.
      if (res.status === 409) {
        res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not complete sign-up. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      go("done");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  function startOrdering() {
    router.push("/");
    router.refresh();
  }

  // ── shared bits ──
  const primaryBtn: React.CSSProperties = {
    width: "100%",
    padding: 17,
    border: "none",
    borderRadius: R_BTN,
    background: P.primary,
    color: "#fff",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(0,0,0,.16)",
  };
  const accentBtn: React.CSSProperties = {
    ...primaryBtn,
    background: P.accent,
    color: P.accentInk,
    boxShadow: "0 10px 24px rgba(0,0,0,.22)",
  };

  function Dots({ filled }: { filled: number }) {
    return (
      <div style={{ display: "flex", gap: 7, position: "relative", zIndex: 2 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i < filled ? 26 : 14,
              height: 6,
              borderRadius: 3,
              background: i < filled ? P.primary : DOT,
              transition: "width .2s ease",
            }}
          />
        ))}
      </div>
    );
  }

  // ════════════════════════ WELCOME ════════════════════════
  if (step === "welcome") {
    return (
      <Screen bg={HERO_GRAD} pad="34px 24px 30px">
        <div
          style={{
            position: "absolute",
            top: -60,
            left: -40,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${P.glow},.45), transparent 70%)`,
          }}
        />
        {/* language pills */}
        <div style={{ display: "flex", gap: 8, position: "relative", zIndex: 2 }}>
          <LangPill active>English</LangPill>
          <LangPill>हिंदी</LangPill>
          <LangPill>தமிழ்</LangPill>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <ProduceBasket />
        </div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 34,
              lineHeight: 1.08,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            Fresh produce,
            <br />
            before you open.
          </div>
          <div
            style={{
              fontSize: 15.5,
              lineHeight: 1.5,
              color: "rgba(255,255,255,.82)",
              marginTop: 14,
              maxWidth: 320,
            }}
          >
            Wholesale fruits &amp; vegetables for your store — graded, priced, and
            at your door by 6 AM.
          </div>
          <button style={{ ...accentBtn, marginTop: 24 }} onClick={() => go("phone")}>
            Get started
          </button>
          <button
            style={{
              width: "100%",
              marginTop: 12,
              padding: 13,
              border: "none",
              borderRadius: R_FIELD,
              background: "transparent",
              color: "rgba(255,255,255,.9)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => setSigninOpen(true)}
          >
            I already have an account
          </button>
        </div>

        {signinOpen && (
          <SignInSheet onClose={() => setSigninOpen(false)} />
        )}
      </Screen>
    );
  }

  // ════════════════════════ MOBILE NUMBER ════════════════════════
  if (step === "phone") {
    return (
      <Screen bg={SURFACE} pad="40px 24px 30px">
        <SoftBlob top={30} right={-30} />
        <Dots filled={1} />
        <Heading style={{ marginTop: 28 }}>
          What&apos;s your
          <br />
          mobile number?
        </Heading>
        <Sub>We&apos;ll send a 6-digit code to verify the shop owner.</Sub>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 28,
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0 16px",
              height: 60,
              borderRadius: R_FIELD,
              border: `1.5px solid ${BORDER}`,
              background: "#fff",
              fontSize: 17,
              fontWeight: 600,
              color: INK,
            }}
          >
            🇮🇳 +91
            <svg width="11" height="7" viewBox="0 0 11 7">
              <path
                d="M1 1l4.5 4L10 1"
                stroke={MUTED}
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            autoFocus
            inputMode="numeric"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="98765 43210"
            style={{
              flex: 1,
              height: 60,
              borderRadius: R_FIELD,
              border: `1.5px solid ${P.primary}`,
              background: "#fff",
              padding: "0 16px",
              boxShadow: `0 0 0 4px rgba(${P.glow},.16)`,
              fontSize: 19,
              fontWeight: 600,
              color: INK,
              letterSpacing: "0.5px",
              outline: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          />
        </div>
        <div style={{ fontSize: 13, color: FAINT, marginTop: 14, position: "relative", zIndex: 2 }}>
          Standard SMS rates may apply.
        </div>

        {error && <ErrorNote>{error}</ErrorNote>}

        <div style={{ marginTop: "auto", position: "relative", zIndex: 2 }}>
          <button
            style={{ ...primaryBtn, opacity: phoneDigits.length === 10 ? 1 : 0.5 }}
            disabled={phoneDigits.length !== 10}
            onClick={() => go("otp")}
          >
            Continue
          </button>
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: FAINT,
              marginTop: 16,
              lineHeight: 1.5,
            }}
          >
            By continuing you agree to FreshCart&apos;s
            <br />
            <span style={{ color: P.primary, fontWeight: 600 }}>Terms</span> &amp;{" "}
            <span style={{ color: P.primary, fontWeight: 600 }}>Privacy Policy</span>.
          </div>
        </div>
      </Screen>
    );
  }

  // ════════════════════════ OTP ════════════════════════
  if (step === "otp") {
    return (
      <Screen bg={SURFACE} pad="40px 24px 30px">
        <SoftBlob top={36} right={-26} fruit />
        <Dots filled={2} />
        <Heading style={{ marginTop: 28 }}>Enter the code</Heading>
        <Sub>
          Sent to +91 {phoneDigits.replace(/(\d{5})(\d{5})/, "$1 $2") || "98765 43210"} ·{" "}
          <button
            onClick={() => go("phone")}
            style={{
              color: P.primary,
              fontWeight: 600,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              font: "inherit",
            }}
          >
            Edit
          </button>
        </Sub>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 28,
            position: "relative",
            zIndex: 2,
          }}
        >
          {otp.map((v, i) => {
            const active = !v && otp.findIndex((d) => d === "") === i;
            return (
              <input
                key={i}
                ref={(el) => {
                  otpRefs.current[i] = el;
                }}
                autoFocus={i === 0}
                inputMode="numeric"
                value={v}
                onChange={(e) => setOtpAt(i, e.target.value)}
                onKeyDown={(e) => onOtpKey(i, e)}
                style={{
                  flex: 1,
                  width: 0,
                  minWidth: 0,
                  height: 60,
                  textAlign: "center",
                  borderRadius: R_FIELD,
                  fontSize: 24,
                  fontWeight: 700,
                  color: INK,
                  border: `1.5px solid ${v || active ? P.primary : BORDER}`,
                  background: v || active ? "#fff" : FIELD,
                  boxShadow: active ? `0 0 0 4px rgba(${P.glow},.18)` : "none",
                  outline: "none",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
            );
          })}
        </div>

        <div style={{ fontSize: 14, color: FAINT, marginTop: 18, position: "relative", zIndex: 2 }}>
          Didn&apos;t get it? Resend in{" "}
          <span style={{ color: INK, fontWeight: 600 }}>0:24</span>
        </div>

        {error && <ErrorNote>{error}</ErrorNote>}

        <div style={{ marginTop: "auto", position: "relative", zIndex: 2 }}>
          <button
            style={{ ...primaryBtn, opacity: otpComplete ? 1 : 0.5 }}
            disabled={!otpComplete}
            onClick={() => go("shop")}
          >
            Verify &amp; continue
          </button>
        </div>
      </Screen>
    );
  }

  // ════════════════════════ SHOP DETAILS ════════════════════════
  if (step === "shop") {
    return (
      <Screen bg={SURFACE} pad="40px 24px 30px">
        <Dots filled={3} />
        <Heading style={{ marginTop: 28 }}>Set up your shop</Heading>

        <FieldLabel style={{ marginTop: 24 }}>SHOP NAME</FieldLabel>
        <input
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          style={{
            height: 56,
            borderRadius: R_FIELD,
            border: `1.5px solid ${BORDER}`,
            background: "#fff",
            padding: "0 16px",
            fontSize: 16,
            fontWeight: 600,
            color: INK,
            outline: "none",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        />

        <FieldLabel style={{ marginTop: 20, marginBottom: 10 }}>BUSINESS TYPE</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
          {BIZ_TYPES.map((t) => {
            const on = bizType === t;
            return (
              <button
                key={t}
                onClick={() => setBizType(t)}
                style={{
                  padding: "11px 16px",
                  borderRadius: R_PILL,
                  border: on ? "none" : `1.5px solid ${BORDER}`,
                  background: on ? P.primary : "#fff",
                  color: on ? "#fff" : MUTED,
                  fontSize: 14,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {on && (
                  <svg width="13" height="13" viewBox="0 0 14 14">
                    <path
                      d="M2 7.5l3.5 3.5L12 3"
                      stroke="#fff"
                      strokeWidth="2.2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {t}
              </button>
            );
          })}
        </div>

        <FieldLabel style={{ marginTop: 20 }}>DELIVERY AREA</FieldLabel>
        <div
          style={{
            height: 56,
            borderRadius: R_FIELD,
            border: `1.5px solid ${BORDER}`,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 16px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7Z"
              fill={P.primary}
            />
            <circle cx="12" cy="9" r="2.5" fill="#fff" />
          </svg>
          <span style={{ fontSize: 16, fontWeight: 600, color: INK }}>
            Bengaluru · KR Market
          </span>
        </div>

        {error && <ErrorNote>{error}</ErrorNote>}

        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <button
            style={{ ...primaryBtn, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
            onClick={finishOnboarding}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Setting up…" : "Continue"}
          </button>
        </div>
      </Screen>
    );
  }

  // ════════════════════════ ALL SET ════════════════════════
  return (
    <Screen bg={HERO_GRAD} pad="40px 24px 30px">
      <div
        style={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${P.glow},.5), transparent 70%)`,
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 160,
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pop .7s cubic-bezier(.2,.8,.2,1) both",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "rgba(255,255,255,.12)",
            }}
          />
          <div
            style={{
              width: 108,
              height: 108,
              borderRadius: "50%",
              background: P.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 30px rgba(0,0,0,.25)",
            }}
          >
            <svg width="52" height="52" viewBox="0 0 52 52">
              <path
                d="M14 27l9 9 16-19"
                stroke={P.accentInk}
                strokeWidth="5.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ position: "absolute", top: 6, left: 10, animation: "floatY 4.5s ease-in-out infinite" }}>
            <svg width="30" height="30" viewBox="0 0 30 30">
              <circle cx="15" cy="15" r="12" fill="#FF5E3A" />
            </svg>
          </div>
          <div style={{ position: "absolute", bottom: 8, right: 6, animation: "floatY 5.5s ease-in-out infinite .6s" }}>
            <svg width="26" height="26" viewBox="0 0 26 26">
              <ellipse cx="13" cy="13" rx="12" ry="10" fill="#22C55E" />
            </svg>
          </div>
        </div>

        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 30,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginTop: 28,
          }}
        >
          You&apos;re all set!
        </div>
        <div
          style={{
            fontSize: 15.5,
            lineHeight: 1.5,
            color: "rgba(255,255,255,.82)",
            textAlign: "center",
            marginTop: 12,
            maxWidth: 300,
          }}
        >
          {shopName.trim() || "Your shop"} is verified. Browse today&apos;s fresh
          arrivals and place your first order.
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 22,
            padding: "12px 18px",
            borderRadius: R_FIELD,
            background: "rgba(255,255,255,.12)",
            border: "1px solid rgba(255,255,255,.18)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 13h2l2 5h10l3-9H6"
              stroke={P.accent}
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="20" r="1.5" fill={P.accent} />
            <circle cx="17" cy="20" r="1.5" fill={P.accent} />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
            Free delivery on your first 3 orders
          </span>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <button style={accentBtn} onClick={startOrdering}>
          Start ordering
        </button>
      </div>
    </Screen>
  );
}

// ─────────────────────────── sub-components ───────────────────────────

function Screen({
  children,
  bg,
  pad,
}: {
  children: React.ReactNode;
  bg: string;
  pad: string;
}) {
  return (
    <div
      style={{
        minHeight: "100svh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        padding: pad,
        background: bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {children}
    </div>
  );
}

function Heading({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontSize: 28,
        lineHeight: 1.1,
        fontWeight: 800,
        color: INK,
        letterSpacing: "-0.02em",
        position: "relative",
        zIndex: 2,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 15,
        lineHeight: 1.5,
        color: MUTED,
        marginTop: 12,
        position: "relative",
        zIndex: 2,
      }}
    >
      {children}
    </div>
  );
}

function FieldLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: MUTED,
        marginBottom: 8,
        display: "block",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 14,
        borderRadius: 12,
        background: "rgba(224,57,43,.08)",
        color: "#C0271C",
        padding: "10px 14px",
        fontSize: 13,
        fontWeight: 600,
        position: "relative",
        zIndex: 2,
      }}
    >
      {children}
    </div>
  );
}

function LangPill({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      style={{
        padding: "7px 14px",
        borderRadius: R_PILL,
        background: active ? "rgba(255,255,255,.16)" : "transparent",
        border: active ? "none" : "1px solid rgba(255,255,255,.28)",
        color: active ? "#fff" : "rgba(255,255,255,.78)",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

function SoftBlob({
  top,
  right,
  fruit,
}: {
  top: number;
  right: number;
  fruit?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        right,
        opacity: 0.9,
        animation: "floatY 5.5s ease-in-out infinite .6s",
        zIndex: 0,
      }}
    >
      {fruit ? (
        <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
          <circle cx="55" cy="60" r="34" fill="#FF5E3A" />
          <ellipse cx="46" cy="50" rx="10" ry="6" fill="#FF8A6B" opacity=".7" />
        </svg>
      ) : (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="40" fill={P.blobSoft} />
          <ellipse cx="60" cy="60" rx="26" ry="22" fill={P.blobCore} />
        </svg>
      )}
    </div>
  );
}

function ProduceBasket() {
  return (
    <svg
      width="300"
      height="260"
      viewBox="0 0 300 260"
      fill="none"
      style={{ animation: "floatY 4.5s ease-in-out infinite" }}
    >
      <circle cx="150" cy="118" r="104" fill={P.ring1} opacity="0.5" />
      <circle cx="150" cy="118" r="72" fill={P.ring2} opacity="0.45" />
      <g transform="translate(150 56)">
        <ellipse cx="-16" cy="0" rx="15" ry="8" transform="rotate(-32 -16 0)" fill="#2FA34B" />
        <ellipse cx="16" cy="0" rx="15" ry="8" transform="rotate(32 16 0)" fill="#27913F" />
        <ellipse cx="0" cy="-8" rx="13" ry="7" fill="#3CB85A" />
      </g>
      <ellipse cx="196" cy="132" rx="38" ry="33" fill="#FFC233" />
      <ellipse cx="184" cy="120" rx="11" ry="7" fill="#FFD86B" opacity="0.8" />
      <circle cx="112" cy="124" r="44" fill="#FF5E3A" />
      <ellipse cx="98" cy="108" rx="13" ry="8" fill="#FF8A6B" opacity="0.75" />
      <g transform="translate(112 88)" fill="#2E7D32">
        <ellipse cx="-9" cy="0" rx="9" ry="4" transform="rotate(-28 -9 0)" />
        <ellipse cx="9" cy="0" rx="9" ry="4" transform="rotate(28 9 0)" />
        <ellipse cx="0" cy="-3" rx="8" ry="4" />
      </g>
      <path d="M64 150 L236 150 L218 232 Q216 242 206 242 L94 242 Q84 242 82 232 Z" fill="#CE8A45" />
      <path d="M64 150 L236 150 L232 172 L68 172 Z" fill="#E2A35C" />
      <g stroke="#B0732F" strokeWidth="3" opacity="0.6">
        <path d="M108 172 L102 240" />
        <path d="M150 172 L150 242" />
        <path d="M192 172 L198 240" />
      </g>
      <rect x="60" y="146" width="180" height="10" rx="5" fill="#E2A35C" />
    </svg>
  );
}

// ── Returning-user sign-in (bottom sheet) ──
const DEMO_ACCOUNTS = [
  { label: "Customer", sub: "Kirana buyer — browse & order", email: "customer@freshkart.in" },
  { label: "Admin", sub: "Dashboard, orders & inventory", email: "admin@freshkart.in" },
] as const;

function SignInSheet({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function login(loginEmail: string, loginPassword: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to log in");
        setLoading(false);
        return;
      }
      router.push(data.user?.role === "ADMIN" ? "/admin" : "/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        background: "rgba(0,0,0,.45)",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <button
        style={{ flex: 1, background: "transparent", border: "none", cursor: "pointer" }}
        aria-label="Close"
        onClick={onClose}
      />
      <div
        style={{
          background: SURFACE,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "24px 22px 30px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: INK, letterSpacing: "-0.02em" }}>
          Welcome back
        </div>
        <div style={{ fontSize: 14, color: MUTED, marginTop: 4 }}>
          Sign in to continue ordering.
        </div>

        {/* one-tap demo */}
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              disabled={loading}
              onClick={() => login(a.email, "password123")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: R_FIELD,
                border: `1.5px solid ${BORDER}`,
                background: "#fff",
                cursor: "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <span>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: INK }}>
                  {a.label}
                </span>
                <span style={{ fontSize: 12.5, color: MUTED }}>{a.sub}</span>
              </span>
              <span
                style={{
                  background: P.primary,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "8px 14px",
                  borderRadius: R_PILL,
                }}
              >
                Login →
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontSize: 12, color: FAINT }}>or sign in manually</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            login(email, password);
          }}
        >
          {error && <ErrorNote>{error}</ErrorNote>}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={signinInput}
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...signinInput, marginTop: 10 }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 14,
              padding: 15,
              border: "none",
              borderRadius: R_BTN,
              background: P.primary,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loading ? 0.7 : 1,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

const signinInput: React.CSSProperties = {
  width: "100%",
  height: 52,
  borderRadius: R_FIELD,
  border: `1.5px solid ${BORDER}`,
  background: "#fff",
  padding: "0 16px",
  fontSize: 15,
  fontWeight: 500,
  color: INK,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};
