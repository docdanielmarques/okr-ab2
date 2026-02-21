import { defineConfig } from "vite";

export default defineConfig({
  // Static HTML project - just serve index.html as-is
  build: {
    rollupOptions: {
      input: "index.html",
    },
  },
});
