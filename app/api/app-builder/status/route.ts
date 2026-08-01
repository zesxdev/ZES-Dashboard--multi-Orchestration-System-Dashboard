import { NextResponse } from "next/server";
import { toolchain } from "@/lib/app-builder";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ tools: await toolchain() });
}
