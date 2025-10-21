import * as twgl from "twgl.js"
import { BufferPool } from "../Shader/BufferPool"

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

export type RenderNodeProps<T> = {
  bufferData: T
  vertexCount: number
  instanceCount?: number
}

export class RenderNode<
  Props extends any = any,
  Uniforms extends Record<string, any> = any,
> extends ContainerNode {
  private instanceCount: number | undefined
  private readonly bufferPool = new BufferPool()

  constructor(
    private readonly gl: WebGLRenderingContext | WebGL2RenderingContext,
    private readonly programInfo: twgl.ProgramInfo,
    private bufferInfo: twgl.BufferInfo,
    private readonly updateBufferArrays: (data: Props) => RenderNodeProps<any>,
  ) {
    super()
  }

  update(props: Props) {
    const arrays = this.updateBufferArrays(props)

    for (const attributeName in arrays.bufferData) {
      const attrib = this.bufferInfo.attribs?.[attributeName]
      if (attrib) {
        const bufferData = arrays.bufferData[attributeName]
        const buffer = this.bufferPool.setBufferData(attributeName, bufferData)
        twgl.setAttribInfoBufferFromArray(this.gl, attrib, buffer)
      }
    }

    this.bufferInfo.numElements = arrays.vertexCount
    this.instanceCount = arrays.instanceCount
  }

  setUniforms(uniforms: Uniforms) {
    this.gl.useProgram(this.programInfo.program)
    twgl.setUniforms(this.programInfo, uniforms)
  }

  override draw() {
    this.gl.useProgram(this.programInfo.program)
    twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo)
    twgl.drawBufferInfo(
      this.gl,
      this.bufferInfo,
      undefined,
      undefined,
      undefined,
      this.instanceCount,
    )
    super.draw()
  }
}
