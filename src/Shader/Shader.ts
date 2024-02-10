import { Attrib } from "./Attrib"
import { initShaderProgram } from "./initShaderProgram"
import { Uniform } from "./Uniform"

export interface ShaderBuffer<B extends string | number | symbol> {
  vertexCount: number
  buffers: { [P in B]: WebGLBuffer }
}

export class Shader<
  A extends string | number | symbol,
  U extends { [key: string]: any }
> {
  private gl: WebGL2RenderingContext
  private program: WebGLProgram

  readonly attributes: {
    [P in A]: Attrib
  }
  readonly uniforms: {
    [P in keyof U]: Uniform<U[P]>
  }

  constructor(
    gl: WebGL2RenderingContext,
    vsSource: string,
    fsSource: string,
    attributes: (program: WebGLProgram) => {
      [P in A]: Attrib
    },
    uniforms: (program: WebGLProgram) => {
      [P in keyof U]: Uniform<U[P]>
    }
  ) {
    this.gl = gl
    const program = initShaderProgram(gl, vsSource, fsSource)!

    this.program = program

    this.attributes = attributes(program)
    this.uniforms = uniforms(program)
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

    Object.keys(this.attributes).forEach((k) =>
      this.attributes[k as A].upload(buffer.buffers[k as A])
    )

    gl.useProgram(this.program)

    Object.values(this.uniforms).forEach((u) => u.upload(gl))

    gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount)
  }
}
