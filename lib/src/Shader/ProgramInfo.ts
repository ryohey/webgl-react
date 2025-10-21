import { UniformInstances } from "./Uniform"

export class ProgramInfo<Uniforms> {
  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly program: WebGLProgram,
    private readonly uniforms: UniformInstances<Uniforms>,
  ) {}

  setUniforms(props: Uniforms) {
    for (let key in props) {
      this.uniforms[key as keyof Uniforms].value = props[key]
    }
  }

  use() {
    this.gl.useProgram(this.program)
  }

  uploadUniforms() {
    Object.keys(this.uniforms).forEach((key) =>
      this.uniforms[key as keyof Uniforms].upload(this.gl),
    )
  }
}