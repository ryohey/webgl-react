import { vec4 } from "gl-matrix"
import { FC, useMemo } from "react"
import { IRect } from "../../helpers/geometry"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import { BorderedRectangleShader as LegacyBorderedRectangleShader } from "../../legacy/GLNode/BorderedRectangles/BorderedRectangleShader"
import { GLNode } from "../GLNode"
import { BorderedRectangleShader } from "./BorderedRectangleShader"

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
    [projectionMatrix, fillColor, strokeColor],
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
