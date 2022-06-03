import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import rollupTypescript from "@rollup/plugin-typescript"
import peerDepsExternal from "rollup-plugin-peer-deps-external"

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    sourcemap: true,
    format: "commonjs",
  },
  plugins: [
    peerDepsExternal(),
    nodeResolve({ preferBuiltins: false, browser: true }),
    commonjs(),
    rollupTypescript(),
  ],
}
