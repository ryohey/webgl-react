export class Attrib {
  private readonly location: number

  constructor(
    private readonly gl: WebGLRenderingContext,
    program: WebGLProgram,
    public readonly name: string,
    public readonly size: number,
  ) {
    this.location = gl.getAttribLocation(program, name)
    if (this.location < 0) {
      throw new Error(`Failed to get attribute location: ${name}`)
    }
  }

  enable() {
    this.gl.enableVertexAttribArray(this.location)
    this.gl.vertexAttribPointer(this.location, this.size, this.gl.FLOAT, false, 0, 0)
  }

  disable() {
    this.gl.disableVertexAttribArray(this.location)
  }
}