import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "Xaman webhook",
    accepts: "POST",
    signatureVerification: "required",
    configured: Boolean(process.env.XAMAN_API_SECRET),
  });
}

function signaturesMatch(received: string, expected: string) {
  if (!/^[a-f0-9]+$/i.test(received) || received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(received, "hex"), Buffer.from(expected, "hex"));
}

export async function POST(request: Request) {
  const apiSecret = process.env.XAMAN_API_SECRET;
  if (!apiSecret) {
    return NextResponse.json({ error: "Xaman webhook is not configured" }, { status: 503 });
  }

  const timestamp = request.headers.get("x-xumm-request-timestamp") ?? "";
  const signature = request.headers.get("x-xumm-request-signature") ?? "";
  if (!timestamp || !signature) {
    return NextResponse.json({ error: "Missing Xaman signature headers" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Xaman's documented verifier removes the first UUID separator before use.
  const expected = createHmac("sha1", apiSecret.replace("-", ""))
    .update(timestamp + JSON.stringify(payload))
    .digest("hex");

  if (!signaturesMatch(signature, expected)) {
    return NextResponse.json({ error: "Invalid Xaman signature" }, { status: 401 });
  }

  // Acknowledge promptly. XRPL Connect already follows the signing result in the
  // browser; future server-side processing can be added here after verification.
  return NextResponse.json({ received: true });
}
