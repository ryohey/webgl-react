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
  onClick?: (event: MouseEvent) => void
  onWheel?: (event: WheelEvent) => void
  onPointerDown?: (event: PointerEvent) => void
  onPointerUp?: (event: PointerEvent) => void
  onPointerMove?: (event: PointerEvent) => void
  onPointerCancel?: (event: PointerEvent) => void
}
