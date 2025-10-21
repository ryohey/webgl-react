import { UniformInstances } from "../../Shader/Uniform"

export class ProgramInfo<U extends { [key: string]: any }> {
  constructor(
    private readonly gl: WebGLRenderingContext,
    private readonly program: WebGLProgram,
    private readonly uniforms: UniformInstances<U>,
  ) {}

  setUniforms(props: U) {
    for (let key in props) {
      this.uniforms[key as keyof U].value = props[key]
    }
  }

  use() {
    this.gl.useProgram(this.program)
  }

  uploadUniforms() {
    Object.values(this.uniforms).forEach((u: any) => u.upload(this.gl))
  }
}