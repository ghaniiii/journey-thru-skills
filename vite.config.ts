// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

/**
 * The dev-only source inspector adds a `data-tsd-source` attribute to every JSX
 * element. React Three Fiber elements (<mesh>, <group>, ...) are Three.js
 * objects, not DOM nodes, so applying that attribute throws at runtime and
 * blanks the canvas. Strip it from the files that render 3D elements.
 */
const THREE_FILES = /\/src\/(components\/(world|vehicle)|scenes)\//;

function stripSourceTagsFromThreeJsx(): Plugin {
  return {
    name: "strip-tsd-source-from-r3f",
    enforce: "post",
    apply: "serve",
    transform(code, id) {
      if (!THREE_FILES.test(id) || !code.includes("data-tsd-source")) return null;
      return {
        code: code
          .replace(/"data-tsd-source":\s*"[^"]*",?\s*/g, "")
          .replace(/\sdata-tsd-source="[^"]*"/g, ""),
        map: null,
      };
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [stripSourceTagsFromThreeJsx()],
  },
});
