import { InstancedBuffer, InstancedShader } from "../../Shader/InstancedShader"
import { uniformMat4, uniformVec4 } from "../../Shader/Uniform"
import { VertexArray } from "../../Shader/VertexArray"
import { initShaderProgram } from "../../Shader/initShaderProgram"
import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"

export class RectangleBuffer extends InstancedBuffer<
  IRect[],
  "position" | "bounds"
> {
  private _instanceCount: number = 0

  constructor(vertexArray: VertexArray<"position" | "bounds">) {
    super(vertexArray)

    this.vertexArray.updateBuffer(
      "position",
      new Float32Array(rectToTriangles({ x: 0, y: 0, width: 1, height: 1 }))
    )
  }

  update(rects: IRect[]) {
    this.vertexArray.updateBuffer(
      "bounds",
      new Float32Array(rects.flatMap((r) => [r.x, r.y, r.width, r.height]))
    )
    this._instanceCount = rects.length
  }

  get vertexCount() {
    return 6
  }

  get instanceCount() {
    return this._instanceCount
  }
}

export const RectangleShader = (gl: WebGL2RenderingContext) => {
  const program = initShaderProgram(
    gl,
    `#version 300 es
    precision lowp float;
    layout (location = 0) in vec4 position;
    layout (location = 1) in vec4 bounds; // x, y, width, height
    uniform mat4 uProjectionMatrix;

    void main() {
      vec4 transformedPosition = vec4((position.xy * bounds.zw + bounds.xy), position.zw);
      gl_Position = uProjectionMatrix * transformedPosition;
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
      bounds: { size: 4, type: gl.FLOAT, divisor: 1 },
    }
  )
}
