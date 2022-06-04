import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import rollupTypescript from "@rollup/plugin-typescript"

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    sourcemap: true,
    format: "commonjs",
  },
  external: ["react"],
  plugins: [
    nodeResolve({ preferBuiltins: false, browser: true }),
    commonjs(),
    rollupTypescript(),
  ],
}
