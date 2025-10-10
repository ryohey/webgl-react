import { mat4 } from "gl-matrix"
import { createContext, useContext } from "react"

export const TransformContext = createContext<mat4>(mat4.create())
export const useTransform = () => useContext(TransformContext)
