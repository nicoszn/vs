import { NextRequest, NextResponse } from "next/server";
import { getAllParticipants, addParticipant } from "@/lib/store";

const ADMIN_TOKEN = "mock-admin-token";

function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  return token === ADMIN_TOKEN;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = getAllParticipants();
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { fullName, nickname, socialLinks } = body;
    if (!fullName || !nickname) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const newParticipant = addParticipant({
      fullName,
      nickname,
      avatarUrl: "",
      socialLinks: socialLinks || {},
    });
    return NextResponse.json(newParticipant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
