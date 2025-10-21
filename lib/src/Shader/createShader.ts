import { Shader } from "./Shader"
import { VertexArray } from "./VertexArray"
import { Buffer, BufferUpdateFunction, BufferInitFunction } from "./Buffer"
import { createAttributes } from "./createAttributes"
import { createUniforms } from "./createUniforms"
import { initShaderProgram } from "./initShaderProgram"
import { ProgramInfo } from "./ProgramInfo"

// Main createShader function with strict type safety
export function createShader<
  TUniforms extends Record<string, any> = {},
  TAttributes extends string = string,
  TData = any
>(options: {
  vertexShader: string
  fragmentShader: string
  init?: BufferInitFunction<TAttributes>
  update: BufferUpdateFunction<TData, TAttributes>
  instanceAttributes?: TAttributes[]
}): (gl: WebGL2RenderingContext) => Shader<TUniforms, TAttributes> {
  return (gl: WebGL2RenderingContext) => {
    const {
      vertexShader,
      fragmentShader,
      init,
      update,
      instanceAttributes,
    } = options

    const program = initShaderProgram(gl, vertexShader, fragmentShader)

    // Auto-detect and create uniforms and attributes
    const uniforms = createUniforms<TUniforms>(gl, program)
    const inputs = createAttributes<TAttributes>(
      gl,
      program,
      instanceAttributes,
    )

    // Create ProgramInfo
    const programInfo = new ProgramInfo(gl, program, uniforms)

    // Create buffer factory that uses new Buffer
    const bufferFactory = (vertexArray: VertexArray<TAttributes>) =>
      new Buffer(vertexArray, update, init)

    return new Shader<TUniforms, TAttributes>(
      gl,
      program,
      inputs,
      programInfo,
      bufferFactory,
    )
  }
}

// Legacy interface for backward compatibility
export interface CreateShaderOptionsLegacy<TData, TAttributes extends string> {
  vertexShader: string
  fragmentShader: string
  init?: BufferInitFunction<TAttributes>
  update: BufferUpdateFunction<TData, TAttributes>
  instanceAttributes?: TAttributes[]
}

// Legacy overload for explicit attribute specification
export function createShaderLegacy<
  TUniforms extends Record<string, any>,
  TAttributes extends string,
  TData,
>(
  options: CreateShaderOptionsLegacy<TData, TAttributes>
): (gl: WebGL2RenderingContext) => Shader<TUniforms, TAttributes> {
  return (gl: WebGL2RenderingContext) => {
    const {
      vertexShader,
      fragmentShader,
      init,
      update,
      instanceAttributes,
    } = options

    const program = initShaderProgram(gl, vertexShader, fragmentShader)

    // Auto-detect and create uniforms and attributes
    const uniforms = createUniforms<TUniforms>(gl, program)
    const inputs = createAttributes<TAttributes>(
      gl,
      program,
      instanceAttributes,
    )

    // Create ProgramInfo
    const programInfo = new ProgramInfo(gl, program, uniforms)

    // Create buffer factory that uses new Buffer
    const bufferFactory = (vertexArray: VertexArray<TAttributes>) =>
      new Buffer(vertexArray, update, init)

    return new Shader<TUniforms, TAttributes>(
      gl,
      program,
      inputs,
      programInfo,
      bufferFactory,
    )
  }
}
