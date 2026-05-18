// vite.config.ts (or .js)
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
import viteImagemin from "vite-plugin-imagemin";

export default ({ mode }) => {
  // Load .env files and allow overriding the relay target:
  const env = loadEnv(mode, process.cwd(), "");
  const relayTarget = env.VITE_RELAY_TARGET || "https://secure-api.alphatrust.ai";

  const config = {
    plugins: [
      viteCompression({
        algorithm: "brotliCompress",
        ext: ".br",
      }),
      react(),
      viteImagemin({
        gifsicle: { optimizationLevel: 7 },
        mozjpeg: { quality: 80 },
        pngquant: { quality: [0.65, 0.9], speed: 4 },
        svgo: {
          plugins: [
            { name: "removeViewBox", active: false },
            { name: "removeEmptyAttrs", active: true },
          ],
        },
      }),
    ],
    resolve: {
      alias: { "@": "/src" },
    },
    css: { devSourcemap: false },
    build: { sourcemap: false },

    // 🔁 DEV proxy: forwards GET/POST/etc. to the other app
    server: {
      proxy: {
        "/notifications": {
          target: relayTarget, // e.g. http://secure
          changeOrigin: true, // sets Host header to the target
          ws: true, // harmless; enables WS if ever used
          // keep the path untouched: /notifications/skrill -> /notifications/skrill
          rewrite: (path) => path,
        },
      },
    },
  };

  return defineConfig(config);
};
