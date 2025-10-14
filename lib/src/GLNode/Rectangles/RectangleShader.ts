import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"
import { createShader } from "../../Shader/createShader"
import { InstancedBuffer } from "../../Shader/Shader"
import { VertexArray } from "../../Shader/VertexArray"

interface RectangleUniforms {
  transform: mat4
  color: vec4
}

class RectangleBuffer
  implements InstancedBuffer<IRect[], "position" | "bounds">
{
  private _instanceCount: number = 0

  constructor(readonly vertexArray: VertexArray<"position" | "bounds">) {
    this.vertexArray.updateBuffer(
      "position",
      new Float32Array(rectToTriangles({ x: 0, y: 0, width: 1, height: 1 })),
    )
  }

  update(rects: IRect[]) {
    this.vertexArray.updateBuffer(
      "bounds",
      new Float32Array(rects.flatMap((r) => [r.x, r.y, r.width, r.height])),
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
  createShader<RectangleUniforms, "position" | "bounds">(
    gl,
    `#version 300 es
    precision lowp float;
    in vec2 position;
    in vec4 bounds; // x, y, width, height
    uniform mat4 transform;

    void main() {
      vec4 transformedPosition = vec4((position.xy * bounds.zw + bounds.xy), 0.0, 1.0);
      gl_Position = transform * transformedPosition;
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
    (vertexArray) => new RectangleBuffer(vertexArray),
    {
      instanceAttributes: ["bounds"],
    },
  )
