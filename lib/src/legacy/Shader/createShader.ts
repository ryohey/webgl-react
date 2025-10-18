import { createAttributes } from "./createAttributes"
import { createUniforms } from "../../Shader/createUniforms"
import { initShaderProgram } from "../../Shader/initShaderProgram"
import { Shader } from "./Shader"

// Shader configuration options
export interface ShaderOptions {
  instanceAttributes?: string[]
}

// Legacy-compatible createShader with auto-detection
export function createShader<
  TUniforms extends Record<string, any>,
  TAttributes extends string,
  BufferProps,
>(
  gl: WebGLRenderingContext,
  vertexShader: string,
  fragmentShader: string,
  bufferFactory: (gl: WebGLRenderingContext) => any,
) {
  const program = initShaderProgram(gl, vertexShader, fragmentShader)

  // Use modern uniform creation and legacy attribute creation
  const uniforms = createUniforms<TUniforms>(gl, program)
  const attributes = createAttributes<TAttributes>(gl, program)

  return new Shader<TAttributes, TUniforms, BufferProps>(
    gl,
    program,
    attributes,
    uniforms,
    bufferFactory,
  )
}
