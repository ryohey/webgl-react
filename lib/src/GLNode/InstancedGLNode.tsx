import { Component } from "react"
import { Renderable } from "../Renderer/Renderer"
import { InstancedBuffer, InstancedShader } from "../Shader/InstancedShader"
import { VertexArray } from "../Shader/VertexArray"
import { RendererContext } from "../hooks/useRenderer"

interface InstancedGLNodeProps<
  Uniforms extends { [key: string]: any },
  BufferProps,
  Inputs extends string
> {
  createShader: (
    gl: WebGL2RenderingContext
  ) => InstancedShader<Uniforms, Inputs>
  createBuffer: (
    vertexArray: VertexArray<Inputs>
  ) => InstancedBuffer<BufferProps, Inputs>
  buffer: BufferProps
  uniforms: Uniforms
  zIndex?: number
}

export class InstancedGLNode<
    Uniforms extends { [key: string]: any },
    BufferProps,
    Inputs extends string
  >
  extends Component<InstancedGLNodeProps<Uniforms, BufferProps, Inputs>>
  implements Renderable
{
  protected shader: InstancedShader<Uniforms, Inputs> | null = null
  protected buffer: InstancedBuffer<BufferProps, Inputs> | null = null

  constructor(props: InstancedGLNodeProps<Uniforms, BufferProps, Inputs>) {
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
    const vertexArray = this.shader.createVertexArray()
    this.buffer = this.props.createBuffer(vertexArray)
    this.buffer.update(this.props.buffer)
    this.context.addObject(this)
    this.context.setNeedsDisplay()
  }

  componentWillUnmount() {
    this.context.removeObject(this)
  }

  shouldComponentUpdate(
    nextProps: Readonly<InstancedGLNodeProps<Uniforms, BufferProps, Inputs>>
  ): boolean {
    return (
      this.props.buffer !== nextProps.buffer ||
      this.props.uniforms !== nextProps.uniforms ||
      this.props.zIndex !== nextProps.zIndex
    )
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
