import { useEffect, useId, useMemo } from "react"
import { IRect } from "../helpers/geometry"
import { useEventSystem } from "../hooks/useEventSystem"
import { useTransform } from "../hooks/useTransform"

export interface HitAreaProps {
  bounds: IRect
  zIndex?: number
  onMouseDown?: (event: MouseEvent) => void
  onMouseUp?: (event: MouseEvent) => void
  onMouseMove?: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  onClick?: (event: MouseEvent) => void
  onPointerDown?: (event: PointerEvent) => void
  onPointerUp?: (event: PointerEvent) => void
  onPointerMove?: (event: PointerEvent) => void
  onPointerEnter?: (event: PointerEvent) => void
  onPointerLeave?: (event: PointerEvent) => void
  onPointerCancel?: (event: PointerEvent) => void
}

export const HitArea = ({
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
}: HitAreaProps) => {
  const eventSystem = useEventSystem()
  const transform = useTransform()
  const hitAreaId = useId()
  const hitArea = useMemo(
    () => ({
      id: hitAreaId,
      bounds,
      transform,
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
    }),
    [
      hitAreaId,
      bounds,
      transform,
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
    ],
  )

  useEffect(() => {
    eventSystem.addHitArea(hitArea)
    return () => {
      eventSystem.removeHitArea(hitAreaId)
    }
  }, [eventSystem, hitArea])

  return null
}
