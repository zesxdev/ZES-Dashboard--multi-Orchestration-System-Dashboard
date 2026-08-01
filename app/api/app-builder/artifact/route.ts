import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { resolveProject } from "@/lib/app-builder";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const project = new URL(request.url).searchParams.get("project") ?? "";
  const resolved = await resolveProject(project);
  if (!resolved) {
    return NextResponse.json({ error: "unknown project" }, { status: 400 });
  }
  const apk = path.join(resolved, ".build/bin/gen.apk");
  try {
    const buf = await fs.readFile(apk);
    const name = `${path.basename(resolved)}.apk`;
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Content-Length": String(buf.length),
      },
    });
  } catch {
    return NextResponse.json({ error: "no built artifact — run a build first" }, { status: 404 });
  }
}
