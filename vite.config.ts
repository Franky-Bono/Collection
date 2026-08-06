import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin(), TanStackRouterVite(), viteSingleFile()],
  resolve: {
    alias: { "@": "/src" },
  },
  build: {
    minify: "esbuild",
    sourcemap: false,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
  },
});
