import { mat4 } from "gl-matrix"
import React, { FC, ReactNode } from "react"
import {
  ProjectionMatrixContext,
  useProjectionMatrix,
} from "../hooks/useProjectionMatrix"

export const Transform: FC<{ matrix: mat4; children: ReactNode }> = ({
  matrix,
  children,
}) => {
  const projectionMatrix = useProjectionMatrix()
  const t = mat4.create()
  mat4.multiply(t, projectionMatrix, matrix)
  return (
    <ProjectionMatrixContext.Provider value={t}>
      {children}
    </ProjectionMatrixContext.Provider>
  )
}
