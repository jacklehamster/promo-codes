import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import { importAsString } from "rollup-plugin-string-import";

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "esm",
    chunkFileNames: "[name]-[hash].js",
    sourcemap: true,
  },
  cache: true,
  plugins: [
    commonjs(),
    json(),
    typescript(),
    resolve(),
    importAsString({
      include: "**/*.mustache",
    }),
  ],
};
