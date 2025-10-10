import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"
import { InstancedBuffer, Shader } from "../../Shader/Shader"
import { uniformMat4, uniformVec4 } from "../../Shader/Uniform"
import { VertexArray } from "../../Shader/VertexArray"

export class BorderedCircleBuffer
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
      new Float32Array(
        rects.flatMap((rect) => [rect.x, rect.y, rect.width, rect.height]),
      ),
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

export const BorderedCircleShader = (gl: WebGL2RenderingContext) =>
  new Shader(
    gl,
    `#version 300 es
      precision lowp float;
      in vec4 position;
      in vec4 bounds;  // x, y, width, height

      uniform mat4 projectionMatrix;
      out vec4 vBounds;
      out vec2 vPosition;

      void main() {
        vec4 transformedPosition = vec4((position.xy * bounds.zw + bounds.xy), position.zw);
        gl_Position = projectionMatrix * transformedPosition;
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
    {
      position: { size: 2, type: gl.FLOAT },
      bounds: { size: 4, type: gl.FLOAT, divisor: 1 },
    },
    {
      projectionMatrix: uniformMat4(),
      fillColor: uniformVec4(),
      strokeColor: uniformVec4(),
    },
    (vertexArray) => new BorderedCircleBuffer(vertexArray),
  )
