import { mat4 } from "gl-matrix"
import { EventSystem } from "../EventSystem/EventSystem"
import { RenderNode } from "../GLNode/RenderNode"
import { Renderer } from "../Renderer/Renderer"

// 統一されたprimitive props - GLNodeの内部で使われる実際の形式
export interface GLPrimitiveProps {
  createNode: (
    gl: WebGLRenderingContext | WebGL2RenderingContext,
  ) => RenderNode<any, any>
  buffer: any
  uniforms: any
  zIndex?: number
}

export type GLContainer = {
  renderer: Renderer
  eventSystem: EventSystem
}

export type GLHostContext = {
  gl: WebGLRenderingContext | WebGL2RenderingContext
  renderer: Renderer
  transform: mat4
}
