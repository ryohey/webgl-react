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
  init?: BufferInitFunction<TAttributes>
  update: BufferUpdateFunction<TData, TAttributes>
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
    init,
    update,
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
    new Buffer(vertexArray, update, init)

  return new Shader<TUniforms, TAttributes>(
    gl,
    program,
    inputs,
    uniforms,
    bufferFactory,
  )
}
