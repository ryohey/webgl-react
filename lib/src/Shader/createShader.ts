import * as twgl from "twgl.js"
import { RenderNode, RenderNodeProps } from "../GLNode/RenderNode"

export interface CreateShaderOptions<TData, TProps> {
  vertexShader: string
  fragmentShader: string
  init: twgl.Arrays
  update: (data: TData) => RenderNodeProps<TProps>
}

export const createShader =
  <TUniforms extends Record<string, any>, TData = any, TProps = any>(
    options: CreateShaderOptions<TData, TProps>,
  ) =>
  (gl: WebGLRenderingContext | WebGL2RenderingContext) => {
    const { vertexShader, fragmentShader, init, update } = options

    // Create program using twgl
    const programInfo = twgl.createProgramInfo(gl, [
      vertexShader,
      fragmentShader,
    ])

    // Create initial buffer
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, init)

    return new RenderNode<TData, TUniforms>(gl, programInfo, bufferInfo, update)
  }
