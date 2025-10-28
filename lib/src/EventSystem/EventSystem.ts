import { mat4, vec2 } from "gl-matrix"
import { HitAreaNode } from "../GLNode/HitAreaNode"
import { createProjectionMatrix } from "../helpers/createProjectionMatrix"
import { HitArea } from "./HitArea"

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

  private findTarget(
    event: InputEvent,
    canvas: HTMLCanvasElement,
  ): HitAreaNode<any> | null {
    const projectionMatrix = createProjectionMatrix(canvas)
    const point = getLocalPoint(event, canvas)
    const ndcPoint = toNDC(point, projectionMatrix)
    const hitAreas = this.getAllHitAreas()
    hitAreas.sort((a, b) => b.zIndex - a.zIndex)

    for (const hitArea of hitAreas) {
      if (hitArea.containsPoint(ndcPoint)) {
        return hitArea
      }
    }

    return null
  }

  handleEvent(
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
  ): boolean {
    const target = this.findTarget(event, canvas)
    const handler = target?.[hitAreaEventType]

    if (handler) {
      handler(event)
      return true
    }

    return false
  }

  // Move event with enter/leave logic
  handleMoveEvent(
    event: InputEvent,
    canvas: HTMLCanvasElement,
    moveEventType: keyof Pick<HitArea, "onMouseMove" | "onPointerMove">,
    enterEventType: keyof Pick<HitArea, "onMouseEnter" | "onPointerEnter">,
    leaveEventType: keyof Pick<HitArea, "onMouseLeave" | "onPointerLeave">,
  ): boolean {
    const target = this.findTarget(event, canvas)

    // Handle enter/leave
    if (target !== this.hoveredHitArea) {
      const hoverHandler = this.hoveredHitArea?.[leaveEventType]
      if (hoverHandler) {
        hoverHandler(event)
      }

      const enterHandler = target?.[enterEventType]
      enterHandler?.(event)

      this.hoveredHitArea = target
    }

    // Handle move with standard phases
    return this.handleEvent(event, canvas, moveEventType)
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
