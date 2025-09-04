import express, { type Request, type Response, type NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { log } from "./vite-utils.js"; // Jos sinulla on log-funktio erillään, muuten voit käyttää console.log

let vite: ViteDevServer | null = null;

export async function setupVite(app: express.Express, server: any) {
  vite = await createViteServer({
    server: { middlewareMode: "ssr" },
    appType: "custom",
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Catch-all route to handle client-side routing
  app.use("*", async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;

    try {
      let template = fs.readFileSync(path.resolve("client/index.html"), "utf-8");
      template = await vite!.transformIndexHtml(url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite!.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  log("Vite dev server initialized");
}

export function serveStatic(app: express.Express) {
  const distPath = path.resolve("client/dist");
  if (!fs.existsSync(distPath)) {
    throw new Error("Client build not found. Please run npm run build in client folder");
  }

  app.use(express.static(distPath));

  // Catch-all route to serve index.html
  app.use("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  log("Serving static client from " + distPath);
}
