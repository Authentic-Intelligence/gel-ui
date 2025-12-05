import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import genericNames from "generic-names";

// Base path for the UI - can be overridden via VITE_GEL_UI_BASE_PATH env var
const basePath = process.env.VITE_GEL_UI_BASE_PATH || "/gel-ui-dist/";
// Proxy path for API calls when embedded in Next.js (empty string = direct connection)
const proxyPath = process.env.VITE_GEL_UI_PROXY_PATH || "/api/gel-proxy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({tsDecorators: true})],
  base: basePath,
  define: {
    __GEL_UI_BASE_PATH__: JSON.stringify(basePath),
    __GEL_UI_PROXY_PATH__: JSON.stringify(proxyPath),
  },
  build: {outDir: "build"},
  optimizeDeps: {
    entries: "./index.html",
  },
  esbuild: {
    // don't minify class names, to preserve edgedb error names
    keepNames: true,
  },
  css: {
    modules: {
      generateScopedName(name, filename) {
        return genericNames("[name]_[local]__[hash:base64:5]")(
          name,
          filename
        ).replace("-module_", "_");
      },
    },
  },
  preview: {port: 3002},
  server: {port: 3002},
});
