import { vec4 } from "gl-matrix"
import { FC, useMemo } from "react"
import { IRect } from "../../helpers/geometry"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import {
  BorderedCircleBuffer as LegacyBorderedCircleBuffer,
  BorderedCircleShader as LegacyBorderedCircleShader,
} from "../../legacy/GLNode/BorderedCircles/BorderedCircleShader"
import { GLNode } from "../GLNode"
import { RenderNode } from "../RenderNode"
import {
  BorderedCircleBuffer,
  BorderedCircleShader,
} from "./BorderedCircleShader"

export interface BorderedCirclesProps {
  rects: IRect[]
  fillColor: vec4
  strokeColor: vec4
  zIndex: number
}

export const BorderedCircles: FC<BorderedCirclesProps> = ({
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
      createNode={createCircleNode}
      uniforms={uniforms}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}

function createCircleNode(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  if (gl instanceof WebGL2RenderingContext) {
    const shader = BorderedCircleShader(gl)
    const buffer = new BorderedCircleBuffer(shader.createVertexArray())
    return new RenderNode(shader, buffer)
  } else {
    const shader = LegacyBorderedCircleShader(gl)
    const buffer = new LegacyBorderedCircleBuffer(gl)
    return new RenderNode(shader, buffer)
  }
}
