import { VertexArray } from "./VertexArray"
import { BufferPool } from "./BufferPool"

// Buffer data type for returning attribute data as number arrays
export type BufferData<TAttributes extends string> = {
  [K in TAttributes]?: number[]
}

// Type utility to extract attribute names from buffer data
export type InferAttributes<T> = T extends BufferData<infer U> ? U : never

// Type utility to extract attributes from init function
export type InferInitAttributes<T> = T extends () => infer R 
  ? InferAttributes<R>
  : never

// Type utility to extract attributes from update function  
export type InferUpdateAttributes<T> = T extends (data: any) => infer R
  ? R extends BufferData<infer U> & { vertexCount: number; instanceCount?: number }
    ? U
    : InferAttributes<R>
  : never

// Initialization function that returns static geometry data
export interface BufferInitFunction<TAttributes extends string> {
  (): BufferData<TAttributes>
}

export interface BufferUpdateFunction<TData, TAttributes extends string> {
  (data: TData): BufferData<TAttributes> & { vertexCount: number; instanceCount?: number }
}

export class Buffer<TData, TAttributes extends string> {
  private _vertexCount = 0
  private _instanceCount: number | undefined = undefined
  private bufferPool = new BufferPool()

  constructor(
    public readonly vertexArray: VertexArray<TAttributes>,
    private readonly updateFunction: BufferUpdateFunction<TData, TAttributes>,
    init?: BufferInitFunction<TAttributes>,
  ) {
    // Run initialization function once if provided
    if (init) {
      const initData = init()
      for (const attributeName in initData) {
        const data = initData[attributeName as TAttributes]!
        const float32Array = this.bufferPool.setBufferData(attributeName, data)
        vertexArray.updateBuffer(attributeName as TAttributes, float32Array)
      }
    }
  }

  get vertexCount(): number {
    return this._vertexCount
  }

  get instanceCount(): number | undefined {
    return this._instanceCount
  }

  update(data: TData): void {
    const result = this.updateFunction(data)
    this._vertexCount = result.vertexCount
    
    // Set instanceCount if it exists in the result (instanced buffer)
    this._instanceCount = result.instanceCount
    
    // Update all buffers from the result, converting number[] to Float32Array
    for (const attributeName in result) {
      if (attributeName !== 'vertexCount' && attributeName !== 'instanceCount') {
        const bufferData = result[attributeName as TAttributes]!
        const float32Array = this.bufferPool.setBufferData(attributeName, bufferData)
        this.vertexArray.updateBuffer(attributeName as TAttributes, float32Array)
      }
    }
  }
}

