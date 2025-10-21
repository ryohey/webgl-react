import { AttributeInstances } from "./createAttributes"
import { UniformInstances } from "../../Shader/Uniform"
import { ProgramInfo } from "./ProgramInfo"
import { BufferInfo } from "./BufferInfo"

export interface ShaderBuffer<B extends string> {
  vertexCount: number
  buffers: { [P in B]: WebGLBuffer }
}

export class Shader<
  A extends string,
  U extends { [key: string]: any },
  BufferProps,
> {
  readonly program: WebGLProgram
  readonly attributes: AttributeInstances<A>
  readonly uniforms: UniformInstances<U>
  public readonly programInfo: ProgramInfo<U>

  constructor(
    private readonly gl: WebGLRenderingContext,
    program: WebGLProgram,
    attributes: AttributeInstances<A>,
    uniforms: UniformInstances<U>,
    programInfo: ProgramInfo<U>,
    private readonly bufferFactory: (
      gl: WebGLRenderingContext,
    ) => ShaderBuffer<A> & {
      update: (buffer: BufferProps) => void
    },
  ) {
    this.program = program
    this.attributes = attributes
    this.uniforms = uniforms
    this.programInfo = programInfo
  }

  setUniforms(props: U) {
    this.programInfo.setUniforms(props)
  }

  draw(bufferInfo: BufferInfo<A, BufferProps>) {
    if (bufferInfo.buffer.vertexCount === 0) {
      return
    }

    this.programInfo.use()
    bufferInfo.setBuffersAndAttributes()
    this.programInfo.uploadUniforms()
    bufferInfo.drawArrays()
    bufferInfo.unbind()
  }

  createBuffer(): BufferInfo<A, BufferProps> {
    return new BufferInfo(this.gl, this.attributes, this.bufferFactory)
  }
}
