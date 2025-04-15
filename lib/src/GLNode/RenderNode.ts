interface Buffer<Props> {
  update: (props: Props) => void
}

interface Shader<Uniforms, Buffer> {
  setUniforms: (uniforms: Uniforms) => void
  draw: (buffer: Buffer) => void
}

export class RenderNode<Props, Uniforms> {
  constructor(
    private readonly shader: Shader<Uniforms, any>,
    private readonly buffer: Buffer<Props>
  ) {}

  update(props: Props) {
    this.buffer.update(props)
  }

  setUniforms(uniforms: Uniforms) {
    this.shader.setUniforms(uniforms)
  }

  draw() {
    this.shader.draw(this.buffer)
  }
}
