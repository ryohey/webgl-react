import * as twgl from 'twgl.js'

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

export class RenderNode<Props = any, Uniforms extends Record<string, any> = any> extends ContainerNode {
  constructor(
    private readonly gl: WebGLRenderingContext | WebGL2RenderingContext,
    private readonly programInfo: twgl.ProgramInfo,
    private bufferInfo: twgl.BufferInfo,
    private readonly updateBufferArrays: (data: Props) => twgl.Arrays,
  ) {
    super()
  }

  update(props: Props) {
    // Update existing buffers with new data instead of recreating BufferInfo
    const arrays = this.updateBufferArrays(props)
    
    // Update each attribute buffer
    for (const [attributeName, data] of Object.entries(arrays)) {
      const attrib = (this.bufferInfo.attribs as any)[attributeName]
      if (attrib && attrib.buffer && data) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer)
        
        // Convert data to appropriate format
        let bufferData: ArrayBuffer | ArrayBufferView
        if (typeof data === 'object' && 'data' in data && data.data) {
          // Handle attribute objects with data property
          const arrayData = data.data
          bufferData = arrayData instanceof Float32Array ? arrayData : new Float32Array(arrayData as number[])
        } else if (Array.isArray(data) || data instanceof Float32Array) {
          // Handle simple arrays
          bufferData = data instanceof Float32Array ? data : new Float32Array(data as number[])
        } else {
          continue // Skip if data format is not supported
        }
        
        this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, this.gl.DYNAMIC_DRAW)
      }
    }
    
    // Update numElements based on position data
    const positionData = arrays['position']
    if (positionData) {
      let dataLength: number
      if (typeof positionData === 'object' && 'data' in positionData && positionData.data) {
        dataLength = (positionData.data as number[]).length
      } else {
        dataLength = (positionData as number[]).length
      }
      
      // Assuming position has 3 or 2 components per vertex
      const componentsPerVertex = 3 // or 2, depending on your setup
      this.bufferInfo.numElements = Math.floor(dataLength / componentsPerVertex)
    }
  }

  setUniforms(uniforms: Uniforms) {
    twgl.setUniforms(this.programInfo, uniforms)
  }

  override draw() {
    if (this.bufferInfo.numElements === 0) {
      super.draw()
      return
    }

    this.gl.useProgram(this.programInfo.program)
    twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo)
    twgl.drawBufferInfo(this.gl, this.bufferInfo)
    super.draw()
  }
}
