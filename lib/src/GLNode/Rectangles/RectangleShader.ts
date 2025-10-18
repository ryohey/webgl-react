import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"
import { createShader } from "../../Shader/createShader"

interface RectangleUniforms {
  transform: mat4
  color: vec4
}

export const RectangleShader = (gl: WebGL2RenderingContext) =>
  createShader<RectangleUniforms, "position" | "bounds", IRect[]>(gl, {
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
    init: () => ({
      // Set up base rectangle geometry (runs once)
      position: rectToTriangles({ x: 0, y: 0, width: 1, height: 1 }),
    }),
    update: (rects: IRect[]) => ({
      // Update instance data only
      bounds: rects.flatMap((r) => [r.x, r.y, r.width, r.height]),
      vertexCount: 6,
      instanceCount: rects.length,
    }),
    instanceAttributes: ["bounds"],
  })
