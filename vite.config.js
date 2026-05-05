import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "public", // asegura que sw.js, manifest.json e íconos se copien al build
  server: {
    host: true,
  },
  build: {
    outDir: "dist",
  },
});
