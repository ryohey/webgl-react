import { RenderNode } from "../GLNode/RenderNode"

export interface GLPrimitiveProps {
  createNode: (gl: WebGLRenderingContext | WebGL2RenderingContext) => RenderNode
  buffer: any
  uniforms: any
  zIndex?: number
}
