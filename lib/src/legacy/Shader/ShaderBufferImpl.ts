import { ShaderBuffer } from "./Shader"
import { BufferUpdateFunction, LegacyBufferInitFunction } from "./createBuffer"

export class LegacyShaderBuffer<TData, TAttributes extends string> implements ShaderBuffer<TAttributes> {
  private _vertexCount = 0

  constructor(
    private readonly gl: WebGLRenderingContext,
    public readonly buffers: { [K in TAttributes]: WebGLBuffer },
    private readonly updateFunction: BufferUpdateFunction<TData, TAttributes>,
    initFunction?: LegacyBufferInitFunction<TAttributes>,
  ) {
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
  }

  get vertexCount(): number {
    return this._vertexCount
  }

  update(data: TData): void {
    const result = this.updateFunction(data)
    this._vertexCount = result.vertexCount
    
    // Update all buffers from the result
    for (const [attributeName, bufferData] of Object.entries(result) as [string, unknown][]) {
      if (bufferData instanceof Float32Array) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[attributeName as TAttributes])
        this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, this.gl.DYNAMIC_DRAW)
      }
    }
  }
}