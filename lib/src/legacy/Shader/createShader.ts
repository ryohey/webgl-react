import { createAttributes } from "./createAttributes"
import { createBuffer, BufferUpdateFunction } from "./createBuffer"
import { createUniforms } from "../../Shader/createUniforms"
import { initShaderProgram } from "../../Shader/initShaderProgram"
import { Shader } from "./Shader"

// Shader configuration options
export interface ShaderOptions {
  instanceAttributes?: string[]
}

// Legacy-compatible createShader with auto-detection and buffer creation
export function createShader<
  TUniforms extends Record<string, any>,
  TAttributes extends string,
  TData,
>(
  gl: WebGLRenderingContext,
  vertexShader: string,
  fragmentShader: string,
  attributeNames: readonly TAttributes[],
  updateFunction: BufferUpdateFunction<TData, TAttributes>,
) {
  const program = initShaderProgram(gl, vertexShader, fragmentShader)

  // Use modern uniform creation and legacy attribute creation
  const uniforms = createUniforms<TUniforms>(gl, program)
  const attributes = createAttributes<TAttributes>(gl, program)

  // Create buffer factory that uses createBuffer
  const bufferFactory = (gl: WebGLRenderingContext) => 
    createBuffer(gl, attributeNames, updateFunction)

  return new Shader<TAttributes, TUniforms, TData>(
    gl,
    program,
    attributes,
    uniforms,
    bufferFactory,
  )
}
