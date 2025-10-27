import { vec2 } from "gl-matrix"
import { HitAreaNode } from "../GLNode/HitAreaNode"
import { HitArea } from "./HitArea"
import { HitAreaEvent } from "./HitAreaEvent"

// Union type for mouse and pointer events
export type InputEvent = MouseEvent | PointerEvent

export class EventSystem {
  private hoveredHitArea: any | null = null

  constructor(private readonly rootNode: any) {}

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

  handleEvent(
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

    return false
  }

  // Move event with enter/leave logic
  handleMoveEvent(
    event: InputEvent,
    canvas: HTMLCanvasElement,
    moveEventType: keyof Pick<HitArea<any>, "onMouseMove" | "onPointerMove">,
    enterEventType: keyof Pick<HitArea<any>, "onMouseEnter" | "onPointerEnter">,
    leaveEventType: keyof Pick<HitArea<any>, "onMouseLeave" | "onPointerLeave">,
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
    return this.handleEvent(event, canvas, moveEventType)
  }
}

function getLocalPoint(event: InputEvent, element: HTMLElement): vec2 {
  const rect = element.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return vec2.fromValues(x, y)
}
