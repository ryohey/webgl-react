import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"
import { createShader } from "../../Shader/createShader"

interface BorderedRectangleUniforms {
  transform: mat4
  fillColor: vec4
  strokeColor: vec4
}

export const BorderedRectangleShader = (gl: WebGL2RenderingContext) =>
  createShader<BorderedRectangleUniforms, "position" | "bounds", IRect[]>(gl, {
    vertexShader: `#version 300 es
      precision lowp float;
      in vec2 position;
      in vec4 bounds;  // x, y, width, height

      uniform mat4 transform;
      out vec4 vBounds;
      out vec2 vPosition;

      void main() {
        vec4 transformedPosition = vec4((position.xy * bounds.zw + bounds.xy), 0.0, 1.0);
        gl_Position = transform * transformedPosition;
        vBounds = bounds;
        vPosition = transformedPosition.xy;
      }
    `,
    fragmentShader: `#version 300 es
      precision lowp float;

      uniform vec4 fillColor;
      uniform vec4 strokeColor;

      in vec4 vBounds;
      in vec2 vPosition;

      out vec4 outColor;

      void main() {
        float border = 1.0;
        float localX = vPosition.x - vBounds.x;
        float localY = vPosition.y - vBounds.y;

        if ((localX < border) || (localX >= (vBounds.z - border)) || (localY < border) || (localY > (vBounds.w - border))) {
          // draw outline
          outColor = strokeColor;
        } else {
          outColor = fillColor;
        }
      }
    `,
    init: () => ({
      // Set up base rectangle geometry (runs once)
      position: new Float32Array(rectToTriangles({ x: 0, y: 0, width: 1, height: 1 })),
    }),
    update: (rects: IRect[]) => ({
      // Update instance data only
      bounds: new Float32Array(rects.flatMap((r) => [r.x, r.y, r.width, r.height])),
      vertexCount: 6,
      instanceCount: rects.length,
    }),
    instanceAttributes: ["bounds"]
  })
