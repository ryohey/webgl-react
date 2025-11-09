import { useEffect, useId, useMemo } from "react"
import { IRect } from "../helpers/geometry"
import { useEventSystem } from "../hooks/useEventSystem"
import { useTransform } from "../hooks/useTransform"

export interface HitAreaProps {
  bounds: IRect
  zIndex?: number
  cursor?: string
  onMouseDown?: (event: MouseEvent) => void
  onMouseUp?: (event: MouseEvent) => void
  onMouseMove?: (event: MouseEvent) => void
  onClick?: (event: MouseEvent) => void
  onWheel?: (event: WheelEvent) => void
  onPointerDown?: (event: PointerEvent) => void
  onPointerUp?: (event: PointerEvent) => void
  onPointerMove?: (event: PointerEvent) => void
  onPointerCancel?: (event: PointerEvent) => void
}

export const HitArea = ({
  bounds,
  zIndex = 0,
  cursor,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onClick,
  onWheel,
  onPointerDown,
  onPointerUp,
  onPointerMove,
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
      cursor,
      onMouseDown,
      onMouseUp,
      onMouseMove,
      onClick,
      onWheel,
      onPointerDown,
      onPointerUp,
      onPointerMove,
      onPointerCancel,
    }),
    [
      hitAreaId,
      bounds,
      transform,
      zIndex,
      cursor,
      onMouseDown,
      onMouseUp,
      onMouseMove,
      onClick,
      onWheel,
      onPointerDown,
      onPointerUp,
      onPointerMove,
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
