import { IRect } from "../../../helpers/geometry"
import { rectToTriangleBounds, rectToTriangles } from "../../../helpers/polygon"
import { ShaderBuffer } from "../../Shader/Shader"
import { createShader } from "../../Shader/createShader"

class BorderedRectangleBuffer implements ShaderBuffer<"position" | "bounds"> {
  private gl: WebGLRenderingContext

  readonly buffers: {
    position: WebGLBuffer
    bounds: WebGLBuffer
  }
  private _vertexCount: number = 0

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl

    this.buffers = {
      position: gl.createBuffer()!,
      bounds: gl.createBuffer()!,
    }
  }

  update(rects: IRect[]) {
    const { gl } = this

    const positions = rects.flatMap(rectToTriangles)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)

    const bounds = rects.flatMap(rectToTriangleBounds)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.bounds)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bounds), gl.DYNAMIC_DRAW)

    this._vertexCount = rects.length * 6
  }

  get vertexCount() {
    return this._vertexCount
  }
}

export const BorderedRectangleShader = (gl: WebGLRenderingContext) =>
  createShader(
    gl,
    `
      precision lowp float;
      attribute vec4 aVertexPosition;

      // XYZW -> X, Y, Width, Height
      attribute vec4 aBounds;

      uniform mat4 uTransform;
      varying vec4 vBounds;
      varying vec2 vPosition;

      void main() {
        gl_Position = uTransform * aVertexPosition;
        vBounds = aBounds;
        vPosition = aVertexPosition.xy;
      }
    `,
    `
      precision lowp float;

      uniform vec4 uFillColor;
      uniform vec4 uStrokeColor;

      varying vec4 vBounds;
      varying vec2 vPosition;

      void main() {
        float border = 1.0;
        float localX = vPosition.x - vBounds.x;
        float localY = vPosition.y - vBounds.y;

        if ((localX < border) || (localX >= (vBounds.z - border)) || (localY < border) || (localY > (vBounds.w - border))) {
          // draw outline
          gl_FragColor = uStrokeColor;
        } else {
          gl_FragColor = uFillColor;
        }
      }
    `,
    (gl) => new BorderedRectangleBuffer(gl),
  )
