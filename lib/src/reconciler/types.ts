import { mat4 } from "gl-matrix"
import { HitAreaEvents } from "../EventSystem/HitArea"
import { RenderNode } from "../GLNode/RenderNode"
import { IRect } from "../helpers/geometry"

export interface GLPrimitiveProps {
  createNode: (gl: WebGLRenderingContext | WebGL2RenderingContext) => RenderNode
  buffer: any
  uniforms: any
  zIndex?: number
}

export interface HitAreaPrimitiveProps extends HitAreaEvents<any> {
  bounds: IRect
  zIndex?: number
  transform?: mat4
  data?: any
}
