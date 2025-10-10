import { mat4 } from "gl-matrix"
import { FC, ReactNode } from "react"
import {
  TransformContext,
  useTransform,
} from "../hooks/useTransform"

export const Transform: FC<{ matrix: mat4; children: ReactNode }> = ({
  matrix,
  children,
}) => {
  const transform = useTransform()
  const t = mat4.create()
  mat4.multiply(t, transform, matrix)
  return (
    <TransformContext.Provider value={t}>
      {children}
    </TransformContext.Provider>
  )
}
