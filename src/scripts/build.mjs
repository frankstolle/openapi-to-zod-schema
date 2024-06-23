import * as esbuild from "esbuild";

const libShared = {
  entryPoints: ["src/index.ts"],
  target: "es2016",
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: "neutral",
  external: ["zod"],
};
await esbuild.build({
  ...libShared,
  outfile: "dist/index.mjs",
});
await esbuild.build({
  ...libShared,
  outfile: "dist/index.cjs",
  format: "cjs",
});

const cliShared = {
  ...libShared,
  entryPoints: ["src/cli.ts"],
  platform: "node",
};
await esbuild.build({
  ...cliShared,
  outfile: "dist/cli.cjs",
  format: "cjs",
});
