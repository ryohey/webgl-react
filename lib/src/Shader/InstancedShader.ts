import { Uniform } from "./Uniform"
import { Input, VertexArray } from "./VertexArray"

export class InstancedShader<
  U extends { [key: string]: any },
  InputNames extends string
> {
  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly program: WebGLProgram,
    private readonly uniforms: {
      [P in keyof U]: Uniform<U[P]>
    },
    private readonly inputs: { [Key in InputNames]: Input }
  ) {}

  setUniforms(props: U) {
    for (let key in props) {
      this.uniforms[key as keyof U].value = props[key]
    }
  }

  createVertexArray() {
    return new VertexArray(this.gl, this.program, this.inputs)
  }

  draw(buffer: InstancedBuffer<any, any>) {
    if (buffer.vertexCount === 0) {
      return
    }

    const { gl } = this
    gl.useProgram(this.program)

    buffer.bind()

    Object.values(this.uniforms).forEach((u) => u.upload(gl))

    if (buffer.instanceCount > 0) {
      gl.drawArraysInstanced(
        gl.TRIANGLES,
        0,
        buffer.vertexCount,
        buffer.instanceCount
      )
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount)
    }

    buffer.unbind()
  }
}

export abstract class InstancedBuffer<Params, Inputs extends string> {
  abstract get vertexCount(): number
  abstract get instanceCount(): number

  constructor(readonly vertexArray: VertexArray<Inputs>) {}

  abstract update(params: Params): void

  bind() {
    this.vertexArray.bind()
  }

  unbind() {
    this.vertexArray.unbind()
  }
}
