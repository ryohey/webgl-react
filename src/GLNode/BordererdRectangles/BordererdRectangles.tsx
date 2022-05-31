import { vec4 } from "gl-matrix"
import { VFC } from "react"
import { IRect } from "../../helpers/geometry"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import { GLNode } from "../GLNode"
import {
  BorderedRectangleBuffer,
  BorderedRectangleShader,
} from "./BorderedRectangleShader"

export interface BordererdRectanglesProps {
  rects: IRect[]
  fillColor: vec4
  strokeColor: vec4
  zIndex?: number
}

export const BordererdRectangles: VFC<BordererdRectanglesProps> = ({
  rects,
  fillColor,
  strokeColor,
  zIndex,
}) => {
  const projectionMatrix = useProjectionMatrix()

  return (
    <GLNode
      createShader={BorderedRectangleShader}
      createBuffer={(gl) => new BorderedRectangleBuffer(gl)}
      uniforms={{ projectionMatrix, fillColor, strokeColor }}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
