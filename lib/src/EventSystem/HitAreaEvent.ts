import { vec2 } from "gl-matrix"
import { InputEvent } from "./EventSystem"

export class HitAreaEvent<T = unknown> {
  public readonly nativeEvent: InputEvent
  public readonly point: vec2

  private propagationStopped = false
  private defaultPrevented = false

  constructor(nativeEvent: InputEvent, point: vec2) {
    this.nativeEvent = nativeEvent
    this.point = point
  }

  stopPropagation(): void {
    this.propagationStopped = true
  }

  preventDefault(): void {
    this.defaultPrevented = true
    this.nativeEvent.preventDefault()
  }

  get isPropagationStopped(): boolean {
    return this.propagationStopped
  }

  get isDefaultPrevented(): boolean {
    return this.defaultPrevented
  }
}
