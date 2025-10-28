import { mat4, vec2 } from "gl-matrix"
import { HitAreaEventHandler, HitAreaEvents } from "../EventSystem/HitArea"
import { IRect } from "../helpers/geometry"
import { ContainerNode } from "./RenderNode"
import { NODE_TYPES, NodeType } from "./types"

export interface HitAreaNodeProps<T = unknown> extends HitAreaEvents<T> {
  bounds: IRect
  zIndex?: number
  transform?: mat4
  data?: T
}

export class HitAreaNode<T = unknown>
  extends ContainerNode
  implements HitAreaEvents<T>
{
  public override readonly type: NodeType = NODE_TYPES.HIT_AREA
  public bounds: IRect
  public transform: mat4
  public data?: T
  public override parent: ContainerNode | null = null
  public onMouseDown?: HitAreaEventHandler<T>
  public onMouseUp?: HitAreaEventHandler<T>
  public onMouseMove?: HitAreaEventHandler<T>
  public onMouseEnter?: HitAreaEventHandler<T>
  public onMouseLeave?: HitAreaEventHandler<T>
  public onClick?: HitAreaEventHandler<T>
  public onPointerDown?: HitAreaEventHandler<T>
  public onPointerUp?: HitAreaEventHandler<T>
  public onPointerMove?: HitAreaEventHandler<T>
  public onPointerEnter?: HitAreaEventHandler<T>
  public onPointerLeave?: HitAreaEventHandler<T>
  public onPointerCancel?: HitAreaEventHandler<T>

  constructor(props: HitAreaNodeProps<T>) {
    super()
    this.zIndex = props.zIndex || 0
    this.bounds = props.bounds
    this.transform = props.transform || mat4.create()
    this.data = props.data
    this.onMouseDown = props.onMouseDown
    this.onMouseUp = props.onMouseUp
    this.onMouseMove = props.onMouseMove
    this.onMouseEnter = props.onMouseEnter
    this.onMouseLeave = props.onMouseLeave
    this.onClick = props.onClick
    this.onPointerDown = props.onPointerDown
    this.onPointerUp = props.onPointerUp
    this.onPointerMove = props.onPointerMove
    this.onPointerEnter = props.onPointerEnter
    this.onPointerLeave = props.onPointerLeave
    this.onPointerCancel = props.onPointerCancel
  }

  // Check if point is within this node's bounds
  containsPoint(ndcPoint: vec2): boolean {
    const transformedLT = vec2.create()
    const transformedRB = vec2.create()

    vec2.transformMat4(
      transformedLT,
      vec2.fromValues(this.bounds.x, this.bounds.y),
      this.transform,
    )

    vec2.transformMat4(
      transformedRB,
      vec2.fromValues(
        this.bounds.x + this.bounds.width,
        this.bounds.y + this.bounds.height,
      ),
      this.transform,
    )

    // Check bounds in local coordinates
    return (
      ndcPoint[0] >= transformedLT[0] &&
      ndcPoint[0] < transformedRB[0] &&
      ndcPoint[1] <= transformedLT[1] &&
      ndcPoint[1] > transformedRB[1]
    )
  }
}
