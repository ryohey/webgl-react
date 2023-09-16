import commonjs from "@rollup/plugin-commonjs"
import rollupTypescript from "@rollup/plugin-typescript"
import pkg from "./package.json" assert { type: "json" }

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    sourcemap: true,
  },
  external: [
    "react/jsx-runtime",
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
  ],
  plugins: [commonjs(), rollupTypescript()],
}
