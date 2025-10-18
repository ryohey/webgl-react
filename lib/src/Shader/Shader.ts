import { Buffer } from "./Buffer"
import { UniformInstances } from "./Uniform"
import { VertexArray } from "./VertexArray"
import { AttributeInputs } from "./createAttributes"

export class Shader<Uniforms, InputNames extends string> {
  private readonly uniforms: UniformInstances<Uniforms>

  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly program: WebGLProgram,
    private readonly inputs: AttributeInputs<InputNames>,
    uniforms: UniformInstances<Uniforms>,
    private readonly bufferFactory: (
      vertexArray: VertexArray<InputNames>,
    ) => Buffer<any, InputNames>,
  ) {
    this.uniforms = uniforms
  }

  setUniforms(props: Uniforms) {
    for (let key in props) {
      this.uniforms[key as keyof Uniforms].value = props[key]
    }
  }

  private createVertexArray() {
    return new VertexArray(this.gl, this.program, this.inputs)
  }

  createBuffer(): Buffer<any, InputNames> {
    const vertexArray = this.createVertexArray()
    return this.bufferFactory(vertexArray)
  }

  draw(buffer: Buffer<any, any>) {
    if (buffer.vertexCount === 0) {
      return
    }

    const { gl } = this
    gl.useProgram(this.program)

    buffer.vertexArray.bind()

    Object.keys(this.uniforms).forEach((key) =>
      this.uniforms[key as keyof Uniforms].upload(gl),
    )

    if (buffer.instanceCount !== undefined) {
      gl.drawArraysInstanced(
        gl.TRIANGLES,
        0,
        buffer.vertexCount,
        buffer.instanceCount,
      )
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount)
    }

    buffer.vertexArray.unbind()
  }
}

