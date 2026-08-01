"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardCard from "@/components/dashboard/card";
import DashboardStat from "@/components/dashboard/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Hammer, Wrench, Package, Download, RefreshCw, Loader2, Play, Terminal, Info } from "lucide-react";

interface Tool { name: string; version: string; ok: boolean }
interface Artifact { size: number; mtime: string }
interface Project {
  path: string; name: string; sdk: string; version: string;
  buildType: string; artifact: Artifact | null;
}
interface BuildResult { ok: boolean; log: string; artifact: string | null; signature: string | null }

const fmtSize = (n: number) => n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${(n / 1024).toFixed(0)}KB`;

export default function AppBuilderPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [busy, setBusy] = useState(false);
  const [building, setBuilding] = useState<string | null>(null);
  const [log, setLog] = useState<string>("");
  const [signature, setSignature] = useState<string | null>(null);
  const [lastBuild, setLastBuild] = useState<{ name: string; ok: boolean } | null>(null);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const [s, p] = await Promise.all([
        fetch("/api/app-builder/status").then((r) => r.json()),
        fetch("/api/app-builder/projects").then((r) => r.json()),
      ]);
      setTools(s.tools ?? []);
      setProjects(p.projects ?? []);
    } catch { /* keep stale data */ }
    setBusy(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const build = async (proj: Project) => {
    setBuilding(proj.name);
    setLog("");
    setSignature(null);
    setLastBuild(null);
    try {
      const res = await fetch("/api/app-builder/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: proj.path }),
      });
      const data: BuildResult = await res.json();
      setLog(data.log || "(no output)");
      setSignature(data.signature);
      setLastBuild({ name: proj.name, ok: data.ok });
    } catch (e) {
      setLog(`request failed: ${e instanceof Error ? e.message : e}`);
      setLastBuild({ name: proj.name, ok: false });
    }
    setBuilding(null);
    refresh();
  };

  const toolsOk = tools.filter((t) => t.ok).length;
  const latestArtifact = projects
    .map((p) => p.artifact).filter((a): a is Artifact => a !== null)
    .sort((a, b) => b.mtime.localeCompare(a.mtime))[0];

  return (
    <DashboardPageLayout
      header={{
        title: "App Builder",
        description: "On-device APK builds via ApkBuilder",
        icon: Hammer,
        actions: (
          <Button variant="outline" size="sm" onClick={refresh} disabled={busy}>
            <RefreshCw className={cn("size-4 mr-1.5", busy && "animate-spin")} /> Refresh
          </Button>
        ),
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStat label="Toolchain" value={`${toolsOk}/${tools.length}`} description="java · aapt2 · d8 · apksigner" icon={Wrench} intent={toolsOk === tools.length ? "positive" : "warning"} />
        <DashboardStat label="Projects" value={String(projects.length)} description="ApkBuilder dirs with project.yml" icon={Package} intent="neutral" />
        <DashboardStat label="Latest artifact" value={latestArtifact ? fmtSize(latestArtifact.size) : "—"} description={latestArtifact ? new Date(latestArtifact.mtime).toLocaleString() : "no builds yet"} icon={Download} intent="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard
          title="Toolchain"
          addon={<Badge variant={toolsOk === tools.length ? "default" : "destructive"}>{toolsOk}/{tools.length} ready</Badge>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tools.map((t) => (
              <div key={t.name} className="flex items-center gap-2 rounded-lg px-3 py-2 ring-1 ring-border bg-background/50">
                <span className={cn("size-2 rounded-full shrink-0", t.ok ? "bg-emerald-400" : "bg-red-400")} />
                <span className="text-sm font-medium">{t.name}</span>
                <span className="ml-auto text-xs text-muted-foreground truncate max-w-40">{t.version}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Projects" addon={<Badge variant="outline">{projects.length} found</Badge>}>
          <div className="flex flex-col gap-2">
            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground">No ApkBuilder projects found under $HOME. A project is a dir with a project.yml.</p>
            )}
            {projects.map((p) => (
              <div key={p.path} className="flex flex-col gap-2 rounded-xl p-3 ring-1 ring-border bg-background/50">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{p.name}</span>
                  <Badge variant="outline" className="text-[10px]">API {p.sdk}</Badge>
                  <Badge variant="outline" className="text-[10px]">{p.buildType}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">{p.version}</span>
                </div>
                <div className="flex items-center gap-2">
                  {p.artifact && (
                    <a href={`/api/app-builder/artifact?project=${encodeURIComponent(p.path)}`}
                       className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline">
                      <Download className="size-3.5" /> {fmtSize(p.artifact.size)} · {new Date(p.artifact.mtime).toLocaleString()}
                    </a>
                  )}
                  {!p.artifact && <span className="text-xs text-muted-foreground">no artifact yet</span>}
                  <Button size="sm" className="ml-auto" onClick={() => build(p)} disabled={building !== null}>
                    {building === p.name ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                    <span className="ml-1.5">{building === p.name ? "Building…" : "Build"}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      {(log || lastBuild) && (
        <DashboardCard
          title="Build Output"
          addon={lastBuild && (
            <Badge variant={lastBuild.ok ? "default" : "destructive"}>
              {lastBuild.ok ? `${lastBuild.name} built OK` : `${lastBuild.name} failed`}
            </Badge>
          )}
        >
          {signature && (
            <pre className="mb-3 rounded-lg bg-black/40 px-3 py-2 text-[11px] text-emerald-300 font-mono overflow-x-auto">{signature}</pre>
          )}
          <pre className="max-h-96 overflow-auto rounded-lg bg-black/40 px-3 py-2 text-xs text-cyan-100 font-mono whitespace-pre-wrap break-words">{log}</pre>
        </DashboardCard>
      )}

      <DashboardCard title="Known pitfalls" addon={<Info className="size-4 text-muted-foreground" />}>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-muted-foreground list-disc list-inside">
          <li>Plain Java, not Kotlin — ApkBuilder ships no kotlin-stdlib (runtime NoClassDefFoundError)</li>
          <li>Absolute keystore path in project.yml — `~` is not expanded</li>
          <li>`[ERROR] -- base dir cannot be file` lines are cosmetic</li>
          <li>MIUI blocks shell installs — deliver APK to Downloads and tap-install</li>
        </ul>
      </DashboardCard>
    </DashboardPageLayout>
  );
}
