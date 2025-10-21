import * as twgl from 'twgl.js'

export class Shader<Uniforms extends Record<string, any>, TData = any> {
  constructor(
    private readonly gl: WebGL2RenderingContext,
    public readonly programInfo: twgl.ProgramInfo,
    private readonly createBufferArrays: (data?: TData) => twgl.Arrays,
  ) {}

  setUniforms(uniforms: Uniforms) {
    twgl.setUniforms(this.programInfo, uniforms as { [key: string]: any })
  }

  createBuffer(): twgl.BufferInfo {
    const arrays = this.createBufferArrays()
    return twgl.createBufferInfoFromArrays(this.gl, arrays)
  }

  updateBuffer(data: TData): twgl.BufferInfo {
    const arrays = this.createBufferArrays(data)
    return twgl.createBufferInfoFromArrays(this.gl, arrays)
  }

  draw(bufferInfo: twgl.BufferInfo) {
    if (bufferInfo.numElements === 0) {
      return
    }

    this.gl.useProgram(this.programInfo.program)
    twgl.setBuffersAndAttributes(this.gl, this.programInfo, bufferInfo)
    twgl.drawBufferInfo(this.gl, bufferInfo)
  }
}

