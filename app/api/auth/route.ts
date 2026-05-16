import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    if (password === "admin") {
      return NextResponse.json({ success: true, token: "mock-admin-token" });
    }
    return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }
}
