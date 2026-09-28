import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
    resolve: { tsconfigPaths: true },
    server: {
      hmr: {
        overlay: false,
      },
    },
  };
});

export default config;
