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

  // 点がこのノードの境界内にあるかチェック
  containsPoint(point: vec2): boolean {
    // transformの逆行列を計算してポイントをローカル座標に変換
    const inverseTransform = mat4.create()

    if (!mat4.invert(inverseTransform, this.transform)) {
      // 逆行列が計算できない場合はfalseを返す
      return false
    }

    // ポイントをローカル座標に変換
    const localPoint = vec2.create()
    vec2.transformMat4(localPoint, point, inverseTransform)

    // ローカル座標でのboundsチェック
    return (
      localPoint[0] >= this.bounds.x &&
      localPoint[0] <= this.bounds.x + this.bounds.width &&
      localPoint[1] >= this.bounds.y &&
      localPoint[1] <= this.bounds.y + this.bounds.height
    )
  }
}
