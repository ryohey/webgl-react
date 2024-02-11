import { InstancedBuffer, InstancedShader } from "../../Shader/InstancedShader"
import { uniformMat4, uniformVec4 } from "../../Shader/Uniform"
import { VertexArray } from "../../Shader/VertexArray"
import { initShaderProgram } from "../../Shader/initShaderProgram"
import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"

export class InstancedRectangleBuffer extends InstancedBuffer<
  IRect[],
  "position" | "instanceTransform"
> {
  private _instanceCount: number = 0

  constructor(vertexArray: VertexArray<"position" | "instanceTransform">) {
    super(vertexArray)

    this.vertexArray.updateBuffer(
      "position",
      new Float32Array(rectToTriangles({ x: 0, y: 0, width: 1, height: 1 }))
    )
  }

  update(rects: IRect[]) {
    this.vertexArray.updateBuffer(
      "instanceTransform",
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

export const InstancedRectangleShader = (gl: WebGL2RenderingContext) => {
  const program = initShaderProgram(
    gl,
    `#version 300 es
    precision lowp float;
    layout (location = 0) in vec4 position;
    layout (location = 1) in vec4 instanceTransform; // x, y, width, height
    uniform mat4 uProjectionMatrix;

    void main() {
      float x = instanceTransform.x;
      float y = instanceTransform.y;
      float width = instanceTransform.z;
      float height = instanceTransform.w;

      vec4 transformedPosition = vec4((position.xy * vec2(width, height) + vec2(x, y)), position.zw);
      
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
      instanceTransform: { size: 4, type: gl.FLOAT, divisor: 6 },
    }
  )
}
