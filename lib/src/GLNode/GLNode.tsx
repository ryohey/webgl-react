import React, { Component } from "react"
import { Renderable } from "../Renderer/Renderer"
import { AnyBuffer, Shader } from "../Shader/Shader"
import { VertexArray } from "../Shader/VertexArray"
import { RendererContext } from "../hooks/useRenderer"

interface InstancedGLNodeProps<Uniforms, BufferProps, Inputs extends string> {
  createShader: (gl: WebGL2RenderingContext) => Shader<Uniforms, Inputs>
  createBuffer: (
    vertexArray: VertexArray<Inputs>
  ) => AnyBuffer<BufferProps, Inputs>
  buffer: BufferProps
  uniforms: Uniforms
  zIndex?: number
}

export class GLNode<Uniforms, BufferProps, Inputs extends string>
  extends Component<InstancedGLNodeProps<Uniforms, BufferProps, Inputs>>
  implements Renderable
{
  protected shader: Shader<Uniforms, Inputs> | null = null
  protected buffer: AnyBuffer<BufferProps, Inputs> | null = null

  constructor(props: InstancedGLNodeProps<Uniforms, BufferProps, Inputs>) {
    super(props)
  }

  static override contextType = RendererContext
  declare context: React.ContextType<typeof RendererContext>

  override componentDidUpdate() {
    this.buffer?.update(this.props.buffer)
    this.context.setNeedsDisplay()
  }

  override componentDidMount() {
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

  override componentWillUnmount() {
    this.context.removeObject(this)
  }

  override shouldComponentUpdate(
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

  override render(): React.ReactNode {
    return <></>
  }

  get zIndex(): number {
    return this.props.zIndex ?? 0
  }
}
