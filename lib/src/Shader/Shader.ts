import { RenderProperty } from "../Renderer/RenderProperty"
import { Uniform, UniformDef } from "./Uniform"
import { Input, VertexArray } from "./VertexArray"
import { initShaderProgram } from "./initShaderProgram"

export type UniformDefs<T> = {
  [K in keyof T]: UniformDef<T[K]>
}

type UniformInstances<T> = {
  [K in keyof T]: Uniform<T[K]>
}

export class Shader<Uniforms, InputNames extends string> {
  private readonly program: WebGLProgram
  private readonly uniforms: UniformInstances<Uniforms>

  constructor(
    private readonly gl: WebGL2RenderingContext,
    vsSource: string,
    fsSource: string,
    private readonly inputs: { [Key in InputNames]: Input },
    uniforms: UniformDefs<Uniforms>,
    private readonly bufferFactory: (
      vertexArray: VertexArray<InputNames>
    ) => Buffer<any, InputNames>
  ) {
    this.program = initShaderProgram(gl, vsSource, fsSource)
    this.uniforms = Object.fromEntries(
      Object.keys(uniforms).map((name) => {
        const key = name as keyof Uniforms
        const def = uniforms[key]
        return [
          key,
          new Uniform(
            gl,
            this.program,
            name,
            new RenderProperty(def.initialValue, def.isEqual),
            def.upload
          ),
        ]
      })
    ) as unknown as UniformInstances<Uniforms>
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

  draw(buffer: AnyBuffer<any, any>) {
    if (buffer.vertexCount === 0) {
      return
    }

    if ("instanceCount" in buffer && buffer.instanceCount === 0) {
      return
    }

    const { gl } = this
    gl.useProgram(this.program)

    buffer.vertexArray.bind()

    Object.keys(this.uniforms).forEach((key) =>
      this.uniforms[key as keyof Uniforms].upload(gl)
    )

    if ("instanceCount" in buffer) {
      gl.drawArraysInstanced(
        gl.TRIANGLES,
        0,
        buffer.vertexCount,
        buffer.instanceCount
      )
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount)
    }

    buffer.vertexArray.unbind()
  }
}

export interface Buffer<Params, Inputs extends string> {
  readonly vertexCount: number
  readonly vertexArray: VertexArray<Inputs>
  update(params: Params): void
}

export interface InstancedBuffer<Params, Inputs extends string>
  extends Buffer<Params, Inputs> {
  readonly instanceCount: number
}

export type AnyBuffer<Params, Inputs extends string> =
  | Buffer<Params, Inputs>
  | InstancedBuffer<Params, Inputs>
