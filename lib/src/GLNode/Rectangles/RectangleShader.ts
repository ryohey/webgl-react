import { InstancedBuffer, Shader } from "../../Shader/Shader"
import { uniformMat4, uniformVec4 } from "../../Shader/Uniform"
import { VertexArray } from "../../Shader/VertexArray"
import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"

class RectangleBuffer
  implements InstancedBuffer<IRect[], "position" | "bounds">
{
  private _instanceCount: number = 0

  constructor(readonly vertexArray: VertexArray<"position" | "bounds">) {
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

export const RectangleShader = (gl: WebGL2RenderingContext) =>
  new Shader(
    gl,
    `#version 300 es
    precision lowp float;
    layout (location = 0) in vec4 position;
    layout (location = 1) in vec4 bounds; // x, y, width, height
    uniform mat4 projectionMatrix;

    void main() {
      vec4 transformedPosition = vec4((position.xy * bounds.zw + bounds.xy), position.zw);
      gl_Position = projectionMatrix * transformedPosition;
    }
    `,
    `#version 300 es
    precision lowp float;
    uniform vec4 color;
    out vec4 outColor;

    void main() {
      outColor = color;
    }
    `,
    {
      position: { size: 2, type: gl.FLOAT },
      bounds: { size: 4, type: gl.FLOAT, divisor: 1 },
    },
    {
      projectionMatrix: uniformMat4(),
      color: uniformVec4(),
    },
    (vertexArray) => new RectangleBuffer(vertexArray)
  )
