import { IRect } from "../../../helpers/geometry"
import { rectToTriangles } from "../../../helpers/polygon"
import { ShaderBuffer } from "../../Shader/Shader"
import { createShader } from "../../Shader/createShader"

class SolidRectangleBuffer implements ShaderBuffer<"position"> {
  private gl: WebGLRenderingContext

  readonly buffers: {
    position: WebGLBuffer
  }
  private _vertexCount: number = 0

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.buffers = { position: gl.createBuffer()! }
  }

  update(rects: IRect[]) {
    const { gl } = this
    const positions = rects.flatMap(rectToTriangles)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)

    this._vertexCount = rects.length * 6
  }

  get vertexCount() {
    return this._vertexCount
  }
}

export const SolidRectangleShader = (gl: WebGLRenderingContext) =>
  createShader(
    gl,
    `
      precision lowp float;
      attribute vec4 aVertexPosition;
      uniform mat4 uTransform;

      void main() {
        gl_Position = uTransform * aVertexPosition;
      }
    `,
    `
      precision lowp float;

      uniform vec4 uColor;

      void main() {
        gl_FragColor = uColor;
      }
    `,
    (gl) => new SolidRectangleBuffer(gl),
  )
