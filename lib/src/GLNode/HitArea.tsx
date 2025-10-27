import { mat4 } from "gl-matrix"
import { useMemo } from "react"
import { HitAreaEventHandler } from "../EventSystem/HitArea"
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

export interface HitAreaProps<T = unknown> {
  bounds: IRect
  zIndex?: number
  data?: T
  onMouseDown?: HitAreaEventHandler<T>
  onMouseUp?: HitAreaEventHandler<T>
  onMouseMove?: HitAreaEventHandler<T>
  onMouseEnter?: HitAreaEventHandler<T>
  onMouseLeave?: HitAreaEventHandler<T>
  onClick?: HitAreaEventHandler<T>
  onPointerDown?: HitAreaEventHandler<T>
  onPointerUp?: HitAreaEventHandler<T>
  onPointerMove?: HitAreaEventHandler<T>
  onPointerEnter?: HitAreaEventHandler<T>
  onPointerLeave?: HitAreaEventHandler<T>
  onPointerCancel?: HitAreaEventHandler<T>
}

export const HitArea = <T,>({
  bounds,
  zIndex = 0,
  data,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  onPointerCancel,
}: HitAreaProps<T>) => {
  const transform = useTransform()

  const finalTransform = useMemo(() => {
    return mat4.clone(transform)
  }, [transform])

  return (
    <hit-area
      bounds={bounds}
      zIndex={zIndex}
      transform={finalTransform}
      data={data}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
    />
  )
}
