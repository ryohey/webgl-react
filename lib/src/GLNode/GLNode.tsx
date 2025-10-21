import { GLPrimitiveProps } from "../reconciler/types"
import { RenderNode } from "./RenderNode"

// reconciler用のJSX型定義
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "gl-node": GLPrimitiveProps
    }
  }
}

export interface GLNodeProps<
  Uniforms extends Record<string, any>,
  BufferProps,
> {
  shader: (
    gl: WebGLRenderingContext | WebGL2RenderingContext,
  ) => RenderNode<BufferProps, Uniforms>
  uniforms: Uniforms
  buffer: BufferProps
  zIndex?: number
}

export function GLNode<Uniforms extends {}, Buffer extends {}>({
  shader: createShader,
  uniforms,
  buffer,
  zIndex,
}: GLNodeProps<Uniforms, Buffer>) {
  return (
    <gl-node
      createNode={createShader}
      uniforms={uniforms}
      buffer={buffer}
      zIndex={zIndex}
    />
  )
}
