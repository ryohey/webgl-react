import { Shader } from "./Shader"
import { VertexArray } from "./VertexArray"
import { createAttributes } from "./createAttributes"
import { createBuffer, createInstancedBuffer, BufferUpdateFunction, InstancedBufferUpdateFunction } from "./createBuffer"
import { createUniforms } from "./createUniforms"
import { initShaderProgram } from "./initShaderProgram"

// Shader configuration options
export interface CreateShaderOptions<TData, TAttributes extends string> {
  vertexShader: string
  fragmentShader: string
  updateFunction: BufferUpdateFunction<TData, TAttributes>
  instanceAttributes?: string[]
}

export interface CreateInstancedShaderOptions<TData, TAttributes extends string> {
  vertexShader: string
  fragmentShader: string
  updateFunction: InstancedBufferUpdateFunction<TData, TAttributes>
  instanceAttributes?: string[]
}

// Main createShader function for regular buffers
export function createShader<
  TUniforms extends Record<string, any>,
  TAttributes extends string,
  TData,
>(
  gl: WebGL2RenderingContext,
  {
    vertexShader,
    fragmentShader,
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
    createBuffer(vertexArray, updateFunction)

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
  TUniforms extends Record<string, any>,
  TAttributes extends string,
  TData,
>(
  gl: WebGL2RenderingContext,
  {
    vertexShader,
    fragmentShader,
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
    createInstancedBuffer(vertexArray, updateFunction)

  return new Shader<TUniforms, TAttributes>(
    gl,
    program,
    inputs,
    uniforms,
    bufferFactory,
  )
}
