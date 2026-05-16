import { NextRequest, NextResponse } from "next/server";
import { exchangeRate, rateHistory, setExchangeRate } from "@/lib/store";

const ADMIN_TOKEN = "mock-admin-token";

function isAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-token") === ADMIN_TOKEN;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ rate: exchangeRate, history: rateHistory });
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { rate } = body;
    if (typeof rate !== "number" || rate <= 0) {
      return NextResponse.json({ error: "Invalid rate" }, { status: 400 });
    }
    setExchangeRate(rate);
    return NextResponse.json({ success: true, rate: exchangeRate });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
