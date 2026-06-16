import { NextRequest, NextResponse } from "next/server";

/**
 * Minimal CSRF defense: for state-changing requests to /api/*, reject any
 * request whose Origin header points to a different host than the one the
 * request was sent to. Same-origin app requests (including our own Razorpay
 * verify call) always pass. Requests without an Origin header (non-browser
 * clients like curl/server-to-server) are allowed.
 */
const PROTECTED_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(request: NextRequest) {
  if (!PROTECTED_METHODS.has(request.method)) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");
  // No Origin header → not a browser cross-site request; allow.
  if (!origin) {
    return NextResponse.next();
  }

  const host = request.headers.get("x-forwarded-host") ?? request.nextUrl.host;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    // Malformed Origin header — reject to be safe.
    return new NextResponse(
      JSON.stringify({ error: "Cross-origin request blocked" }),
      { status: 403, headers: { "content-type": "application/json" } },
    );
  }

  if (originHost !== host) {
    return new NextResponse(
      JSON.stringify({ error: "Cross-origin request blocked" }),
      { status: 403, headers: { "content-type": "application/json" } },
    );
  }

  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*"] };
