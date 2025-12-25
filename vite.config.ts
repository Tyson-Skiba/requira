import type { ConfigEnv } from "vite";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), "REQUESTOR_");

  return defineConfig({
    root: "./client",
    plugins: [react()],
    envPrefix: "REQUESTOR",
    server: {
      proxy:
        mode === "development"
          ? {
              "/api": env.REQUESTOR_API_URL || "http://localhost:3022",
            }
          : undefined,
      host: true,
      port: 5173,
    },
    build: {
      outDir: path.resolve(__dirname, "server/public"),
      emptyOutDir: true,
    },
  });
};
