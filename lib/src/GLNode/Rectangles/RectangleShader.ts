import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"
import { createInstancedShader } from "../../Shader/createShader"

interface RectangleUniforms {
  transform: mat4
  color: vec4
}

export const RectangleShader = (gl: WebGL2RenderingContext) =>
  createInstancedShader<RectangleUniforms, "position" | "bounds", IRect[]>(gl, {
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
    updateFunction: (vertexArray, rects: IRect[]) => {
      // Set up base rectangle geometry
      vertexArray.updateBuffer(
        "position",
        new Float32Array(rectToTriangles({ x: 0, y: 0, width: 1, height: 1 })),
      )
      
      // Update instance data
      vertexArray.updateBuffer(
        "bounds",
        new Float32Array(rects.flatMap((r) => [r.x, r.y, r.width, r.height])),
      )
      
      return { vertexCount: 6, instanceCount: rects.length }
    },
    instanceAttributes: ["bounds"],
  })
