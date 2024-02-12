import { mat4, vec4 } from "gl-matrix"
import { Uniform, uniformFloat, uniformMat4, uniformVec4 } from "./Uniform"
import { Input, VertexArray } from "./VertexArray"
import { initShaderProgram } from "./initShaderProgram"

export type UniformDef =
  | {
      type: "float"
      initialValue?: number
    }
  | {
      type: "vec4"
      initialValue?: vec4
    }
  | {
      type: "mat4"
      initialValue?: mat4
    }

type UniformTypeMap = {
  float: number
  vec4: vec4
  mat4: mat4
}

type ExtractUniformType<T extends UniformDef> = T extends { type: infer U }
  ? U extends keyof UniformTypeMap
    ? UniformTypeMap[U]
    : never
  : never

// mapping UniformDefs to Uniforms
type UniformsOf<UniformDefs extends Record<string, UniformDef>> = {
  [Key in keyof UniformDefs]: Uniform<ExtractUniformType<UniformDefs[Key]>>
}

// mapping UniformDefs to Uniform's value
export type UniformValuesOf<UniformDefs extends Record<string, UniformDef>> = {
  [Key in keyof UniformDefs]: ExtractUniformType<UniformDefs[Key]>
}

export class Shader<
  UniformDefs extends Record<string, UniformDef>,
  InputNames extends string
> {
  private readonly program: WebGLProgram
  private readonly uniforms: UniformsOf<UniformDefs>

  constructor(
    private readonly gl: WebGL2RenderingContext,
    vsSource: string,
    fsSource: string,
    private readonly inputs: { [Key in InputNames]: Input },
    uniforms: UniformDefs
  ) {
    this.program = initShaderProgram(gl, vsSource, fsSource)
    this.uniforms = Object.fromEntries(
      Object.keys(uniforms).map((name) => {
        const key = name as keyof UniformDefs
        const def = uniforms[key]
        switch (def.type) {
          case "float":
            return [key, uniformFloat(gl, this.program, name, def.initialValue)]
          case "vec4":
            return [key, uniformVec4(gl, this.program, name, def.initialValue)]
          case "mat4":
            return [key, uniformMat4(gl, this.program, name, def.initialValue)]
        }
      })
    )
  }

  setUniforms(props: UniformValuesOf<UniformDefs>) {
    for (let key in props) {
      this.uniforms[key as keyof UniformDefs].value = props[key]
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

    Object.keys(this.uniforms).forEach((key) =>
      this.uniforms[key as keyof UniformDefs].upload(gl)
    )

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
