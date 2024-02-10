import { InstancedShader } from "../../Shader/InstancedShader"
import { uniformMat4, uniformVec4 } from "../../Shader/Uniform"
import { initShaderProgram } from "../../Shader/initShaderProgram"

export const InstancedRectangleShader = (gl: WebGL2RenderingContext) => {
  const program = initShaderProgram(
    gl,
    `#version 300 es
    precision lowp float;
    layout (location = 0) in vec2 position;
    layout (location = 1) in vec4 instanceTransform; // x, y, width, height
    uniform mat4 projectionMatrix;

    void main() {
      float x = instanceTransform.x;
      float y = instanceTransform.y;
      float width = instanceTransform.z;
      float height = instanceTransform.w;

      vec4 transformedPosition = vec4(position * vec2(width, height) + vec2(x, y), vec2(0));
      
      gl_Position = projectionMatrix * transformedPosition;
    }
    `,
    `#version 300 es
    precision lowp float;
    uniform vec4 uColor;
    out vec4 outColor;

    void main() {
      outColor = uColor;
    }
    `
  )
  return new InstancedShader(
    gl,
    program,
    {
      projectionMatrix: uniformMat4(gl, program, "projectionMatrix"),
      color: uniformVec4(gl, program, "uColor"),
    },
    {
      position: { size: 2, type: gl.FLOAT },
      instanceTransform: {
        size: 4,
        type: gl.FLOAT,
        divisor: 6,
      },
    }
  )
}
