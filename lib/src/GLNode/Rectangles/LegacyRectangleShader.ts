import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"
import { createShader } from "../../Shader/createShader"

interface RectangleUniforms {
  transform: mat4
  color: vec4
}

export const LegacyRectangleShader = createShader<RectangleUniforms, IRect[]>({
  vertexShader: `
      precision lowp float;
      attribute vec4 position;
      uniform mat4 transform;

      void main() {
        gl_Position = transform * position;
      }
    `,
  fragmentShader: `
      precision lowp float;

      uniform vec4 color;

      void main() {
        gl_FragColor = color;
      }
    `,
  init: {
    position: [],
  },
  update: (rects: IRect[]) => ({
    bufferData: {
      position: rects.flatMap(rectToTriangles),
    },
    vertexCount: rects.length * 6,
  }),
})
