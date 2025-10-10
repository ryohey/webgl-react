import React, { Component } from "react"
import { Renderable } from "../Renderer/Renderer"
import { RendererContext } from "../hooks/useRenderer"
import { RenderNode } from "./RenderNode"

interface GLNodeProps<Uniforms, BufferProps> {
  createNode: (
    gl: WebGLRenderingContext | WebGL2RenderingContext,
  ) => RenderNode<BufferProps, Uniforms>
  buffer: BufferProps
  uniforms: Uniforms
  zIndex?: number
}

export class GLNodeInternal<Uniforms, BufferProps>
  extends Component<GLNodeProps<Uniforms, BufferProps>>
  implements Renderable
{
  protected node: RenderNode<BufferProps, Uniforms> | null = null

  constructor(props: GLNodeProps<Uniforms, BufferProps>) {
    super(props)
  }

  static override contextType = RendererContext
  declare context: React.ContextType<typeof RendererContext>

  override componentDidUpdate() {
    this.node?.update(this.props.buffer)
    this.context.setNeedsDisplay()
  }

  override componentDidMount() {
    if (this.context === null) {
      throw new Error("Must provide RendererContext")
    }
    const gl = this.context.gl
    this.node = this.props.createNode(gl)
    this.node.update(this.props.buffer)
    this.context.addObject(this)
    this.context.setNeedsDisplay()
  }

  override componentWillUnmount() {
    this.context.removeObject(this)
  }

  override shouldComponentUpdate(
    nextProps: Readonly<GLNodeProps<Uniforms, BufferProps>>,
  ): boolean {
    return (
      this.props.buffer !== nextProps.buffer ||
      this.props.uniforms !== nextProps.uniforms ||
      this.props.zIndex !== nextProps.zIndex
    )
  }

  draw(): void {
    if (this.node === null) {
      return
    }

    this.node.setUniforms(this.props.uniforms)
    this.node.draw()
  }

  override render(): React.ReactNode {
    return <></>
  }

  get zIndex(): number {
    return this.props.zIndex ?? 0
  }
}
