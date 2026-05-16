import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/store";

const ADMIN_TOKEN = "mock-admin-token";

export async function GET(request: NextRequest) {
  if (request.headers.get("x-admin-token") !== ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getAuditLogs());
}
