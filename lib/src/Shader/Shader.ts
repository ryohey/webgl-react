import { Buffer } from "./Buffer"
import { VertexArray } from "./VertexArray"
import { AttributeInputs } from "./createAttributes"
import { ProgramInfo } from "./ProgramInfo"
import { BufferInfo } from "./BufferInfo"

export class Shader<Uniforms, InputNames extends string> {
  public readonly programInfo: ProgramInfo<Uniforms>

  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly program: WebGLProgram,
    private readonly inputs: AttributeInputs<InputNames>,
    programInfo: ProgramInfo<Uniforms>,
    private readonly bufferFactory: (
      vertexArray: VertexArray<InputNames>,
    ) => Buffer<any, InputNames>,
  ) {
    this.programInfo = programInfo
  }

  setUniforms(props: Uniforms) {
    this.programInfo.setUniforms(props)
  }

  createBuffer(): BufferInfo<InputNames> {
    return new BufferInfo(this.gl, this.program, this.inputs, this.bufferFactory)
  }

  draw(bufferInfo: BufferInfo<InputNames>) {
    if (bufferInfo.buffer.vertexCount === 0) {
      return
    }

    this.programInfo.use()
    bufferInfo.setBuffersAndAttributes()
    this.programInfo.uploadUniforms()
    bufferInfo.drawArrays()
    bufferInfo.unbind()
  }
}

