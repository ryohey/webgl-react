import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"
import { createShader } from "../../Shader/createShader"

interface RectangleUniforms {
  transform: mat4
  color: vec4
}

export const RectangleShader = createShader<RectangleUniforms, IRect[]>({
  vertexShader: `#version 300 es
    precision lowp float;
    in vec2 position;
    in vec4 bounds; // x, y, width, height
    uniform mat4 transform;

    void main() {
      vec4 transformedPosition = vec4((position.xy * bounds.zw + bounds.xy), 0.0, 1.0);
      gl_Position = transform * transformedPosition;
    }
    `,
  fragmentShader: `#version 300 es
    precision lowp float;
    uniform vec4 color;
    out vec4 outColor;

    void main() {
      outColor = color;
    }
    `,
  init: {
    // Set up base rectangle geometry (initial data)
    position: {
      data: rectToTriangles({ x: 0, y: 0, width: 1, height: 1 }),
      numComponents: 2,
    },
    bounds: {
      data: [],
      numComponents: 4, // x, y, width, height per instance
      divisor: 1, // Instance attribute
    },
  },
  update: (rects: IRect[]) => ({
    bufferData: {
      bounds: rects.flatMap((r) => [r.x, r.y, r.width, r.height]),
    },
    vertexCount: 6,
    instanceCount: rects.length,
  }),
})
