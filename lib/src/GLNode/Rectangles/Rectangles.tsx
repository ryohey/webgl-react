import { vec4 } from "gl-matrix"
import { FC, useMemo } from "react"
import { IRect } from "../../helpers/geometry"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import {
  SolidRectangleBuffer,
  SolidRectangleShader,
} from "../../legacy/GLNode/Rectangles/SolidRectangleShader"
import { GLNode } from "../GLNode"
import { RenderNode } from "../RenderNode"
import { RectangleBuffer, RectangleShader } from "./RectangleShader"

export interface RectanglesProps {
  rects: IRect[]
  color: vec4
  zIndex?: number
}

export const Rectangles: FC<RectanglesProps> = ({ rects, color, zIndex }) => {
  const projectionMatrix = useProjectionMatrix()
  const uniforms = useMemo(
    () => ({ projectionMatrix, color }),
    [projectionMatrix, color]
  )

  return (
    <GLNode
      createNode={createRectangleNode}
      uniforms={uniforms}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}

function createRectangleNode(
  gl: WebGLRenderingContext | WebGL2RenderingContext
) {
  if (gl instanceof WebGL2RenderingContext) {
    const shader = RectangleShader(gl)
    const buffer = new RectangleBuffer(shader.createVertexArray())
    return new RenderNode(shader, buffer)
  } else {
    const shader = SolidRectangleShader(gl)
    const buffer = new SolidRectangleBuffer(gl)
    return new RenderNode(shader, buffer)
  }
}
