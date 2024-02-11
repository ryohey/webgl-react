import { vec4 } from "gl-matrix"
import { FC, useMemo } from "react"
import { IRect } from "../../helpers/geometry"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import { InstancedGLNode } from "../InstancedGLNode"
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
    <InstancedGLNode
      createShader={BorderedRectangleShader}
      createBuffer={(vertexArray) => new BorderedRectangleBuffer(vertexArray)}
      uniforms={uniforms}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
