import { mat4 } from "gl-matrix"
import { IRect } from "../helpers/geometry"

export interface HitArea {
  id: string
  bounds: IRect
  transform: mat4
  zIndex: number
  cursor?: string
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
