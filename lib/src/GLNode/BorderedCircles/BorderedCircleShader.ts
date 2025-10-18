import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"
import { createInstancedShader } from "../../Shader/createShader"

interface BorderedCircleUniforms {
  transform: mat4
  fillColor: vec4
  strokeColor: vec4
}

export const BorderedCircleShader = (gl: WebGL2RenderingContext) =>
  createInstancedShader<BorderedCircleUniforms, "position" | "bounds", IRect[]>(gl, {
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
        
        float r = vBounds.w / 2.0;
        vec2 center = vBounds.xy + vBounds.zw / 2.0;
        float len = length(vPosition - center);

        if (len < r - border) {
          outColor = fillColor;
        } else if (len < r) {
          outColor = strokeColor;
        }
      }
    `,
    initFunction: () => ({
      // Set up base rectangle geometry (runs once)
      position: new Float32Array(rectToTriangles({ x: 0, y: 0, width: 1, height: 1 })),
    }),
    updateFunction: (rects: IRect[]) => ({
      // Update instance data only
      bounds: new Float32Array(rects.flatMap((r) => [r.x, r.y, r.width, r.height])),
      vertexCount: 6,
      instanceCount: rects.length,
    }),
    instanceAttributes: ["bounds"],
  })
