import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../../helpers/geometry"
import { rectToTriangles } from "../../../helpers/polygon"
import { createShader } from "../../Shader/createShader"
import { LegacyBufferUpdater } from "../../Shader/createBuffer"

interface SolidRectangleUniforms {
  uTransform: mat4
  uColor: vec4
}

export const SolidRectangleShader = (gl: WebGLRenderingContext) =>
  createShader<SolidRectangleUniforms, "position", IRect[]>(gl, {
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
    updateFunction: (updater: LegacyBufferUpdater<"position">, rects: IRect[]) => {
      const positions = rects.flatMap(rectToTriangles)
      updater.updateBuffer("position", new Float32Array(positions))
      return rects.length * 6
    },
  })
