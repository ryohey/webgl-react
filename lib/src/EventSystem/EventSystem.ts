import { mat4, vec2 } from "gl-matrix"
import { createProjectionMatrix } from "../helpers/createProjectionMatrix"
import { HitArea } from "./HitArea"

// Union type for mouse and pointer events
export type InputEvent = MouseEvent | PointerEvent

export interface GLCanvasEventHandler {
  (event: InputEvent): void
}

export interface GLCanvasEventHandlers {
  onMouseDown?: GLCanvasEventHandler
  onMouseUp?: GLCanvasEventHandler
  onMouseMove?: GLCanvasEventHandler
  onClick?: GLCanvasEventHandler
  onPointerDown?: GLCanvasEventHandler
  onPointerUp?: GLCanvasEventHandler
  onPointerMove?: GLCanvasEventHandler
  onPointerCancel?: GLCanvasEventHandler
}

export class EventSystem {
  private hitAreas: { [id: string]: HitArea } = {}
  private hoveredHitArea: HitArea | null = null
  private canvasEventHandlers: GLCanvasEventHandlers = {}

  setCanvasEventHandlers(handlers: GLCanvasEventHandlers) {
    this.canvasEventHandlers = handlers
  }

  private updateCursor(canvas: HTMLCanvasElement) {
    if (this.hoveredHitArea?.cursor) {
      canvas.style.cursor = this.hoveredHitArea.cursor
    } else {
      canvas.style.cursor = "default"
    }
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
      | "onMouseEnter"
      | "onMouseLeave"
      | "onClick"
      | "onPointerDown"
      | "onPointerUp"
      | "onPointerMove"
      | "onPointerEnter"
      | "onPointerLeave"
      | "onPointerCancel"
    >,
    nativeEvent: InputEvent,
  ): boolean {
    const handler = hitArea[eventType] as (e: MouseEvent | PointerEvent) => void
    if (handler) {
      handler(nativeEvent)
      return true
    }
    return false
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
    canvasEventType: keyof GLCanvasEventHandlers,
  ): boolean {
    const hitArea = this.findTarget(event, canvas)

    if (hitArea) {
      if (this.handleHitAreaEvent(hitArea, hitAreaEventType, event)) {
        return true
      }
    }

    const canvasHandler = this.canvasEventHandlers[canvasEventType]
    if (canvasHandler) {
      canvasHandler(event)
      return true
    }

    return false
  }

  // Generic move event handler for mouse/pointer enter/leave logic
  private handleGenericMoveEvent(
    event: InputEvent,
    canvas: HTMLCanvasElement,
    moveEventType: keyof Pick<HitArea, "onMouseMove" | "onPointerMove">,
    enterEventType: keyof Pick<HitArea, "onMouseEnter" | "onPointerEnter">,
    leaveEventType: keyof Pick<HitArea, "onMouseLeave" | "onPointerLeave">,
    canvasEventType: keyof GLCanvasEventHandlers,
  ): boolean {
    const hitArea = this.findTarget(event, canvas)

    if (hitArea !== this.hoveredHitArea) {
      if (this.hoveredHitArea?.[leaveEventType]) {
        this.handleHitAreaEvent(this.hoveredHitArea, leaveEventType, event)
      }

      if (hitArea?.[enterEventType]) {
        this.handleHitAreaEvent(hitArea, enterEventType, event)
      }

      this.hoveredHitArea = hitArea
      this.updateCursor(canvas)
    }

    if (hitArea) {
      if (this.handleHitAreaEvent(hitArea, moveEventType, event)) {
        return true
      }
    }

    const canvasHandler = this.canvasEventHandlers[canvasEventType]
    if (canvasHandler) {
      canvasHandler(event)
      return true
    }

    return false
  }

  // Mouse event handlers
  handleMouseDown(event: MouseEvent, canvas: HTMLCanvasElement): boolean {
    return this.handleGenericEvent(event, canvas, "onMouseDown", "onMouseDown")
  }

  handleMouseUp(event: MouseEvent, canvas: HTMLCanvasElement): boolean {
    return this.handleGenericEvent(event, canvas, "onMouseUp", "onMouseUp")
  }

  handleMouseMove(event: MouseEvent, canvas: HTMLCanvasElement): boolean {
    return this.handleGenericMoveEvent(
      event,
      canvas,
      "onMouseMove",
      "onMouseEnter",
      "onMouseLeave",
      "onMouseMove",
    )
  }

  handleClick(event: MouseEvent, canvas: HTMLCanvasElement): boolean {
    return this.handleGenericEvent(event, canvas, "onClick", "onClick")
  }

  // Pointer event handlers
  handlePointerDown(event: PointerEvent, canvas: HTMLCanvasElement): boolean {
    return this.handleGenericEvent(
      event,
      canvas,
      "onPointerDown",
      "onPointerDown",
    )
  }

  handlePointerUp(event: PointerEvent, canvas: HTMLCanvasElement): boolean {
    return this.handleGenericEvent(event, canvas, "onPointerUp", "onPointerUp")
  }

  handlePointerMove(event: PointerEvent, canvas: HTMLCanvasElement): boolean {
    return this.handleGenericMoveEvent(
      event,
      canvas,
      "onPointerMove",
      "onPointerEnter",
      "onPointerLeave",
      "onPointerMove",
    )
  }

  handlePointerCancel(event: PointerEvent, canvas: HTMLCanvasElement): boolean {
    return this.handleGenericEvent(
      event,
      canvas,
      "onPointerCancel",
      "onPointerCancel",
    )
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
