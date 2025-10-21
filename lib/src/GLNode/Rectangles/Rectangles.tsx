import { vec4 } from "gl-matrix"
import { FC, useMemo } from "react"
import { IRect } from "../../helpers/geometry"
import { useTransform } from "../../hooks/useTransform"
import { withFallback } from "../../Shader/withFallback"
import { GLNode } from "../GLNode"
import { LegacyRectangleShader } from "./LegacyRectangleShader"
import { RectangleShader } from "./RectangleShader"

const shader = withFallback(RectangleShader, LegacyRectangleShader)

export interface RectanglesProps {
  rects: IRect[]
  color: vec4
  zIndex?: number
}

export const Rectangles: FC<RectanglesProps> = ({ rects, color, zIndex }) => {
  const transform = useTransform()
  const uniforms = useMemo(() => ({ transform, color }), [transform, color])

  return (
    <GLNode
      shader={shader}
      uniforms={uniforms}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
