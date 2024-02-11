import { initShaderProgram } from "../../Shader/initShaderProgram"
import { InstancedShader } from "../../Shader/InstancedShader"
import { uniformMat4, uniformVec4 } from "../../Shader/Uniform"
import { BorderedCircleBuffer } from "../BorderedCircles/BorderedCircleShader"

export const BorderedRectangleBuffer = BorderedCircleBuffer

export const BorderedRectangleShader = (gl: WebGL2RenderingContext) => {
  const program = initShaderProgram(
    gl,
    `#version 300 es
      precision lowp float;
      in vec4 position;
      in vec4 bounds;  // x, y, width, height

      uniform mat4 uProjectionMatrix;
      out vec4 vBounds;
      out vec2 vPosition;

      void main() {
        vec4 transformedPosition = vec4((position.xy * bounds.zw + bounds.xy), position.zw);
        gl_Position = uProjectionMatrix * transformedPosition;
        vBounds = bounds;
        vPosition = transformedPosition.xy;
      }
    `,
    `#version 300 es
      precision lowp float;

      uniform vec4 uFillColor;
      uniform vec4 uStrokeColor;

      in vec4 vBounds;
      in vec2 vPosition;

      out vec4 outColor;

      void main() {
        float border = 1.0;
        float localX = vPosition.x - vBounds.x;
        float localY = vPosition.y - vBounds.y;

        if ((localX < border) || (localX >= (vBounds.z - border)) || (localY < border) || (localY > (vBounds.w - border))) {
          // draw outline
          outColor = uStrokeColor;
        } else {
          outColor = uFillColor;
        }
      }
    `
  )
  return new InstancedShader(
    gl,
    program,
    {
      projectionMatrix: uniformMat4(gl, program, "uProjectionMatrix"),
      fillColor: uniformVec4(gl, program, "uFillColor"),
      strokeColor: uniformVec4(gl, program, "uStrokeColor"),
    },
    {
      position: { size: 2, type: gl.FLOAT },
      bounds: { size: 4, type: gl.FLOAT, divisor: 1 },
    }
  )
}
