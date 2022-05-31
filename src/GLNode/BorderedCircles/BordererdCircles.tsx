import { vec4 } from "gl-matrix"
import { FC } from "react"
import { IRect } from "../../helpers/geometry"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import { GLNode } from "../GLNode"
import {
  BorderedCircleBuffer,
  BorderedCircleShader,
} from "./BorderedCircleShader"

export interface BordererdCirclesProps {
  rects: IRect[]
  fillColor: vec4
  strokeColor: vec4
  zIndex: number
}

export const BordererdCircles: FC<BordererdCirclesProps> = ({
  rects,
  fillColor,
  strokeColor,
  zIndex,
}) => {
  const projectionMatrix = useProjectionMatrix()

  return (
    <GLNode
      createShader={BorderedCircleShader}
      createBuffer={(gl) => new BorderedCircleBuffer(gl)}
      uniforms={{ projectionMatrix, fillColor, strokeColor }}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
