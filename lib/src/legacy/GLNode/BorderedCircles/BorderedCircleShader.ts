import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../../helpers/geometry"
import { rectToTriangleBounds, rectToTriangles } from "../../../helpers/polygon"
import { createShader } from "../../Shader/createShader"
import { LegacyBufferUpdater } from "../../Shader/createBuffer"

interface BorderedCircleUniforms {
  uTransform: mat4
  uFillColor: vec4
  uStrokeColor: vec4
}

export const BorderedCircleShader = (gl: WebGLRenderingContext) =>
  createShader<BorderedCircleUniforms, "position" | "bounds", IRect[]>(gl, {
    vertexShader: `
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
    fragmentShader: `
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
    attributeNames: ["position", "bounds"] as const,
    updateFunction: (updater: LegacyBufferUpdater<"position" | "bounds">, rects: IRect[]) => {
      const positions = rects.flatMap(rectToTriangles)
      updater.updateBuffer("position", new Float32Array(positions))

      const bounds = rects.flatMap(rectToTriangleBounds)
      updater.updateBuffer("bounds", new Float32Array(bounds))

      return rects.length * 6
    },
  })
