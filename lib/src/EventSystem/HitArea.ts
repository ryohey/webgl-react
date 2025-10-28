import { mat4 } from "gl-matrix"
import { IRect } from "../helpers/geometry"
import { InputEvent } from "./EventSystem"

export interface InputEventHandler {
  (event: InputEvent): void
}

interface InteractionEvents<Handler> {
  onMouseDown?: Handler
  onMouseUp?: Handler
  onMouseMove?: Handler
  onMouseEnter?: Handler
  onMouseLeave?: Handler
  onClick?: Handler
  onPointerDown?: Handler
  onPointerUp?: Handler
  onPointerMove?: Handler
  onPointerEnter?: Handler
  onPointerLeave?: Handler
  onPointerCancel?: Handler
}

export type HitAreaEvents = InteractionEvents<InputEventHandler>

export interface HitArea extends HitAreaEvents {
  bounds: IRect
  transform: mat4
  zIndex: number
}
