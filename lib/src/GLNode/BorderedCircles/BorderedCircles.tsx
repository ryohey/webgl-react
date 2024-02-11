import { vec4 } from "gl-matrix"
import { FC, useMemo } from "react"
import { IRect } from "../../helpers/geometry"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import { InstancedGLNode } from "../InstancedGLNode"
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
    <InstancedGLNode
      createShader={BorderedCircleShader}
      createBuffer={(vertexArray) => new BorderedCircleBuffer(vertexArray)}
      uniforms={uniforms}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
