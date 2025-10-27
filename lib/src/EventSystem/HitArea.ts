import { mat4 } from "gl-matrix"
import { IRect } from "../helpers/geometry"
import { HitAreaEvent } from "./HitAreaEvent"

export interface HitAreaEventHandler<T = unknown> {
  (event: HitAreaEvent<T>): void
}

export interface HitAreaEvents<T = unknown> {
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

export interface HitArea<T = unknown> extends HitAreaEvents<T> {
  bounds: IRect
  transform: mat4
  zIndex: number
  data?: T
}
