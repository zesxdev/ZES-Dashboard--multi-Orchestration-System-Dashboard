import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const execFileP = promisify(execFile);

export const HOME = os.homedir();
export const APKBUILDER_DIR = path.join(HOME, "ApkBuilder");
export const ANDROID_HOME = path.join(HOME, "android-sdk");
export const KEYSTORE = path.join(HOME, "apk-lab", "zes.keystore");

const TOOLS: Record<string, string[]> = {
  java: ["--version"],
  aapt: ["version"],
  aapt2: ["version"],
  d8: ["--version"],
  apksigner: ["--version"],
  kotlinc: ["-version"],
};

export async function toolchain(): Promise<{ name: string; version: string; ok: boolean }[]> {
  const out = [];
  for (const [name, args] of Object.entries(TOOLS)) {
    try {
      const { stdout, stderr } = await execFileP(name, args, { timeout: 8000 });
      const raw = (stdout || stderr).split("\n").map((l) => l.trim()).filter(Boolean);
      out.push({ name, version: raw.find((l) => /[a-z0-9]/i.test(l)) || "", ok: true });
    } catch {
      out.push({ name, version: name === "kotlinc" ? "unusable on bionic" : "—", ok: false });
    }
  }
  const [jar, ks, apk] = await Promise.all([
    fs.access(path.join(ANDROID_HOME, "platforms/android-34/android.jar")).then(() => true).catch(() => false),
    fs.access(KEYSTORE).then(() => true).catch(() => false),
    fs.access(path.join(APKBUILDER_DIR, "cli", "builder.py")).then(() => true).catch(() => false),
  ]);
  return [...out, { name: "android.jar", version: jar ? "android-34 ✓" : "missing", ok: jar },
               { name: "keystore", version: ks ? "zes.keystore ✓" : "missing", ok: ks },
               { name: "ApkBuilder", version: apk ? "cli ready ✓" : "missing", ok: apk }];
}

/** Resolve a project path, refusing anything outside $HOME or lacking project.yml. */
export async function resolveProject(raw: string): Promise<string | null> {
  const p = path.resolve(raw || "");
  if (!p.startsWith(HOME + path.sep)) return null;
  try {
    const st = await fs.stat(p);
    if (!st.isDirectory()) return null;
    await fs.access(path.join(p, "project.yml"));
    return p;
  } catch {
    return null;
  }
}

export async function listProjects(): Promise<
  { path: string; name: string; sdk: string; version: string; buildType: string; artifact: { size: number; mtime: string } | null }[]
> {
  const projects = [];
  const entries = await fs.readdir(HOME, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith(".")) continue;
    const p = path.join(HOME, e.name);
    try {
      const yml = await fs.readFile(path.join(p, "project.yml"), "utf8");
      const get = (re: RegExp) => (yml.match(re)?.[1] ?? "").trim();
      const name = get(/^name:\s*(.+)$/m) || e.name;
      const sdk = get(/sdk-api-version:\s*(\d+)/);
      const version = [get(/version-name:\s*"?([^"\s]+)"?/), get(/version-code:\s*(\d+)/)].filter(Boolean).join(" · ");
      const buildType = get(/build-type:\s*(\w+)/) || "release";
      let artifact = null;
      try {
        const st = await fs.stat(path.join(p, ".build/bin/gen.apk"));
        artifact = { size: st.size, mtime: st.mtime.toISOString() };
      } catch { /* no artifact yet */ }
      projects.push({ path: p, name, sdk: sdk || "?", version: version || "?", buildType, artifact });
    } catch { /* not an ApkBuilder project */ }
  }
  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

export async function runBuild(project: string): Promise<{ ok: boolean; log: string; artifact: string | null; signature: string | null }> {
  const env = {
    ...process.env,
    ANDROID_HOME,
    ANDROID_SDK_ROOT: ANDROID_HOME,
  };
  try {
    const { stdout, stderr } = await execFileP(
      "/data/data/com.termux/files/usr/bin/python3",
      ["-m", "cli.builder", project],
      { cwd: APKBUILDER_DIR, env, timeout: 300_000, maxBuffer: 16 * 1024 * 1024 }
    );
    const log = (stdout + stderr).slice(-30000);
    const genApk = path.join(project, ".build/bin/gen.apk");
    let signature: string | null = null;
    try {
      const sig = await execFileP("apksigner", ["verify", "--print-certs", genApk], { env, timeout: 20000 });
      signature = (sig.stdout + sig.stderr).split("\n").slice(0, 4).join("\n");
    } catch { /* unsigned/unverifiable */ }
    return { ok: true, log, artifact: genApk, signature };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    return { ok: false, log: ((err.stdout || "") + "\n" + (err.stderr || "") + "\n" + (err.message || "")).slice(-30000), artifact: null, signature: null };
  }
}
