import { Component } from "react"
import { Renderable } from "../Renderer/Renderer"
import { Shader, ShaderBuffer } from "../Shader/Shader"
import { RendererContext } from "../hooks/useRenderer"

type Buffer<Props, T extends string | number | symbol> = ShaderBuffer<T> & {
  update(props: Props): void
}

interface GLNodeProps<
  Uniforms extends { [key: string]: any },
  BufferProps,
  Attribs extends string | number | symbol
> {
  createShader: (gl: WebGLRenderingContext) => Shader<Attribs, Uniforms>
  createBuffer: (gl: WebGLRenderingContext) => Buffer<BufferProps, Attribs>
  buffer: BufferProps
  uniforms: Uniforms
  zIndex?: number
}

export abstract class GLNode<
    Uniforms extends { [key: string]: any },
    BufferProps,
    Attribs extends string | number | symbol
  >
  extends Component<GLNodeProps<Uniforms, BufferProps, Attribs>>
  implements Renderable
{
  protected shader: Shader<Attribs, Uniforms> | null = null
  protected buffer: Buffer<BufferProps, Attribs> | null = null

  constructor(props: GLNodeProps<Uniforms, BufferProps, Attribs>) {
    super(props)
  }

  static contextType = RendererContext
  declare context: React.ContextType<typeof RendererContext>

  componentDidUpdate() {
    this.buffer?.update(this.props.buffer)
    this.context.setNeedsDisplay()
  }

  componentDidMount() {
    if (this.context === null) {
      throw new Error("Must provide RendererContext")
    }
    const gl = this.context.gl
    this.shader = this.props.createShader(gl)
    this.buffer = this.props.createBuffer(gl)
    this.buffer.update(this.props.buffer)
    this.context.addObject(this)
    this.context.setNeedsDisplay()
  }

  componentWillUnmount() {
    this.context.removeObject(this)
  }

  draw(): void {
    if (this.shader === null || this.buffer === null) {
      return
    }

    this.shader.setUniforms(this.props.uniforms)
    this.shader.draw(this.buffer)
  }

  render() {
    return <></>
  }

  get zIndex(): number {
    return this.props.zIndex ?? 0
  }
}
