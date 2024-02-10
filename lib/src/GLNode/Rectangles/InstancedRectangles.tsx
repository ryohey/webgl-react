import { vec4 } from "gl-matrix"
import { FC, useMemo } from "react"
import { IRect } from "../../helpers/geometry"
import { rectToTriangles } from "../../helpers/polygon"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import { InstancedGLNode } from "../InstancedGLNode"
import { InstancedRectangleShader } from "./InstancedRectangleShader"

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
      uniforms={uniforms}
      inputs={{
        position: new Float32Array(
          rectToTriangles({ x: 0, y: 0, width: 1, height: 1 })
        ),
        instanceTransform: new Float32Array(
          rects.flatMap((r) => [r.x, r.y, r.width, r.height])
        ),
      }}
      zIndex={zIndex}
    />
  )
}
