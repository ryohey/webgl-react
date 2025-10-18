import { Shader } from "./Shader"
import { VertexArray } from "./VertexArray"
import { Buffer, BufferUpdateFunction, BufferInitFunction } from "./Buffer"
import { createAttributes } from "./createAttributes"
import { createUniforms } from "./createUniforms"
import { initShaderProgram } from "./initShaderProgram"

// Shader configuration options
export interface CreateShaderOptions<TData, TAttributes extends string> {
  vertexShader: string
  fragmentShader: string
  initFunction?: BufferInitFunction<TAttributes>
  updateFunction: BufferUpdateFunction<TData, TAttributes>
  instanceAttributes?: string[]
}

export interface CreateInstancedShaderOptions<TData, TAttributes extends string> {
  vertexShader: string
  fragmentShader: string
  initFunction?: BufferInitFunction<TAttributes>
  updateFunction: BufferUpdateFunction<TData, TAttributes>
  instanceAttributes?: string[]
}

// Main createShader function for regular buffers
export function createShader<
  TUniforms extends Record<string, any> = {},
  TAttributes extends string = string,
  TData = any,
>(
  gl: WebGL2RenderingContext,
  {
    vertexShader,
    fragmentShader,
    initFunction,
    updateFunction,
    instanceAttributes,
  }: CreateShaderOptions<TData, TAttributes>,
) {
  const program = initShaderProgram(gl, vertexShader, fragmentShader)

  // Auto-detect and create uniforms and attributes
  const uniforms = createUniforms<TUniforms>(gl, program)
  const inputs = createAttributes<TAttributes>(
    gl,
    program,
    instanceAttributes,
  )

  // Create buffer factory that uses new Buffer
  const bufferFactory = (vertexArray: VertexArray<TAttributes>) =>
    new Buffer(vertexArray, updateFunction, initFunction)

  return new Shader<TUniforms, TAttributes>(
    gl,
    program,
    inputs,
    uniforms,
    bufferFactory,
  )
}

// Instanced shader function for instanced rendering
export function createInstancedShader<
  TUniforms extends Record<string, any> = {},
  TAttributes extends string = string,
  TData = any,
>(
  gl: WebGL2RenderingContext,
  {
    vertexShader,
    fragmentShader,
    initFunction,
    updateFunction,
    instanceAttributes,
  }: CreateInstancedShaderOptions<TData, TAttributes>,
) {
  const program = initShaderProgram(gl, vertexShader, fragmentShader)

  // Auto-detect and create uniforms and attributes
  const uniforms = createUniforms<TUniforms>(gl, program)
  const inputs = createAttributes<TAttributes>(
    gl,
    program,
    instanceAttributes,
  )

  // Create buffer factory that uses new Buffer
  const bufferFactory = (vertexArray: VertexArray<TAttributes>) =>
    new Buffer(vertexArray, updateFunction, initFunction)

  return new Shader<TUniforms, TAttributes>(
    gl,
    program,
    inputs,
    uniforms,
    bufferFactory,
  )
}
