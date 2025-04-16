import { vec4 } from "gl-matrix"
import { FC, useMemo } from "react"
import { IRect } from "../../helpers/geometry"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import { SolidRectangleShader } from "../../legacy/GLNode/Rectangles/SolidRectangleShader"
import { GLNode } from "../GLNode"
import { RectangleShader } from "./RectangleShader"

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
      shader={RectangleShader}
      shaderFallback={SolidRectangleShader}
      uniforms={uniforms}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
