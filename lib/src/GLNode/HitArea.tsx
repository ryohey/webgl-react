import { mat4 } from "gl-matrix"
import { useEffect, useMemo } from "react"
import { IRect } from "../helpers/geometry"
import { useEventSystem } from "../hooks/useEventSystem"
import { useTransform } from "../hooks/useTransform"
import { HitAreaEventHandler } from "../EventSystem/EventSystem"

export interface HitAreaProps<T = unknown> {
  bounds: IRect
  zIndex?: number
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
  data?: T
}

export const HitArea = <T,>({
  bounds,
  zIndex = 0,
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
  data,
}: HitAreaProps<T>) => {
  const eventSystem = useEventSystem()
  const transform = useTransform()

  const finalTransform = useMemo(() => {
    return mat4.clone(transform)
  }, [transform])

  const hitAreaId = useMemo(() => `hit-area-${Math.random()}`, [])

  useEffect(() => {
    const hitArea = {
      id: hitAreaId,
      bounds,
      transform: finalTransform,
      zIndex,
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
      data,
    }

    eventSystem.addHitArea(hitArea)

    return () => {
      eventSystem.removeHitArea(hitAreaId)
    }
  }, [
    eventSystem,
    hitAreaId,
    bounds,
    finalTransform,
    zIndex,
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
    data,
  ])

  return null
}
