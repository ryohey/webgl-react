import { createAttributes } from "./createAttributes"
import { createBuffer, BufferUpdateFunction, LegacyBufferInitFunction } from "./createBuffer"
import { createUniforms } from "../../Shader/createUniforms"
import { initShaderProgram } from "../../Shader/initShaderProgram"
import { Shader } from "./Shader"

// Legacy shader configuration options
export interface CreateShaderOptions<TData, TAttributes extends string> {
  vertexShader: string
  fragmentShader: string
  attributeNames: readonly TAttributes[]
  initFunction?: LegacyBufferInitFunction<TAttributes>
  updateFunction: BufferUpdateFunction<TData, TAttributes>
}

// Legacy-compatible createShader with auto-detection and buffer creation
export function createShader<
  TUniforms extends Record<string, any> = {},
  TAttributes extends string = string,
  TData = any,
>(
  gl: WebGLRenderingContext,
  {
    vertexShader,
    fragmentShader,
    attributeNames,
    initFunction,
    updateFunction,
  }: CreateShaderOptions<TData, TAttributes>,
) {
  const program = initShaderProgram(gl, vertexShader, fragmentShader)

  // Use modern uniform creation and legacy attribute creation
  const uniforms = createUniforms<TUniforms>(gl, program)
  const attributes = createAttributes<TAttributes>(gl, program)

  // Create buffer factory that uses createBuffer
  const bufferFactory = (gl: WebGLRenderingContext) => 
    createBuffer(gl, attributeNames, updateFunction, initFunction)

  return new Shader<TAttributes, TUniforms, TData>(
    gl,
    program,
    attributes,
    uniforms,
    bufferFactory,
  )
}
