import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../helpers/geometry"
import { rectToTriangleBounds, rectToTriangles } from "../../helpers/polygon"
import { createShader } from "../../Shader/createShader"

interface BorderedRectangleUniforms {
  transform: mat4
  fillColor: vec4
  strokeColor: vec4
}

export const LegacyBorderedRectangleShader = createShader<
  BorderedRectangleUniforms,
  IRect[]
>({
  vertexShader: `
      precision lowp float;
      attribute vec4 position;

      // XYZW -> X, Y, Width, Height
      attribute vec4 bounds;

      uniform mat4 transform;
      varying vec4 vBounds;
      varying vec2 vPosition;

      void main() {
        gl_Position = transform * position;
        vBounds = bounds;
        vPosition = position.xy;
      }
    `,
  fragmentShader: `
      precision lowp float;

      uniform vec4 fillColor;
      uniform vec4 strokeColor;

      varying vec4 vBounds;
      varying vec2 vPosition;

      void main() {
        float border = 1.0;
        float localX = vPosition.x - vBounds.x;
        float localY = vPosition.y - vBounds.y;

        if ((localX < border) || (localX >= (vBounds.z - border)) || (localY < border) || (localY > (vBounds.w - border))) {
          // draw outline
          gl_FragColor = strokeColor;
        } else {
          gl_FragColor = fillColor;
        }
      }
    `,
  init: {
    position: [],
    bounds: [],
  },
  update: (rects: IRect[]) => ({
    bufferData: {
      position: rects.flatMap(rectToTriangles),
      bounds: rects.flatMap(rectToTriangleBounds),
    },
    vertexCount: rects.length * 6,
  }),
})
