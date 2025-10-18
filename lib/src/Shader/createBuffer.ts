import { Buffer, InstancedBuffer } from "./Shader"
import { VertexArray } from "./VertexArray"

// Buffer data type for returning attribute data
export type BufferData<TAttributes extends string> = {
  [K in TAttributes]?: Float32Array
}

// Initialization function that returns static geometry data
export interface BufferInitFunction<TAttributes extends string> {
  (): BufferData<TAttributes>
}

export interface BufferUpdateFunction<TData, TAttributes extends string> {
  (data: TData): BufferData<TAttributes> & { vertexCount: number }
}

export interface InstancedBufferUpdateFunction<TData, TAttributes extends string> {
  (data: TData): BufferData<TAttributes> & { vertexCount: number; instanceCount: number }
}

// For regular buffers
export function createBuffer<TData, TAttributes extends string>(
  vertexArray: VertexArray<TAttributes>,
  updateFunction: BufferUpdateFunction<TData, TAttributes>,
  initFunction?: BufferInitFunction<TAttributes>,
): Buffer<TData, TAttributes> {
  let vertexCount = 0

  // Run initialization function once if provided
  if (initFunction) {
    const initData = initFunction()
    for (const [attributeName, data] of Object.entries(initData) as [string, unknown][]) {
      if (data instanceof Float32Array) {
        vertexArray.updateBuffer(attributeName as TAttributes, data)
      }
    }
  }

  const buffer: Buffer<TData, TAttributes> = {
    get vertexCount() {
      return vertexCount
    },
    vertexArray,
    update(data: TData) {
      const result = updateFunction(data)
      vertexCount = result.vertexCount
      
      // Update all buffers from the result
      for (const [attributeName, bufferData] of Object.entries(result) as [string, unknown][]) {
        if (bufferData instanceof Float32Array) {
          vertexArray.updateBuffer(attributeName as TAttributes, bufferData)
        }
      }
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

  // Run initialization function once if provided
  if (initFunction) {
    const initData = initFunction()
    for (const [attributeName, data] of Object.entries(initData) as [string, unknown][]) {
      if (data instanceof Float32Array) {
        vertexArray.updateBuffer(attributeName as TAttributes, data)
      }
    }
  }

  const buffer: InstancedBuffer<TData, TAttributes> = {
    get vertexCount() {
      return vertexCount
    },
    get instanceCount() {
      return instanceCount
    },
    vertexArray,
    update(data: TData) {
      const result = updateFunction(data)
      vertexCount = result.vertexCount
      instanceCount = result.instanceCount
      
      // Update all buffers from the result
      for (const [attributeName, bufferData] of Object.entries(result) as [string, unknown][]) {
        if (bufferData instanceof Float32Array) {
          vertexArray.updateBuffer(attributeName as TAttributes, bufferData)
        }
      }
    },
  }

  return buffer
}