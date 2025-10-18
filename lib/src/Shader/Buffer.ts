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
  (data: TData): BufferData<TAttributes> & { vertexCount: number; instanceCount?: number }
}

export class Buffer<TData, TAttributes extends string> {
  private _vertexCount = 0
  private _instanceCount: number | undefined = undefined

  constructor(
    public readonly vertexArray: VertexArray<TAttributes>,
    private readonly updateFunction: BufferUpdateFunction<TData, TAttributes>,
    initFunction?: BufferInitFunction<TAttributes>,
  ) {
    // Run initialization function once if provided
    if (initFunction) {
      const initData = initFunction()
      for (const [attributeName, data] of Object.entries(initData) as [string, unknown][]) {
        if (data instanceof Float32Array) {
          vertexArray.updateBuffer(attributeName as TAttributes, data)
        }
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
    
    // Update all buffers from the result
    for (const [attributeName, bufferData] of Object.entries(result) as [string, unknown][]) {
      if (bufferData instanceof Float32Array) {
        this.vertexArray.updateBuffer(attributeName as TAttributes, bufferData)
      }
    }
  }
}

