import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"
import { initShaderProgram } from "../../Shader/initShaderProgram"
import { InstancedBuffer, InstancedShader } from "../../Shader/InstancedShader"
import { uniformMat4, uniformVec4 } from "../../Shader/Uniform"
import { VertexArray } from "../../Shader/VertexArray"

export class BorderedCircleBuffer extends InstancedBuffer<
  IRect[],
  "aVertexPosition" | "aBounds"
> {
  private _instanceCount: number = 0

  constructor(vertexArray: VertexArray<"aVertexPosition" | "aBounds">) {
    super(vertexArray)

    this.vertexArray.updateBuffer(
      "aVertexPosition",
      new Float32Array(rectToTriangles({ x: 0, y: 0, width: 1, height: 1 }))
    )
  }

  update(rects: IRect[]) {
    this.vertexArray.updateBuffer(
      "aBounds",
      new Float32Array(
        rects.flatMap((rect) => [rect.x, rect.y, rect.width, rect.height])
      )
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

export const BorderedCircleShader = (gl: WebGL2RenderingContext) => {
  const program = initShaderProgram(
    gl,
    `#version 300 es
      precision lowp float;
      in vec4 aVertexPosition;

      // XYZW -> X, Y, Width, Height
      in vec4 aBounds;

      uniform mat4 uProjectionMatrix;
      out vec4 vBounds;
      out vec2 vPosition;

      void main() {
        vec4 transformedPosition = vec4((aVertexPosition.xy * aBounds.zw + aBounds.xy), aVertexPosition.zw);
        gl_Position = uProjectionMatrix * transformedPosition;
        vBounds = aBounds;
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
        
        float r = vBounds.w / 2.0;
        vec2 center = vBounds.xy + vBounds.zw / 2.0;
        float len = length(vPosition - center);

        if (len < r - border) {
          outColor = uFillColor;
        } else if (len < r) {
          outColor = uStrokeColor;
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
      aVertexPosition: { size: 2, type: gl.FLOAT },
      aBounds: { size: 4, type: gl.FLOAT, divisor: 1 },
    }
  )
}
