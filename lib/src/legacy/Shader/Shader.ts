import { AttributeInstances } from "./createAttributes"
import { UniformInstances } from "../../Shader/createUniforms"

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

  constructor(
    private readonly gl: WebGLRenderingContext,
    program: WebGLProgram,
    attributes: AttributeInstances<A>,
    uniforms: UniformInstances<U>,
    private readonly bufferFactory: (
      gl: WebGLRenderingContext,
    ) => ShaderBuffer<A> & {
      update: (buffer: BufferProps) => void
    },
  ) {
    this.program = program
    this.attributes = attributes
    this.uniforms = uniforms
  }

  setUniforms(props: U) {
    for (let key in props) {
      this.uniforms[key as keyof U].value = props[key]
    }
  }

  draw(buffer: ShaderBuffer<A>) {
    if (buffer.vertexCount === 0) {
      return
    }

    const { gl } = this

    gl.useProgram(this.program)

    // Bind buffers for each attribute
    Object.keys(this.attributes).forEach((name) => {
      const attrib = this.attributes[name as A]
      const webglBuffer = buffer.buffers[name as A]
      gl.bindBuffer(gl.ARRAY_BUFFER, webglBuffer)
      attrib.enable()
    })

    // Upload uniforms
    Object.values(this.uniforms).forEach((u) => u.upload(gl))

    gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount)

    // Disable attribute arrays
    Object.keys(this.attributes).forEach((name) => {
      const attrib = this.attributes[name as A]
      attrib.disable()
    })
  }

  createBuffer() {
    return this.bufferFactory(this.gl)
  }
}
