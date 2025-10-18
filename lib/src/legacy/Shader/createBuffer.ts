import { ShaderBuffer } from "./Shader"

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
): ShaderBuffer<TAttributes> & { update: (data: TData) => void } {
  // Create buffers for each attribute
  const buffers = {} as { [K in TAttributes]: WebGLBuffer }
  for (const name of attributeNames) {
    buffers[name] = gl.createBuffer()!
  }

  let vertexCount = 0

  // Run initialization function once if provided
  if (initFunction) {
    const initData = initFunction()
    for (const [attributeName, data] of Object.entries(initData) as [string, unknown][]) {
      if (data instanceof Float32Array) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[attributeName as TAttributes])
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
      }
    }
  }

  const buffer = {
    get vertexCount() {
      return vertexCount
    },
    buffers,
    update(data: TData) {
      const result = updateFunction(data)
      vertexCount = result.vertexCount
      
      // Update all buffers from the result
      for (const [attributeName, bufferData] of Object.entries(result) as [string, unknown][]) {
        if (bufferData instanceof Float32Array) {
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers[attributeName as TAttributes])
          gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.DYNAMIC_DRAW)
        }
      }
    },
  }

  return buffer
}