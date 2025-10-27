import { mat4, vec2 } from "gl-matrix"
import { HitAreaEvents, HitAreaEventHandler } from "../EventSystem/HitArea"
import { HitAreaEvent } from "../EventSystem/HitAreaEvent"
import { InputEvent } from "../EventSystem/EventSystem"
import { IRect } from "../helpers/geometry"
import { NODE_TYPES, NodeType } from "./types"
import { ContainerNode } from "./RenderNode"

export interface HitAreaNodeProps<T = unknown> extends HitAreaEvents<T> {
  bounds: IRect
  zIndex?: number
  transform?: mat4
  data?: T
}

export class HitAreaNode<T = unknown> extends ContainerNode implements HitAreaEvents<T> {
  public override readonly type: NodeType = NODE_TYPES.HIT_AREA
  
  // Hit area properties
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

  // 点がこのノードの境界内にあるかチェック（自分自身のtransformのみ考慮）
  containsPoint(point: vec2): boolean {
    // 自分自身のtransformの逆行列を計算してポイントをローカル座標に変換
    const inverseTransform = mat4.create()
    
    if (!mat4.invert(inverseTransform, this.transform)) {
      // 逆行列が計算できない場合はtransformなしでチェック
      return (
        point[0] >= this.bounds.x &&
        point[0] <= this.bounds.x + this.bounds.width &&
        point[1] >= this.bounds.y &&
        point[1] <= this.bounds.y + this.bounds.height
      )
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

  // ツリーから最も深いヒットエリアを検索
  static findTarget(node: ContainerNode, point: vec2): HitAreaNode<any> | null {
    let target: HitAreaNode<any> | null = null
    let deepestZIndex = -Infinity
    
    const traverse = (node: ContainerNode) => {
      if (node instanceof HitAreaNode && node.containsPoint(point)) {
        const zIndex = node.zIndex || 0
        if (zIndex > deepestZIndex) {
          deepestZIndex = zIndex
          target = node
        }
      }
      if (node.children) {
        node.children.forEach(traverse)
      }
    }
    
    traverse(node)
    return target
  }

  // イベントハンドラーを実行
  dispatchEvent(
    event: InputEvent, 
    point: vec2, 
    eventType: keyof HitAreaEvents<T>
  ): boolean {
    const handler = this[eventType]
    if (handler) {
      const glEvent = new HitAreaEvent(event, point, this.data)
      handler(glEvent)
      return glEvent.isPropagationStopped
    }
    return false
  }

  // キャプチャパスを構築（親チェーンを辿る）
  getCapturePath(point: vec2): HitAreaNode<any>[] {
    const capturePath: HitAreaNode<any>[] = []
    let current = this.parent
    while (current && current instanceof HitAreaNode && current.containsPoint(point)) {
      capturePath.unshift(current)
      current = current.parent
    }
    return capturePath
  }
}