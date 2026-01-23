import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";


const pathResolve = (p: string) => path.resolve(process.cwd(), p);

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        input: {
          main: pathResolve("index.html"),
          app: pathResolve("app.html"),
        },
      },
    },
    plugins: [
      react(),
      tsconfigPaths({ projects: ["./tsconfig.app.json"] }),
      {
        name: "dev-rewrite-app-to-apphtml",
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            const url = req.url ?? "";
            // tylko DEV: mapuj /app i /app/* na app.html
            if (url === "/app" || url.startsWith("/app/")) {
              req.url = "/app.html";
            }
            next();
          });
        },
      },
    ],
  };
});