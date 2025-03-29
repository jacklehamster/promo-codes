import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "index.js",
  output: {
    file: "dist/index.js",
    format: "esm",
  },
  plugins: [commonjs(), json()],
};
