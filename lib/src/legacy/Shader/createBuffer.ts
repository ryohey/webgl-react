import { ShaderBuffer } from "./Shader"

export interface BufferUpdateFunction<TData, TAttributes extends string> {
  (gl: WebGLRenderingContext, buffers: { [K in TAttributes]: WebGLBuffer }, data: TData): number
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

  const buffer = {
    get vertexCount() {
      return vertexCount
    },
    buffers,
    update(data: TData) {
      vertexCount = updateFunction(gl, buffers, data)
    },
  }

  return buffer
}