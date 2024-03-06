export interface Input {
  size: number
  type: number
  divisor?: number
}

export class VertexArray<InputNames extends string> {
  private readonly vao: WebGLVertexArrayObject
  private readonly buffers: { [Key in InputNames]: WebGLBuffer }

  constructor(
    private readonly gl: WebGL2RenderingContext,
    program: WebGLProgram,
    inputs: { [Key in InputNames]: Input }
  ) {
    gl.useProgram(program)
    this.vao = gl.createVertexArray()!
    const buffers: { [key: string]: WebGLBuffer } = {}

    // Set attributes and bind buffers to VAO
    gl.bindVertexArray(this.vao)

    Object.keys(inputs).forEach((name) => {
      const input = inputs[name as InputNames]
      const position = gl.getAttribLocation(program, name)
      if (position < 0) {
        throw new Error(`failed to getAttribLocation ${name}`)
      }
      const buffer = gl.createBuffer()!
      buffers[name] = buffer

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.vertexAttribPointer(position, input.size, input.type, false, 0, 0)
      if (input.divisor !== undefined) {
        gl.vertexAttribDivisor(position, input.divisor)
      }
      gl.enableVertexAttribArray(position)
    })

    gl.bindVertexArray(null)

    this.buffers = buffers as { [Key in InputNames]: WebGLBuffer }
  }

  updateBuffer(name: InputNames, data: Float32Array) {
    const { gl } = this
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[name])
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  }

  updateAllBuffers(buffer: { [Key in InputNames]: Float32Array }) {
    Object.keys(buffer).forEach((name) => {
      this.updateBuffer(name as InputNames, buffer[name as InputNames])
    })
  }

  bind() {
    this.gl.bindVertexArray(this.vao)
  }

  unbind() {
    this.gl.bindVertexArray(null)
  }
}
