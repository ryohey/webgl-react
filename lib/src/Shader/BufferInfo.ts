import { Buffer } from "./Buffer"
import { VertexArray } from "./VertexArray"
import { AttributeInputs } from "./createAttributes"

export class BufferInfo<InputNames extends string> {
  public readonly buffer: Buffer<any, InputNames>

  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly program: WebGLProgram,
    private readonly inputs: AttributeInputs<InputNames>,
    bufferFactory: (
      vertexArray: VertexArray<InputNames>,
    ) => Buffer<any, InputNames>,
  ) {
    const vertexArray = new VertexArray(this.gl, this.program, this.inputs)
    this.buffer = bufferFactory(vertexArray)
  }

  setBuffersAndAttributes() {
    this.buffer.vertexArray.bind()
  }

  drawArrays() {
    if (this.buffer.vertexCount === 0) {
      return
    }

    if (this.buffer.instanceCount !== undefined) {
      this.gl.drawArraysInstanced(
        this.gl.TRIANGLES,
        0,
        this.buffer.vertexCount,
        this.buffer.instanceCount,
      )
    } else {
      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.buffer.vertexCount)
    }
  }

  unbind() {
    this.buffer.vertexArray.unbind()
  }

  update<TData>(data: TData) {
    this.buffer.update(data)
  }
}