import { join, resolve } from "node:path";
import { cp, mkdir, readdir, rm, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const ROOT_DIR = resolve(import.meta.dir, "..");
const UI_SRC = join(ROOT_DIR, "packages/ui/src");
const UI_PUBLIC = join(ROOT_DIR, "packages/ui/public");
const DIST_DIR = join(ROOT_DIR, "packages/server/build/dist");
const PKG_PATH = join(ROOT_DIR, "package.json");

interface BuildOptions {
  noVersion?: boolean;
  watch?: boolean;
}

function parseArgs(): BuildOptions {
  const args = process.argv.slice(2);
  return {
    noVersion: args.includes("--noversion") || args.includes("noversion") || args.includes("-n"),
    watch: args.includes("--watch") || args.includes("-w"),
  };
}

function generateVersionHash(): string {
  return Math.random().toString(36).substring(2, 10);
}

async function getVersion(noVersion: boolean): Promise<string> {
  let pkg: any = {};
  try {
    const content = await readFile(PKG_PATH, "utf-8");
    pkg = JSON.parse(content);
  } catch {
    pkg = { version: "0.0.1" };
  }

  let currentVersion: string = pkg.version || "0.0.1";
  if (noVersion) {
    return currentVersion.startsWith("v") ? currentVersion : `v${currentVersion}`;
  }

  // Parse semver and increment patch
  const baseVersion = currentVersion.split("#")[0]?.replace(/^v/, "") || "0.0.1";
  const parts = baseVersion.split(".").map(Number);
  const major = parts[0] ?? 0;
  const minor = parts[1] ?? 0;
  const patch = (parts[2] ?? 0) + 1;
  const newHash = generateVersionHash();
  const nextVersion = `v${major}.${minor}.${patch}#${newHash}`;

  pkg.version = nextVersion;
  await writeFile(PKG_PATH, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  return nextVersion;
}

async function syncVersionFiles(version: string) {
  const versionTs = `// Automatically generated file during build
export const APP_VERSION: string = "${version}";
`;
  const versionJs = `// Automatically generated file during build
export const APP_VERSION = "${version}";
`;

  await writeFile(join(UI_SRC, "version.ts"), versionTs, "utf-8");
  await writeFile(join(UI_PUBLIC, "version.js"), versionJs, "utf-8");
}

async function copyPublicFiles(version: string) {
  if (!existsSync(UI_PUBLIC)) return;

  const files = await readdir(UI_PUBLIC);
  for (const file of files) {
    const src = join(UI_PUBLIC, file);
    const dest = join(DIST_DIR, file);

    if (file === "manifest.json") {
      try {
        const manifestStr = await readFile(src, "utf-8");
        const manifest = JSON.parse(manifestStr);
        manifest.version = version;
        await writeFile(dest, JSON.stringify(manifest, null, 2), "utf-8");
        continue;
      } catch {
        // Fallback to normal copy
      }
    }

    await cp(src, dest, { recursive: true });
  }
}

export async function runBuild(options: BuildOptions = {}): Promise<void> {
  const startTime = performance.now();
  console.log("🚀 Starting Bun Native Build Orchestrator");

  const version = await getVersion(options.noVersion ?? false);
  console.log(`📈 Application version: ${version}`);

  await syncVersionFiles(version);

  // Clean output directory
  if (existsSync(DIST_DIR)) {
    await rm(DIST_DIR, { recursive: true, force: true });
  }
  await mkdir(DIST_DIR, { recursive: true });

  // Copy public assets
  await copyPublicFiles(version);
  console.log("📁 Static assets copied from packages/ui/public");

  // Bundle UI and Service Worker using Bun.build
  const banner = `/*!\n * aiStudio ${version}\n * (c) 2026 Vanaware - MIT License\n */\n`;

  console.log("🔨 Compiling with Bun.build...");
  const result = await Bun.build({
    entrypoints: [
      join(UI_SRC, "main.tsx"),
      join(UI_SRC, "sw.ts"),
    ],
    outdir: DIST_DIR,
    naming: "[name].[ext]",
    target: "browser",
    format: "esm",
    sourcemap: "linked",
    banner,
    define: {
      __APP_VERSION__: JSON.stringify(version),
    },
  });

  if (!result.success) {
    console.error("❌ Build failed with errors:");
    for (const log of result.logs) {
      console.error(log);
    }
    throw new Error("Bun build failed");
  }

  const duration = Math.round(performance.now() - startTime);
  console.log(`✅ Build completed in ${duration}ms!`);
  for (const output of result.outputs) {
    const sizeKb = (output.size / 1024).toFixed(2);
    console.log(`   📦 ${output.path.replace(ROOT_DIR + "/", "")} (${sizeKb} KB)`);
  }
}

// Run CLI
if (import.meta.main) {
  const options = parseArgs();
  try {
    await runBuild(options);
    if (options.watch) {
      console.log("👀 Watching for changes in packages/ui...");
      // Watch mode
      const { watch } = await import("node:fs");
      watch(UI_SRC, { recursive: true }, async (_event, filename) => {
        if (filename && (filename.endsWith("version.ts") || filename.endsWith("version.js"))) {
          return;
        }
        console.log(`\n🔄 Change detected in ${filename}, rebuilding...`);
        try {
          await runBuild({ noVersion: true });
        } catch (err) {
          console.error("Rebuild failed:", err);
        }
      });
    }
  } catch (err) {
    console.error("Fatal build error:", err);
    process.exit(1);
  }
}
