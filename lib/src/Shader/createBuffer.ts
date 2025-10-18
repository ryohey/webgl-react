import { Buffer, InstancedBuffer } from "./Shader"
import { VertexArray } from "./VertexArray"

// Abstract interface to hide VertexArray implementation details
export interface BufferUpdater<TAttributes extends string> {
  updateBuffer(attributeName: TAttributes, data: Float32Array): void
}

// Initialization function that runs once to set up static geometry
export interface BufferInitFunction<TAttributes extends string> {
  (updater: BufferUpdater<TAttributes>): void
}

export interface BufferUpdateFunction<TData, TAttributes extends string> {
  (updater: BufferUpdater<TAttributes>, data: TData): number
}

export interface InstancedBufferUpdateFunction<TData, TAttributes extends string> {
  (updater: BufferUpdater<TAttributes>, data: TData): { vertexCount: number; instanceCount: number }
}

// For regular buffers
export function createBuffer<TData, TAttributes extends string>(
  vertexArray: VertexArray<TAttributes>,
  updateFunction: BufferUpdateFunction<TData, TAttributes>,
  initFunction?: BufferInitFunction<TAttributes>,
): Buffer<TData, TAttributes> {
  let vertexCount = 0

  // Create updater that wraps VertexArray to hide implementation
  const updater: BufferUpdater<TAttributes> = {
    updateBuffer(attributeName: TAttributes, data: Float32Array) {
      vertexArray.updateBuffer(attributeName, data)
    }
  }

  // Run initialization function once if provided
  initFunction?.(updater)

  const buffer: Buffer<TData, TAttributes> = {
    get vertexCount() {
      return vertexCount
    },
    vertexArray,
    update(data: TData) {
      vertexCount = updateFunction(updater, data)
    },
  }

  return buffer
}

// For instanced buffers
export function createInstancedBuffer<TData, TAttributes extends string>(
  vertexArray: VertexArray<TAttributes>,
  updateFunction: InstancedBufferUpdateFunction<TData, TAttributes>,
  initFunction?: BufferInitFunction<TAttributes>,
): InstancedBuffer<TData, TAttributes> {
  let vertexCount = 0
  let instanceCount = 0

  // Create updater that wraps VertexArray to hide implementation
  const updater: BufferUpdater<TAttributes> = {
    updateBuffer(attributeName: TAttributes, data: Float32Array) {
      vertexArray.updateBuffer(attributeName, data)
    }
  }

  // Run initialization function once if provided
  initFunction?.(updater)

  const buffer: InstancedBuffer<TData, TAttributes> = {
    get vertexCount() {
      return vertexCount
    },
    get instanceCount() {
      return instanceCount
    },
    vertexArray,
    update(data: TData) {
      const result = updateFunction(updater, data)
      vertexCount = result.vertexCount
      instanceCount = result.instanceCount
    },
  }

  return buffer
}