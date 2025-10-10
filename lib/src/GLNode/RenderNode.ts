interface Buffer<Props> {
  update: (props: Props) => void
}

interface Shader<Uniforms, Buffer> {
  setUniforms: (uniforms: Uniforms) => void
  draw: (buffer: Buffer) => void
}

export class ContainerNode {
  type: string = "NODE"
  zIndex = 0
  children: ContainerNode[] = []

  draw() {
    this.children
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach((child) => child.draw())
  }
}

export class RenderNode<Props = any, Uniforms = any> extends ContainerNode {
  constructor(
    private readonly shader: Shader<Uniforms, any>,
    private readonly buffer: Buffer<Props>,
  ) {
    super()
  }

  update(props: Props) {
    this.buffer.update(props)
  }

  setUniforms(uniforms: Uniforms) {
    this.shader.setUniforms(uniforms)
  }

  override draw() {
    this.shader.draw(this.buffer)
    super.draw()
  }
}
