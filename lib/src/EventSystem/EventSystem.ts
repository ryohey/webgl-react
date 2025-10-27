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

  private getAllHitAreas(): HitAreaNode<any>[] {
    const hitAreas: HitAreaNode<any>[] = []

    function traverse(node: any) {
      if (node.type === "hit-area") {
        hitAreas.push(node as HitAreaNode<any>)
      }
      if (node.children) {
        for (const child of node.children) {
          traverse(child)
        }
      }
    }

    traverse(this.rootNode)
    return hitAreas
  }

  private findTarget(point: vec2): HitAreaNode<any> | null {
    const hitAreas = this.getAllHitAreas()
    hitAreas.sort((a, b) => b.zIndex - a.zIndex)

    for (const hitArea of hitAreas) {
      if (hitArea.containsPoint(point)) {
        return hitArea
      }
    }

    return null
  }

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
    const target = this.findTarget(point)
    const handler = target?.[hitAreaEventType]

    if (handler) {
      const glEvent = new HitAreaEvent(event, point, target.data)
      handler(glEvent)
      if (glEvent.isPropagationStopped) {
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
    const target = this.findTarget(point)

    // Handle enter/leave
    if (target !== this.hoveredHitArea) {
      const hoverHandler = this.hoveredHitArea?.[leaveEventType]
      if (hoverHandler) {
        const leaveEvent = new HitAreaEvent(
          event,
          point,
          this.hoveredHitArea.data,
        )
        hoverHandler(leaveEvent)
      }

      const enterHandler = target?.[enterEventType]
      if (enterHandler) {
        const enterEvent = new HitAreaEvent(event, point, target.data)
        enterHandler(enterEvent)
      }

      this.hoveredHitArea = target
    }

    // Handle move with standard phases
    return this.handleGenericEvent(
      event,
      canvas,
      moveEventType,
      canvasEventType,
    )
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
