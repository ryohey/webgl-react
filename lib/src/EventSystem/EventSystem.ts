import { mat4, vec2 } from "gl-matrix"
import { createProjectionMatrix } from "../helpers/createProjectionMatrix"
import { HitArea } from "./HitArea"

// Union type for mouse and pointer events
export type InputEvent = MouseEvent | PointerEvent

export interface EventResult {
  handled: boolean
  propagationStopped: boolean
}

export class EventSystem {
  private hitAreas: { [id: string]: HitArea } = {}
  private hoveredHitArea: HitArea | null = null
  private onCursorChange?: (cursor: string | null) => void

  setOnCursorChange(callback: (cursor: string | null) => void) {
    this.onCursorChange = callback
  }

  private updateCursor() {
    if (!this.onCursorChange) return

    const cursor = this.hoveredHitArea?.cursor ?? null
    this.onCursorChange(cursor)
  }

  addHitArea(hitArea: HitArea) {
    this.hitAreas[hitArea.id] = hitArea
  }

  removeHitArea(id: string) {
    delete this.hitAreas[id]
  }

  private getAllHitAreas(): HitArea[] {
    return Object.values(this.hitAreas)
  }

  private findTarget(
    event: InputEvent,
    canvas: HTMLCanvasElement,
  ): HitArea | null {
    const projectionMatrix = createProjectionMatrix(canvas)
    const point = getLocalPoint(event, canvas)
    const ndcPoint = toNDC(point, projectionMatrix)
    const hitAreas = this.getAllHitAreas()
    hitAreas.sort((a, b) => b.zIndex - a.zIndex)

    for (const hitArea of hitAreas) {
      if (hitTest(hitArea, ndcPoint)) {
        return hitArea
      }
    }

    return null
  }

  private handleHitAreaEvent(
    hitArea: HitArea,
    eventType: keyof Pick<
      HitArea,
      | "onMouseDown"
      | "onMouseUp"
      | "onMouseMove"
      | "onClick"
      | "onPointerDown"
      | "onPointerUp"
      | "onPointerMove"
      | "onPointerCancel"
    >,
    nativeEvent: InputEvent,
  ): EventResult {
    const handler = hitArea[eventType] as (e: MouseEvent | PointerEvent) => void
    if (handler) {
      let propagationStopped = false

      // Monkey patch stopPropagation to track if it was called
      const originalStopPropagation = nativeEvent.stopPropagation
      nativeEvent.stopPropagation = function () {
        propagationStopped = true
        originalStopPropagation.call(this)
      }

      handler(nativeEvent)

      // Restore original stopPropagation
      nativeEvent.stopPropagation = originalStopPropagation

      return { handled: true, propagationStopped }
    }
    return { handled: false, propagationStopped: false }
  }

  // Generic event handler that reduces duplication
  private handleGenericEvent(
    event: InputEvent,
    canvas: HTMLCanvasElement,
    hitAreaEventType: keyof Pick<
      HitArea,
      | "onMouseDown"
      | "onMouseUp"
      | "onMouseMove"
      | "onClick"
      | "onPointerDown"
      | "onPointerUp"
      | "onPointerMove"
      | "onPointerCancel"
    >,
  ): EventResult {
    const hitArea = this.findTarget(event, canvas)

    if (hitArea) {
      const result = this.handleHitAreaEvent(hitArea, hitAreaEventType, event)
      return result
    }

    return { handled: false, propagationStopped: false }
  }

  // Generic move event handler
  private handleGenericMoveEvent(
    event: InputEvent,
    canvas: HTMLCanvasElement,
    moveEventType: keyof Pick<HitArea, "onMouseMove" | "onPointerMove">,
  ): EventResult {
    const hitArea = this.findTarget(event, canvas)

    if (hitArea !== this.hoveredHitArea) {
      this.hoveredHitArea = hitArea
      this.updateCursor()
    }

    if (hitArea) {
      const result = this.handleHitAreaEvent(hitArea, moveEventType, event)
      return result
    }

    return { handled: false, propagationStopped: false }
  }

  // Mouse event handlers
  handleMouseDown(event: MouseEvent, canvas: HTMLCanvasElement): EventResult {
    return this.handleGenericEvent(event, canvas, "onMouseDown")
  }

  handleMouseUp(event: MouseEvent, canvas: HTMLCanvasElement): EventResult {
    return this.handleGenericEvent(event, canvas, "onMouseUp")
  }

  handleMouseMove(event: MouseEvent, canvas: HTMLCanvasElement): EventResult {
    return this.handleGenericMoveEvent(event, canvas, "onMouseMove")
  }

  handleClick(event: MouseEvent, canvas: HTMLCanvasElement): EventResult {
    return this.handleGenericEvent(event, canvas, "onClick")
  }

  // Pointer event handlers
  handlePointerDown(
    event: PointerEvent,
    canvas: HTMLCanvasElement,
  ): EventResult {
    return this.handleGenericEvent(event, canvas, "onPointerDown")
  }

  handlePointerUp(event: PointerEvent, canvas: HTMLCanvasElement): EventResult {
    return this.handleGenericEvent(event, canvas, "onPointerUp")
  }

  handlePointerMove(
    event: PointerEvent,
    canvas: HTMLCanvasElement,
  ): EventResult {
    return this.handleGenericMoveEvent(event, canvas, "onPointerMove")
  }

  handlePointerCancel(
    event: PointerEvent,
    canvas: HTMLCanvasElement,
  ): EventResult {
    return this.handleGenericEvent(event, canvas, "onPointerCancel")
  }
}

function toNDC(point: vec2, projectionMatrix: mat4): vec2 {
  const ndcPoint = vec2.create()
  vec2.transformMat4(ndcPoint, point, projectionMatrix)
  return ndcPoint
}

function getLocalPoint(event: InputEvent, element: HTMLElement): vec2 {
  const rect = element.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return vec2.fromValues(x, y)
}

function hitTest({ bounds, transform }: HitArea, ndcPoint: vec2): boolean {
  const transformedLT = vec2.create()
  const transformedRB = vec2.create()

  vec2.transformMat4(
    transformedLT,
    vec2.fromValues(bounds.x, bounds.y),
    transform,
  )

  vec2.transformMat4(
    transformedRB,
    vec2.fromValues(bounds.x + bounds.width, bounds.y + bounds.height),
    transform,
  )

  // Check bounds in local coordinates
  return (
    ndcPoint[0] >= transformedLT[0] &&
    ndcPoint[0] < transformedRB[0] &&
    ndcPoint[1] <= transformedLT[1] &&
    ndcPoint[1] > transformedRB[1]
  )
}
