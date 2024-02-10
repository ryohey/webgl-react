import { Uniform } from "./Uniform"
import { Input, VertexArray } from "./VertexArray"

export class InstancedShader<
  U extends { [key: string]: any },
  InputNames extends string
> {
  private readonly vao: WebGLVertexArrayObject

  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly program: WebGLProgram,
    private readonly uniforms: {
      [P in keyof U]: Uniform<U[P]>
    },
    private readonly inputs: { [Key in InputNames]: Input }
  ) {
    this.vao = gl.createVertexArray()!
  }

  setUniforms(props: U) {
    for (let key in props) {
      this.uniforms[key as keyof U].value = props[key]
    }
  }

  createVertexArray() {
    return new VertexArray(this.gl, this.program, this.inputs)
  }

  draw(vertexArray: VertexArray<any>) {
    if (vertexArray.vertexCount === 0) {
      return
    }

    const { gl } = this
    gl.useProgram(this.program)
    gl.bindVertexArray(this.vao)

    Object.values(this.uniforms).forEach((u) => u.upload(gl))

    if (vertexArray.instanceCount > 0) {
      gl.drawArraysInstanced(
        gl.TRIANGLES,
        0,
        vertexArray.vertexCount,
        vertexArray.instanceCount
      )
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, vertexArray.vertexCount)
    }

    gl.bindVertexArray(null)
  }
}
