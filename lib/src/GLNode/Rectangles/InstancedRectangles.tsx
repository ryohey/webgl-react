import { vec4 } from "gl-matrix"
import { FC, useMemo } from "react"
import { IRect } from "../../helpers/geometry"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import { InstancedGLNode } from "../InstancedGLNode"
import {
  InstancedRectangleBuffer,
  InstancedRectangleShader,
} from "./InstancedRectangleShader"

export interface InstancedRectanglesProps {
  rects: IRect[]
  color: vec4
  zIndex?: number
}

export const InstancedRectangles: FC<InstancedRectanglesProps> = ({
  rects,
  color,
  zIndex,
}) => {
  const projectionMatrix = useProjectionMatrix()
  const uniforms = useMemo(
    () => ({ projectionMatrix, color }),
    [projectionMatrix, color]
  )

  return (
    <InstancedGLNode
      createShader={InstancedRectangleShader}
      createBuffer={(vertexArray) => new InstancedRectangleBuffer(vertexArray)}
      uniforms={uniforms}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
