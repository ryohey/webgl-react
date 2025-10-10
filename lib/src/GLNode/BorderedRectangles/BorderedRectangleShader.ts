import { Shader } from "../../Shader/Shader"
import { uniformMat4, uniformVec4 } from "../../Shader/Uniform"
import { BorderedCircleBuffer } from "../BorderedCircles/BorderedCircleShader"

export const BorderedRectangleShader = (gl: WebGL2RenderingContext) =>
  new Shader(
    gl,
    `#version 300 es
      precision lowp float;
      in vec4 position;
      in vec4 bounds;  // x, y, width, height

      uniform mat4 transform;
      out vec4 vBounds;
      out vec2 vPosition;

      void main() {
        vec4 transformedPosition = vec4((position.xy * bounds.zw + bounds.xy), position.zw);
        gl_Position = transform * transformedPosition;
        vBounds = bounds;
        vPosition = transformedPosition.xy;
      }
    `,
    `#version 300 es
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
    {
      position: { size: 2, type: gl.FLOAT },
      bounds: { size: 4, type: gl.FLOAT, divisor: 1 },
    },
    {
      transform: uniformMat4(),
      fillColor: uniformVec4(),
      strokeColor: uniformVec4(),
    },
    (vertexArray) => new BorderedCircleBuffer(vertexArray),
  )
