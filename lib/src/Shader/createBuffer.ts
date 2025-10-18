import { Buffer, InstancedBuffer } from "./Shader"
import { VertexArray } from "./VertexArray"

export interface BufferUpdateFunction<TData, TAttributes extends string> {
  (vertexArray: VertexArray<TAttributes>, data: TData): number
}

export interface InstancedBufferUpdateFunction<TData, TAttributes extends string> {
  (vertexArray: VertexArray<TAttributes>, data: TData): { vertexCount: number; instanceCount: number }
}

// For regular buffers
export function createBuffer<TData, TAttributes extends string>(
  vertexArray: VertexArray<TAttributes>,
  updateFunction: BufferUpdateFunction<TData, TAttributes>,
): Buffer<TData, TAttributes> {
  let vertexCount = 0

  const buffer: Buffer<TData, TAttributes> = {
    get vertexCount() {
      return vertexCount
    },
    vertexArray,
    update(data: TData) {
      vertexCount = updateFunction(vertexArray, data)
    },
  }

  return buffer
}

// For instanced buffers
export function createInstancedBuffer<TData, TAttributes extends string>(
  vertexArray: VertexArray<TAttributes>,
  updateFunction: InstancedBufferUpdateFunction<TData, TAttributes>,
): InstancedBuffer<TData, TAttributes> {
  let vertexCount = 0
  let instanceCount = 0

  const buffer: InstancedBuffer<TData, TAttributes> = {
    get vertexCount() {
      return vertexCount
    },
    get instanceCount() {
      return instanceCount
    },
    vertexArray,
    update(data: TData) {
      const result = updateFunction(vertexArray, data)
      vertexCount = result.vertexCount
      instanceCount = result.instanceCount
    },
  }

  return buffer
}