import { vec4 } from "gl-matrix"
import { FC, useMemo } from "react"
import { IRect } from "../../helpers/geometry"
import { useTransform } from "../../hooks/useTransform"
import { GLNode } from "../GLNode"
import { BorderedRectangleShader } from "./BorderedRectangleShader"
import { LegacyBorderedRectangleShader } from "./LegacyBorderedRectangleShader"

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
  const transform = useTransform()
  const uniforms = useMemo(
    () => ({ transform, fillColor, strokeColor }),
    [transform, fillColor, strokeColor],
  )

  return (
    <GLNode
      shader={BorderedRectangleShader}
      shaderFallback={LegacyBorderedRectangleShader}
      uniforms={uniforms}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
