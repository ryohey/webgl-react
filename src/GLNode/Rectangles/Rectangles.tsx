import { vec4 } from "gl-matrix"
import { FC } from "react"
import { IRect } from "../../helpers/geometry"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import { GLNode } from "../GLNode"
import {
  SolidRectangleBuffer,
  SolidRectangleShader,
} from "./SolidRectangleShader"

export interface RectanglesProps {
  rects: IRect[]
  color: vec4
  zIndex?: number
}

export const Rectangles: FC<RectanglesProps> = ({ rects, color, zIndex }) => {
  const projectionMatrix = useProjectionMatrix()

  return (
    <GLNode
      createShader={SolidRectangleShader}
      createBuffer={(gl) => new SolidRectangleBuffer(gl)}
      uniforms={{ projectionMatrix, color }}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
