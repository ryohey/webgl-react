import { vec2 } from "gl-matrix"
import { HitAreaNode } from "../GLNode/HitAreaNode"
import { HitArea } from "./HitArea"
import { HitAreaEvent } from "./HitAreaEvent"

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
  private hoveredHitArea: any | null = null
  private canvasEventHandlers: GLCanvasEventHandlers = {}

  constructor(private readonly rootNode: any) {}

  setCanvasEventHandlers(handlers: GLCanvasEventHandlers) {
    this.canvasEventHandlers = handlers
  }






  // Web標準イベントフェーズでイベント処理
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
    const point = getLocalPoint(event, canvas)
    const target = HitAreaNode.findTarget(this.rootNode, point)
    
    if (!target) {
      const canvasHandler = this.canvasEventHandlers[canvasEventType]
      if (canvasHandler) {
        canvasHandler(event)
        return true
      }
      return false
    }

    const capturePath = target.getCapturePath(point)

    // Capture phase
    for (const node of capturePath) {
      if (node.dispatchEvent(event, point, hitAreaEventType)) return true
    }

    // Target phase
    if (target.dispatchEvent(event, point, hitAreaEventType)) return true

    // Bubbling phase
    for (let i = capturePath.length - 1; i >= 0; i--) {
      const node = capturePath[i]
      if (node && node.dispatchEvent(event, point, hitAreaEventType)) return true
    }

    return true
  }

  // Move event with enter/leave logic
  private handleGenericMoveEvent(
    event: InputEvent,
    canvas: HTMLCanvasElement,
    moveEventType: keyof Pick<HitArea<any>, "onMouseMove" | "onPointerMove">,
    enterEventType: keyof Pick<HitArea<any>, "onMouseEnter" | "onPointerEnter">,
    leaveEventType: keyof Pick<HitArea<any>, "onMouseLeave" | "onPointerLeave">,
    canvasEventType: keyof GLCanvasEventHandlers,
  ): boolean {
    const point = getLocalPoint(event, canvas)
    const target = HitAreaNode.findTarget(this.rootNode, point)

    // Handle enter/leave
    if (target !== this.hoveredHitArea) {
      if (this.hoveredHitArea?.[leaveEventType]) {
        const leaveEvent = new HitAreaEvent(event, point, this.hoveredHitArea.data)
        this.hoveredHitArea[leaveEventType](leaveEvent)
      }

      if (target?.[enterEventType]) {
        const enterEvent = new HitAreaEvent(event, point, target.data)
        target[enterEventType](enterEvent)
      }

      this.hoveredHitArea = target
    }

    // Handle move with standard phases
    return this.handleGenericEvent(event, canvas, moveEventType, canvasEventType)
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

function getLocalPoint(event: InputEvent, element: HTMLElement): vec2 {
  const rect = element.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return vec2.fromValues(x, y)
}


