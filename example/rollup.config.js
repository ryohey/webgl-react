import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import rollupTypescript from "@rollup/plugin-typescript"
import replace from "rollup-plugin-replace"
import serve from "rollup-plugin-serve"

export default {
  input: "src/index.tsx",
  output: {
    dir: "public/js",
    sourcemap: true,
    format: "iife",
  },
  external: ["react"],
  globals: {
    react: "React",
  },
  plugins: [
    nodeResolve({ preferBuiltins: false, browser: true }),
    commonjs(),
    rollupTypescript(),
    replace({
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
    serve({
      contentBase: "public",
      open: true,
    }),
  ],
}
