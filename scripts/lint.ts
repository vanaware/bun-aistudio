import { spawn } from "node:child_process";

console.log("🔍 Checking TypeScript types across codebase...");

const proc = spawn("bun", ["x", "tsc", "--noEmit"], {
  stdio: "inherit",
});

proc.on("exit", (code) => {
  if (code === 0) {
    console.log("✅ Type check passed cleanly with no errors!");
  } else {
    console.error(`❌ Type check failed with exit code ${code}`);
  }
  process.exit(code ?? 1);
});
