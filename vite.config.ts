import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import { fileURLToPath } from "url";
import { vitePrerenderPlugin } from "vite-prerender-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathResolve = (p: string) => path.resolve(process.cwd(), p);

export default defineConfig(() => {
  const prerenderEnabled = process.env.PRERENDER !== "false";

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
      prerenderEnabled &&
        vitePrerenderPlugin({
          renderTarget: "#root",
          prerenderScript: path.resolve(__dirname, "src/prerender.tsx"),
          additionalPrerenderRoutes: ["/"],
        }),
    ].filter(Boolean),
  };
});