import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../helpers/geometry"
import { rectToTriangleBounds, rectToTriangles } from "../../helpers/polygon"
import { createShader } from "../../Shader/createShader"

interface BorderedCircleUniforms {
  transform: mat4
  fillColor: vec4
  strokeColor: vec4
}

export const LegacyBorderedCircleShader = createShader<
  BorderedCircleUniforms,
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
        
        float r = vBounds.w / 2.0;
        vec2 center = vBounds.xy + vBounds.zw / 2.0;
        float len = length(vPosition - center);

        if (len < r - border) {
          gl_FragColor = fillColor;
        } else if (len < r) {
          gl_FragColor = strokeColor;
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
