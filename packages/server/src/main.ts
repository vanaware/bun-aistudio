import { join } from "node:path";
import { existsSync } from "node:fs";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

// Resolve static dist directory
const distDir = (() => {
  const possiblePaths = [
    join(import.meta.dir, "../build/dist"),
    join(process.cwd(), "packages/server/build/dist"),
    join(process.cwd(), "build/dist"),
  ];
  for (const p of possiblePaths) {
    if (existsSync(p)) return p;
  }
  return possiblePaths[0]!;
})();

const server = Bun.serve({
  port,
  hostname: "0.0.0.0",
  async fetch(req: Request) {
    try {
      const url = new URL(req.url);
      console.debug(`[REQ] ${req.method} ${url.pathname}`);

      let pathname = decodeURIComponent(url.pathname);
      if (pathname === "/" || pathname === "") {
        pathname = "/index.html";
      }

      const filePath = join(distDir, pathname);
      let file = Bun.file(filePath);

      if (!(await file.exists())) {
        // SPA fallback for navigation requests
        const fallback = Bun.file(join(distDir, "index.html"));
        if (await fallback.exists()) {
          file = fallback;
        } else {
          return new Response("Not Found", { status: 404 });
        }
      }

      const response = new Response(file);

      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      // Permitir escopo global para Service Worker
      if (url.pathname === "/sw.js" || url.pathname.endsWith("/sw.js")) {
        response.headers.set("Service-Worker-Allowed", "/");
      }

      return response;
    } catch (err) {
      console.warn(
        `[STATIC] Falha ao servir arquivo estático. Verifique se Build foi executado?`,
        err instanceof Error ? err.message : err,
      );

      return new Response("Internal Server Error", {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  },
});

console.log(`🚀 [aiStudio] Servidor Bun rodando em http://0.0.0.0:${server.port}`);
