import { mat4 } from "gl-matrix"
import { useMemo } from "react"
import { HitAreaEvents } from "../EventSystem/HitArea"
import { IRect } from "../helpers/geometry"
import { useTransform } from "../hooks/useTransform"

// JSX type definitions for reconciler
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "hit-area": any
    }
  }
}

export interface HitAreaProps<T = unknown> extends HitAreaEvents {
  bounds: IRect
  zIndex?: number
  data?: T
}

export const HitArea = <T,>(props: HitAreaProps<T>) => {
  const transform = useTransform()

  const finalTransform = useMemo(() => {
    return mat4.clone(transform)
  }, [transform])

  return <hit-area {...props} transform={finalTransform} />
}
