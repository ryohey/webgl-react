import { AttributeInstances } from "./createAttributes"
import { ShaderBuffer } from "./Shader"

export class BufferInfo<A extends string, BufferProps> {
  public readonly buffer: ShaderBuffer<A> & {
    update: (buffer: BufferProps) => void
  }

  constructor(
    private readonly gl: WebGLRenderingContext,
    private readonly attributes: AttributeInstances<A>,
    bufferFactory: (
      gl: WebGLRenderingContext,
    ) => ShaderBuffer<A> & {
      update: (buffer: BufferProps) => void
    },
  ) {
    this.buffer = bufferFactory(this.gl)
  }

  setBuffersAndAttributes() {
    Object.keys(this.attributes).forEach((name) => {
      const attrib = this.attributes[name as A]
      const webglBuffer = this.buffer.buffers[name as A]
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, webglBuffer)
      attrib.enable()
    })
  }

  drawArrays() {
    if (this.buffer.vertexCount === 0) {
      return
    }
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.buffer.vertexCount)
  }

  unbind() {
    Object.keys(this.attributes).forEach((name) => {
      const attrib = this.attributes[name as A]
      attrib.disable()
    })
  }

  update(data: BufferProps) {
    this.buffer.update(data)
  }
}