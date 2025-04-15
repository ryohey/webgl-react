import { IRect } from "../../../helpers/geometry"
import { rectToTriangles } from "../../../helpers/polygon"
import { Attrib } from "../../Shader/Attrib"
import { Shader, ShaderBuffer } from "../../Shader/Shader"
import { uniformMat4, uniformVec4 } from "../../Shader/Uniform"

export class SolidRectangleBuffer implements ShaderBuffer<"position"> {
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
  new Shader(
    gl,
    `
      precision lowp float;
      attribute vec4 aVertexPosition;
      uniform mat4 uProjectionMatrix;

      void main() {
        gl_Position = uProjectionMatrix * aVertexPosition;
      }
    `,
    `
      precision lowp float;

      uniform vec4 uColor;

      void main() {
        gl_FragColor = uColor;
      }
    `,
    (program) => ({
      position: new Attrib(gl, program, "aVertexPosition", 2),
    }),
    (program) => ({
      projectionMatrix: uniformMat4(gl, program, "uProjectionMatrix"),
      color: uniformVec4(gl, program, "uColor"),
    })
  )
