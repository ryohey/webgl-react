import commonjs from "@rollup/plugin-commonjs"
import rollupTypescript from "@rollup/plugin-typescript"
import pkg from "./package.json" with { type: "json" }

const base = {
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

export default [
  {
    ...base,
    input: "src/index.ts",
  },
  {
    ...base,
    input: "src/legacy/index.ts",
    output: {
      ...base.output,
      entryFileNames: "legacy/index.js",
    },
  },
]
