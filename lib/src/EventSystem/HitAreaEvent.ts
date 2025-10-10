import { vec2 } from "gl-matrix"
import { InputEvent } from "./EventSystem"

export class HitAreaEvent<T = unknown> {
  public readonly nativeEvent: InputEvent
  public readonly point: vec2
  public readonly data?: T

  private propagationStopped = false
  private defaultPrevented = false

  constructor(nativeEvent: InputEvent, point: vec2, data?: T) {
    this.nativeEvent = nativeEvent
    this.point = point
    this.data = data
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
