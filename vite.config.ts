import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://letsggu.duckdns.org",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
