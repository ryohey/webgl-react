import { EventSystem } from "../EventSystem/EventSystem"
import { ContainerNode } from "../GLNode/RenderNode"
import { Renderer } from "../Renderer/Renderer"

export interface GLContainer {
  readonly renderer: Renderer
  readonly eventSystem: EventSystem
  readonly rootNode: ContainerNode
}
