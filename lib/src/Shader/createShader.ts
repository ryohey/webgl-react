import { Buffer, Shader } from "./Shader"
import { VertexArray } from "./VertexArray"
import { createAttributes } from "./createAttributes"
import { createUniforms } from "./createUniforms"
import { initShaderProgram } from "./initShaderProgram"
import { Attrib } from "../legacy/Shader/Attrib"
import { Shader as LegacyShader } from "../legacy/Shader/Shader"

// Shader configuration options
export interface ShaderOptions {
  instanceAttributes?: string[]
}

// Main createShader function - validation and auto-detection happens here
export function createShader<
  TUniforms extends Record<string, any>,
  TAttributes extends string,
>(
  gl: WebGL2RenderingContext,
  vertexShader: string,
  fragmentShader: string,
  bufferFactory: (
    vertexArray: VertexArray<TAttributes>,
  ) => Buffer<any, TAttributes>,
  options: ShaderOptions = {},
) {
  const program = initShaderProgram(gl, vertexShader, fragmentShader)

  // Auto-detect and create uniforms and attributes
  const uniforms = createUniforms<TUniforms>(gl, program)
  const inputs = createAttributes<TAttributes>(
    gl,
    program,
    options.instanceAttributes,
  )

  return new Shader<TUniforms, TAttributes>(
    gl,
    program,
    inputs,
    uniforms,
    bufferFactory,
  )
}

// Legacy-compatible createShader for old Shader constructor pattern
export function createLegacyShader<
  TAttributes extends string,
  TUniforms extends Record<string, any>,
  BufferProps,
>(
  gl: WebGLRenderingContext,
  vertexShader: string,
  fragmentShader: string,
  attributeFactory: (program: WebGLProgram) => Record<TAttributes, Attrib>,
  uniformFactory: (program: WebGLProgram) => TUniforms,
  bufferFactory: (gl: WebGLRenderingContext) => any,
) {
  return new LegacyShader<TAttributes, TUniforms, BufferProps>(
    gl,
    vertexShader,
    fragmentShader,
    attributeFactory,
    uniformFactory,
    bufferFactory,
  )
}
