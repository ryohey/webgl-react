import { EventSystem } from "../EventSystem/EventSystem"
import { Renderer } from "../Renderer/Renderer"

export interface GLContainer {
  readonly renderer: Renderer
  readonly eventSystem: EventSystem
}
