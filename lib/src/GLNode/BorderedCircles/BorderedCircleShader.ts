import { IRect } from "../../helpers/geometry"
import { rectToTriangleBounds, rectToTriangles } from "../../helpers/polygon"
import { Attrib } from "../../Shader/Attrib"
import { Shader, ShaderBuffer } from "../../Shader/Shader"
import { uniformMat4, uniformVec4 } from "../../Shader/Uniform"

export class BorderedCircleBuffer
  implements ShaderBuffer<"position" | "bounds">
{
  private gl: WebGL2RenderingContext

  readonly buffers: {
    position: WebGLBuffer
    bounds: WebGLBuffer
  }
  private _vertexCount: number = 0

  constructor(gl: WebGL2RenderingContext) {
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

export const BorderedCircleShader = (gl: WebGL2RenderingContext) =>
  new Shader(
    gl,
    `
      precision lowp float;
      attribute vec4 aVertexPosition;

      // XYZW -> X, Y, Width, Height
      attribute vec4 aBounds;

      uniform mat4 uProjectionMatrix;
      varying vec4 vBounds;
      varying vec2 vPosition;

      void main() {
        gl_Position = uProjectionMatrix * aVertexPosition;
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
        
        float r = vBounds.w / 2.0;
        vec2 center = vBounds.xy + vBounds.zw / 2.0;
        float len = length(vPosition - center);

        if (len < r - border) {
          gl_FragColor = uFillColor;
        } else if (len < r) {
          gl_FragColor = uStrokeColor;
        }
      }
    `,
    (program) => ({
      position: new Attrib(gl, program, "aVertexPosition", 2),
      bounds: new Attrib(gl, program, "aBounds", 4),
    }),
    (program) => ({
      projectionMatrix: uniformMat4(gl, program, "uProjectionMatrix"),
      fillColor: uniformVec4(gl, program, "uFillColor"),
      strokeColor: uniformVec4(gl, program, "uStrokeColor"),
    })
  )
