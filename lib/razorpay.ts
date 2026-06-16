import crypto from "crypto";

/**
 * Razorpay helpers. The app runs in TEST mode on Vercel where the keys are set;
 * locally (sandbox) the keys are absent and api.razorpay.com is unreachable, so
 * everything here is written to spec and the callers gracefully fall back to the
 * mock payment flow when {@link razorpayConfigured} returns false.
 */

/** True when the server-side Razorpay credentials are present. */
export function razorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  );
}

/** The publishable key id, safe to send to the browser. */
export function publicKeyId(): string | undefined {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Create a Razorpay order. `amountPaise` must already be in the smallest
 * currency unit (paise). Throws on a non-2xx response.
 */
export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string,
): Promise<RazorpayOrder> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured.");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      payment_capture: 1,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Razorpay order creation failed (${res.status}): ${detail}`,
    );
  }

  return (await res.json()) as RazorpayOrder;
}

/**
 * Verify a Razorpay payment signature using HMAC-SHA256 over
 * `${orderId}|${paymentId}` keyed by the secret. Timing-safe comparison.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.from(signature ?? "", "utf8");
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}
