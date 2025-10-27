import * as twgl from "twgl.js"
import { BufferPool } from "../Shader/BufferPool"
import { NODE_TYPES, NodeType } from "./types"

export class ContainerNode {
  public readonly type: NodeType = NODE_TYPES.CONTAINER
  zIndex = 0
  children: any[] = []
  parent: ContainerNode | null = null

  addChild(child: ContainerNode) {
    if (child.parent) {
      child.parent.removeChild(child)
    }
    this.children.push(child)
    child.parent = this
  }

  removeChild(child: ContainerNode) {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      this.children.splice(index, 1)
      child.parent = null
    }
  }

  draw() {
    this.children
      .filter((child) => 'draw' in child && typeof child.draw === 'function')
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .forEach((child) => {
        child.draw()
      })
  }

  // Traverse the tree and collect all HitAreaNodes
  getHitAreaNodes(): any[] {
    const hitAreas: any[] = []
    
    const traverse = (node: any) => {
      // Check if this is a HitAreaNode by checking for specific properties
      if (node.bounds && node.id && typeof node.id === 'string') {
        hitAreas.push(node)
      }
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(traverse)
      }
    }
    
    traverse(this)
    return hitAreas
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
  public override readonly type: NodeType = NODE_TYPES.RENDER
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
