import { useCallback } from "react"
import { Shader } from "../Shader/Shader"
import { Shader as LegacyShader } from "../legacy/Shader/Shader"
import { GLNodeInternal } from "./GLNodeInternal"
import { RenderNode } from "./RenderNode"

export interface GLNodeProps<
  Uniforms extends Record<string, any>,
  BufferProps,
> {
  shader: (gl: WebGL2RenderingContext) => Shader<Uniforms, any>
  shaderFallback?: (
    gl: WebGLRenderingContext,
  ) => LegacyShader<any, Uniforms, BufferProps>
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
        const shader = createShader(gl)
        const buffer = shader.createBuffer()
        return new RenderNode(shader, buffer)
      }

      if (createShaderFallback) {
        const shader = createShaderFallback(gl)
        const buffer = shader.createBuffer()
        return new RenderNode(shader, buffer)
      }

      throw new Error("Unsupported WebGL context")
    },
    [createShader, createShaderFallback],
  )

  return (
    <GLNodeInternal
      createNode={createRenderNode}
      uniforms={uniforms}
      buffer={buffer}
      zIndex={zIndex}
    />
  )
}
