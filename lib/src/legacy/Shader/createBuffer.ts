import { ShaderBuffer } from "./Shader"

// Abstract interface to hide WebGL buffer implementation details
export interface LegacyBufferUpdater<TAttributes extends string> {
  updateBuffer(attributeName: TAttributes, data: Float32Array): void
}

export interface BufferUpdateFunction<TData, TAttributes extends string> {
  (updater: LegacyBufferUpdater<TAttributes>, data: TData): number
}

export function createBuffer<TData, TAttributes extends string>(
  gl: WebGLRenderingContext,
  attributeNames: readonly TAttributes[],
  updateFunction: BufferUpdateFunction<TData, TAttributes>,
): ShaderBuffer<TAttributes> & { update: (data: TData) => void } {
  // Create buffers for each attribute
  const buffers = {} as { [K in TAttributes]: WebGLBuffer }
  for (const name of attributeNames) {
    buffers[name] = gl.createBuffer()!
  }

  let vertexCount = 0

  // Create updater that wraps WebGL buffers to hide implementation
  const updater: LegacyBufferUpdater<TAttributes> = {
    updateBuffer(attributeName: TAttributes, data: Float32Array) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[attributeName])
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
    }
  }

  const buffer = {
    get vertexCount() {
      return vertexCount
    },
    buffers,
    update(data: TData) {
      vertexCount = updateFunction(updater, data)
    },
  }

  return buffer
}