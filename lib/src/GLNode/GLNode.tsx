import { useCallback } from "react"
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
  shader: (gl: WebGL2RenderingContext) => RenderNode<BufferProps, Uniforms>
  shaderFallback?: (
    gl: WebGLRenderingContext,
  ) => RenderNode<BufferProps, Uniforms>
  uniforms: Uniforms
  buffer: BufferProps
  zIndex?: number
}

export function GLNode<Uniforms extends {}, Buffer extends {}>({
  shader: createShader,
  shaderFallback: createShaderFallback,
  uniforms,
  buffer,
  zIndex,
}: GLNodeProps<Uniforms, Buffer>) {
  const createRenderNode = useCallback(
    (gl: WebGLRenderingContext | WebGL2RenderingContext) => {
      if (gl instanceof WebGL2RenderingContext) {
        return createShader(gl)
      }

      if (createShaderFallback) {
        return createShaderFallback(gl)
      }

      throw new Error("Unsupported WebGL context")
    },
    [createShader, createShaderFallback],
  )

  return (
    <gl-node
      createNode={createRenderNode}
      uniforms={uniforms}
      buffer={buffer}
      zIndex={zIndex}
    />
  )
}
