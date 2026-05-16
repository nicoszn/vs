import { NextResponse } from "next/server";
import { exchangeRate } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ rate: exchangeRate });
}
