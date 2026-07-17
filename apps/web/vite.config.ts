import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL ?? "http://localhost:8080",
          changeOrigin: true,
        },
        "/health": {
          target: env.VITE_API_BASE_URL ?? "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
  };
});

