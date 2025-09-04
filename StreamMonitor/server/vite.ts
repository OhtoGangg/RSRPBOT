// server/vite.ts
import express from 'express';
import path from 'path';
import fs from 'fs';
import viteConfig from '../vite.config.js';
import { createServer as createViteServer } from 'vite';

export async function setupVite(app: express.Express) {
  const vite = await createViteServer({ ...viteConfig, server: { middlewareMode: true } });
  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const templatePath = path.resolve('./client/index.html');
      let template = await fs.promises.readFile(templatePath, 'utf-8');
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(page);
    } catch (err) { next(err); }
  });
}
