import { InstancedBuffer, InstancedShader } from "../../Shader/InstancedShader"
import { uniformMat4, uniformVec4 } from "../../Shader/Uniform"
import { initShaderProgram } from "../../Shader/initShaderProgram"
import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"

export class InstancedRectangleBuffer extends InstancedBuffer<
  IRect[],
  "position"
> {
  private _vertexCount: number = 0
  private _instanceCount: number = 0

  update(rects: IRect[]) {
    this.vertexArray.updateBuffer(
      "position",
      new Float32Array(rects.flatMap(rectToTriangles))
    )

    this._vertexCount = rects.length * 6
    this._instanceCount = 0
  }

  get vertexCount() {
    return this._vertexCount
  }

  get instanceCount() {
    return this._instanceCount
  }
}

export const InstancedRectangleShader = (gl: WebGL2RenderingContext) => {
  const program = initShaderProgram(
    gl,
    `#version 300 es
    precision lowp float;
    layout (location = 0) in vec4 position;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * position;
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
      projectionMatrix: uniformMat4(gl, program, "uProjectionMatrix"),
      color: uniformVec4(gl, program, "uColor"),
    },
    {
      position: { size: 2, type: gl.FLOAT },
    }
  )
}
