import { mat4, vec2 } from "gl-matrix"
import { IRect } from "../helpers/geometry"

export interface HitAreaEventHandler<T = unknown> {
  (event: HitAreaEvent<T>): void
}

// Union type for mouse and pointer events
export type InputEvent = MouseEvent | PointerEvent

// Function to extract coordinates from either MouseEvent or PointerEvent
function getEventCoordinates(event: InputEvent): {
  clientX: number
  clientY: number
} {
  return {
    clientX: event.clientX,
    clientY: event.clientY,
  }
}

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

export interface HitArea<T = unknown> {
  id: string
  bounds: IRect
  transform: mat4
  zIndex: number
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
  data?: T
}

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

// Pure functions (file-private)
function getCanvasPoint(event: InputEvent, canvas: HTMLCanvasElement): vec2 {
  const rect = canvas.getBoundingClientRect()
  const coords = getEventCoordinates(event)
  const x = coords.clientX - rect.left
  const y = coords.clientY - rect.top
  return vec2.fromValues(x, y)
}

function isPointInBounds(point: vec2, bounds: IRect): boolean {
  return (
    point[0] >= bounds.x &&
    point[0] <= bounds.x + bounds.width &&
    point[1] >= bounds.y &&
    point[1] <= bounds.y + bounds.height
  )
}

function findTopHitArea(
  hitAreas: HitArea<any>[],
  point: vec2,
): HitArea<any> | null {
  const sortedHitAreas = [...hitAreas].sort(
    (a, b) => (b.zIndex || 0) - (a.zIndex || 0),
  )

  for (const hitArea of sortedHitAreas) {
    if (isPointInBounds(point, hitArea.bounds)) {
      return hitArea
    }
  }

  return null
}

export class EventSystem {
  private hitAreas: HitArea<any>[] = []
  private hoveredHitArea: HitArea<any> | null = null
  private canvasEventHandlers: GLCanvasEventHandlers = {}

  setCanvasEventHandlers(handlers: GLCanvasEventHandlers) {
    this.canvasEventHandlers = handlers
  }

  addHitArea<T>(hitArea: HitArea<T>) {
    this.hitAreas.push(hitArea as HitArea<any>)
  }

  removeHitArea(id: string) {
    this.hitAreas = this.hitAreas.filter((area) => area.id !== id)
  }

  private createHitAreaEvent<T>(
    nativeEvent: InputEvent,
    point: vec2,
    hitArea: HitArea<T>,
  ): HitAreaEvent<T> {
    return new HitAreaEvent(nativeEvent, point, hitArea.data)
  }

  private handleHitAreaEvent<T>(
    hitArea: HitArea<T>,
    eventType: keyof Pick<
      HitArea<T>,
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
    point: vec2,
  ): boolean {
    const handler = hitArea[eventType]
    if (handler) {
      const event = this.createHitAreaEvent(nativeEvent, point, hitArea)
      handler(event)
      return true
    }
    return false
  }

  // Generic event handler that reduces duplication
  private handleGenericEvent(
    event: InputEvent,
    canvas: HTMLCanvasElement,
    hitAreaEventType: keyof Pick<
      HitArea<any>,
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
    const point = getCanvasPoint(event, canvas)
    const hitArea = findTopHitArea(this.hitAreas, point)

    if (hitArea) {
      if (this.handleHitAreaEvent(hitArea, hitAreaEventType, event, point)) {
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
    moveEventType: keyof Pick<HitArea<any>, "onMouseMove" | "onPointerMove">,
    enterEventType: keyof Pick<HitArea<any>, "onMouseEnter" | "onPointerEnter">,
    leaveEventType: keyof Pick<HitArea<any>, "onMouseLeave" | "onPointerLeave">,
    canvasEventType: keyof GLCanvasEventHandlers,
  ): boolean {
    const point = getCanvasPoint(event, canvas)
    const hitArea = findTopHitArea(this.hitAreas, point)

    if (hitArea !== this.hoveredHitArea) {
      if (this.hoveredHitArea?.[leaveEventType]) {
        this.handleHitAreaEvent(
          this.hoveredHitArea,
          leaveEventType,
          event,
          point,
        )
      }

      if (hitArea?.[enterEventType]) {
        this.handleHitAreaEvent(hitArea, enterEventType, event, point)
      }

      this.hoveredHitArea = hitArea
    }

    if (hitArea) {
      if (this.handleHitAreaEvent(hitArea, moveEventType, event, point)) {
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
