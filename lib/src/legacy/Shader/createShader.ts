import { createAttributes } from "./createAttributes"
import { createBuffer, BufferUpdateFunction, LegacyBufferInitFunction } from "./createBuffer"
import { createUniforms } from "../../Shader/createUniforms"
import { initShaderProgram } from "../../Shader/initShaderProgram"
import { Shader } from "./Shader"

// Legacy shader configuration options
export interface CreateShaderOptions<TData, TAttributes extends string> {
  vertexShader: string
  fragmentShader: string
  init?: LegacyBufferInitFunction<TAttributes>
  update: BufferUpdateFunction<TData, TAttributes>
}

// Legacy-compatible createShader with auto-detection and buffer creation
export function createShader<
  TUniforms extends Record<string, any> = {},
  TAttributes extends string = string,
  TData = any,
>(
  options: CreateShaderOptions<TData, TAttributes>,
): (gl: WebGLRenderingContext) => Shader<TAttributes, TUniforms, TData>
export function createShader<TUniforms extends Record<string, any>>(
  options: CreateShaderOptions<any, any>,
) {
  return (gl: WebGLRenderingContext) => {
    const {
      vertexShader,
      fragmentShader,
      init,
      update,
    } = options
    const program = initShaderProgram(gl, vertexShader, fragmentShader)

    // Use modern uniform creation and legacy attribute creation
    const uniforms = createUniforms<TUniforms>(gl, program)
    const attributes = createAttributes(gl, program)

    // Create buffer factory that uses createBuffer with auto-detected attributes
    const bufferFactory = (gl: WebGLRenderingContext) => 
      createBuffer(gl, attributes, update, init)

    return new Shader(
      gl,
      program,
      attributes,
      uniforms,
      bufferFactory,
    )
  }
}
