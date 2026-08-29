import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxies /api to the Express server during development so the client can call
// relative paths (e.g. fetch("/api/tee-times")) without hardcoding a host/port.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
