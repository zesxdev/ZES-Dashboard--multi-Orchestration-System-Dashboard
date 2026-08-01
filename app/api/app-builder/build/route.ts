import { NextRequest, NextResponse } from "next/server";
import { resolveProject, runBuild } from "@/lib/app-builder";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let project: string;
  try {
    project = ((await request.json()) as { project?: string }).project ?? "";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }
  const resolved = await resolveProject(project);
  if (!resolved) {
    return NextResponse.json({ ok: false, error: "unknown project (must be an ApkBuilder dir under $HOME with project.yml)" }, { status: 400 });
  }
  const result = await runBuild(resolved);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
