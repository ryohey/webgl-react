import { vec4 } from "gl-matrix"
import { FC, useMemo } from "react"
import { IRect } from "../../helpers/geometry"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import {
  BorderedRectangleBuffer as LegacyBorderedRectangleBuffer,
  BorderedRectangleShader as LegacyBorderedRectangleShader,
} from "../../legacy/GLNode/BorderedRectangles/BorderedRectangleShader"
import { GLNode } from "../GLNode"
import { RenderNode } from "../RenderNode"
import {
  BorderedRectangleBuffer,
  BorderedRectangleShader,
} from "./BorderedRectangleShader"

export interface BorderedRectanglesProps {
  rects: IRect[]
  fillColor: vec4
  strokeColor: vec4
  zIndex?: number
}

export const BorderedRectangles: FC<BorderedRectanglesProps> = ({
  rects,
  fillColor,
  strokeColor,
  zIndex,
}) => {
  const projectionMatrix = useProjectionMatrix()
  const uniforms = useMemo(
    () => ({ projectionMatrix, fillColor, strokeColor }),
    [projectionMatrix, fillColor, strokeColor]
  )

  return (
    <GLNode
      createNode={createBorderedRectangleNode}
      uniforms={uniforms}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}

function createBorderedRectangleNode(
  gl: WebGLRenderingContext | WebGL2RenderingContext
) {
  if (gl instanceof WebGL2RenderingContext) {
    const shader = BorderedRectangleShader(gl)
    const buffer = new BorderedRectangleBuffer(shader.createVertexArray())
    return new RenderNode(shader, buffer)
  } else {
    const shader = LegacyBorderedRectangleShader(gl)
    const buffer = new LegacyBorderedRectangleBuffer(gl)
    return new RenderNode(shader, buffer)
  }
}
