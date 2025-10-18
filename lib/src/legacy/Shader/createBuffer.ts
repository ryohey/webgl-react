import { LegacyShaderBuffer } from "./ShaderBufferImpl"

// Buffer data type for returning attribute data
export type LegacyBufferData<TAttributes extends string> = {
  [K in TAttributes]?: Float32Array
}

// Initialization function that returns static geometry data
export interface LegacyBufferInitFunction<TAttributes extends string> {
  (): LegacyBufferData<TAttributes>
}

export interface BufferUpdateFunction<TData, TAttributes extends string> {
  (data: TData): LegacyBufferData<TAttributes> & { vertexCount: number }
}

export function createBuffer<TData, TAttributes extends string>(
  gl: WebGLRenderingContext,
  attributeNames: readonly TAttributes[],
  updateFunction: BufferUpdateFunction<TData, TAttributes>,
  initFunction?: LegacyBufferInitFunction<TAttributes>,
): LegacyShaderBuffer<TData, TAttributes> {
  // Create buffers for each attribute
  const buffers = {} as { [K in TAttributes]: WebGLBuffer }
  for (const name of attributeNames) {
    buffers[name] = gl.createBuffer()!
  }

  return new LegacyShaderBuffer(gl, buffers, updateFunction, initFunction)
}