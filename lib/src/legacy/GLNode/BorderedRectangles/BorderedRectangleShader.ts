import { IRect } from "../../../helpers/geometry"
import { rectToTriangleBounds, rectToTriangles } from "../../../helpers/polygon"
import { createBuffer } from "../../Shader/createBuffer"
import { createShader } from "../../Shader/createShader"

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
    (gl) => createBuffer(
      gl,
      ["position", "bounds"] as const,
      (gl, buffers, rects: IRect[]) => {
        const positions = rects.flatMap(rectToTriangles)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)

        const bounds = rects.flatMap(rectToTriangleBounds)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.bounds)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bounds), gl.DYNAMIC_DRAW)

        return rects.length * 6
      },
    ),
  )
