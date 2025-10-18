import { Shader } from "./Shader"
import { VertexArray } from "./VertexArray"
import { createAttributes } from "./createAttributes"
import { createBuffer, createInstancedBuffer, BufferUpdateFunction, InstancedBufferUpdateFunction, BufferInitFunction } from "./createBuffer"
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
  updateFunction: InstancedBufferUpdateFunction<TData, TAttributes>
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

  // Create buffer factory that uses createBuffer
  const bufferFactory = (vertexArray: VertexArray<TAttributes>) =>
    createBuffer(vertexArray, updateFunction, initFunction)

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

  // Create buffer factory that uses createInstancedBuffer
  const bufferFactory = (vertexArray: VertexArray<TAttributes>) =>
    createInstancedBuffer(vertexArray, updateFunction, initFunction)

  return new Shader<TUniforms, TAttributes>(
    gl,
    program,
    inputs,
    uniforms,
    bufferFactory,
  )
}
