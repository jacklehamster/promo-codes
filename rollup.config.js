import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import { importAsString } from "rollup-plugin-string-import";
import terser from "@rollup/plugin-terser";

const isDev = process.env.NODE_ENV === "dev";
console.log(isDev ? "DEV mode" : "PROD mode");

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
    ...(isDev
      ? []
      : [
          terser({
            mangle: true, // Shorten variable names
            output: {
              comments: false, // Remove comments
            },
          }),
        ]),
  ],
};
