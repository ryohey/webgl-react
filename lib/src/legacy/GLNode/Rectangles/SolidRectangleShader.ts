import { IRect } from "../../../helpers/geometry"
import { rectToTriangles } from "../../../helpers/polygon"
import { createShader } from "../../Shader/createShader"

export const SolidRectangleShader = (gl: WebGLRenderingContext) =>
  createShader(gl, {
    vertexShader: `
      precision lowp float;
      attribute vec4 aVertexPosition;
      uniform mat4 uTransform;

      void main() {
        gl_Position = uTransform * aVertexPosition;
      }
    `,
    fragmentShader: `
      precision lowp float;

      uniform vec4 uColor;

      void main() {
        gl_FragColor = uColor;
      }
    `,
    attributeNames: ["position"] as const,
    updateFunction: (gl, buffers, rects: IRect[]) => {
      const positions = rects.flatMap(rectToTriangles)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)
      return rects.length * 6
    },
  })
