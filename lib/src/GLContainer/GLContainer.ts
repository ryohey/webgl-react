import { EventSystem } from "../EventSystem/EventSystem"
import { Renderer } from "../Renderer/Renderer"

export class GLContainer {
  public readonly renderer: Renderer
  public readonly eventSystem: EventSystem

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.renderer = new Renderer(gl)
    this.eventSystem = new EventSystem(this.renderer.rootNode)
  }
}