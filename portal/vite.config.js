import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs/promises';

const repoRoot = path.resolve(__dirname, '..');

// Plugin que sirve las funciones de portal/api/*.js durante `vite dev`,
// imitando el formato Vercel `(req, res)`.
function portalApiPlugin() {
  return {
    name: 'portal-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next();
        const [pathPart, queryStr] = req.url.split('?');
        const route = pathPart.replace(/^\/api\//, '');
        if (!route) return next();

        // Parse query into req.query
        const query = {};
        if (queryStr) {
          for (const pair of queryStr.split('&')) {
            const [k, v] = pair.split('=');
            if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
          }
        }
        req.query = query;

        // Intentamos primero el path literal `<route>.js`.
        // Si no existe, buscamos un dynamic route `[param].js` en el directorio padre.
        const literal = path.resolve(__dirname, 'api', `${route}.js`);
        const segments = route.split('/');
        const last = segments.pop();
        const parentDir = path.resolve(__dirname, 'api', ...segments);

        let filePath = null;
        try { await fs.access(literal); filePath = literal; }
        catch {
          try {
            const entries = await fs.readdir(parentDir);
            const dyn = entries.find((f) => /^\[[^\]]+\]\.js$/.test(f));
            if (dyn) {
              filePath = path.join(parentDir, dyn);
              const paramName = dyn.match(/^\[([^\]]+)\]\.js$/)[1];
              req.query[paramName] = last;
            }
          } catch {}
        }

        if (!filePath) {
          res.statusCode = 404;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: 'route_not_found', route }));
          return;
        }

        try {
          const modUrl = url.pathToFileURL(filePath).href + `?t=${Date.now()}`;
          const mod = await import(modUrl);
          if (typeof mod.default !== 'function') {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'no_handler' }));
            return;
          }

          if (req.method === 'POST' || req.method === 'PUT') {
            const buffers = [];
            for await (const chunk of req) buffers.push(chunk);
            const raw = Buffer.concat(buffers).toString('utf8');
            try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
          }

          res.status = (code) => { res.statusCode = code; return res; };
          res.json = (obj) => {
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify(obj));
            return res;
          };

          await mod.default(req, res);
        } catch (err) {
          console.error(`[api/${route}]`, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ error: 'internal', message: err.message }));
          }
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  // Carga TODAS las env (incluyendo SUPABASE_*, GEMINI_*) y exponlas a process.env
  // para que las funciones serverless las vean en dev.
  const env = loadEnv(mode, __dirname, '');
  for (const [k, v] of Object.entries(env)) {
    if (!process.env[k]) process.env[k] = v;
  }

  return {
    server: {
      port: 5173,
      open: false,
      fs: { allow: [repoRoot] }
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    resolve: {
      alias: {
        '@apps': path.resolve(repoRoot, 'apps'),
        '@portal': path.resolve(__dirname, 'src')
      }
    },
    plugins: [portalApiPlugin()]
  };
});
