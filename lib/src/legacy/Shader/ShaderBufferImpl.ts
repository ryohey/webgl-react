import { ShaderBuffer } from "./Shader"
import { BufferUpdateFunction, LegacyBufferInitFunction } from "./createBuffer"
import { BufferPool } from "../../Shader/BufferPool"

export class LegacyShaderBuffer<TData, TAttributes extends string> implements ShaderBuffer<TAttributes> {
  private _vertexCount = 0
  private bufferPool = new BufferPool()

  constructor(
    private readonly gl: WebGLRenderingContext,
    public readonly buffers: { [K in TAttributes]: WebGLBuffer },
    private readonly updateFunction: BufferUpdateFunction<TData, TAttributes>,
    init?: LegacyBufferInitFunction<TAttributes>,
  ) {
    // Run initialization function once if provided
    if (init) {
      const initData = init()
      for (const attributeName in initData) {
        const data = initData[attributeName as TAttributes]!
        const float32Array = this.bufferPool.setBufferData(attributeName, data)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[attributeName as TAttributes])
        gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.DYNAMIC_DRAW)
      }
    }
  }

  get vertexCount(): number {
    return this._vertexCount
  }

  update(data: TData): void {
    const result = this.updateFunction(data)
    this._vertexCount = result.vertexCount
    
    // Update all buffers from the result, converting number[] to Float32Array
    for (const attributeName in result.bufferData) {
      const bufferData = result.bufferData[attributeName as TAttributes]!
      const float32Array = this.bufferPool.setBufferData(attributeName, bufferData)
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[attributeName as TAttributes])
      this.gl.bufferData(this.gl.ARRAY_BUFFER, float32Array, this.gl.DYNAMIC_DRAW)
    }
  }
}