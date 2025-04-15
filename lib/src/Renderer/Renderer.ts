import { mat4, vec3 } from "gl-matrix"
import { ISize } from "../helpers/geometry"
import { RenderProperty } from "./RenderProperty"

export interface Renderable {
  draw(): void
  zIndex?: number
}

export class Renderer {
  readonly gl: WebGLRenderingContext | WebGL2RenderingContext

  private viewSize: RenderProperty<ISize> = new RenderProperty(
    { width: 0, height: 0 },
    (a, b) => a.width === b.width && a.height === b.height
  )

  private objects: Renderable[] = []
  private isQueued = false

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.gl = gl
  }

  setNeedsDisplay() {
    if (this.isQueued) {
      return
    }
    this.isQueued = true
    requestAnimationFrame(() => {
      this.isQueued = false
      this.render()
    })
  }

  setObjects(objects: Renderable[]) {
    this.objects = objects
  }

  addObject(object: Renderable) {
    this.objects.push(object)
  }

  removeObject(object: Renderable) {
    this.objects = this.objects.filter((obj) => obj !== object)
  }

  private clear() {
    const { gl } = this
    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  render() {
    const { gl } = this

    this.viewSize.value = {
      width: gl.canvas.width,
      height: gl.canvas.height,
    }

    if (this.viewSize.isDirty) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }

    gl.disable(gl.CULL_FACE)
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.DITHER)
    gl.disable(gl.POLYGON_OFFSET_FILL)
    gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE)
    gl.disable(gl.SAMPLE_COVERAGE)
    gl.disable(gl.SCISSOR_TEST)
    gl.disable(gl.STENCIL_TEST)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    this.clear()

    this.objects
      .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
      .forEach((o) => o.draw())
  }

  createProjectionMatrix() {
    const zNear = 0
    const zFar = 100.0
    const projectionMatrix = mat4.create()

    const canvas = this.gl.canvas as HTMLCanvasElement

    const scale = canvas.clientWidth / canvas.width
    mat4.scale(
      projectionMatrix,
      projectionMatrix,
      vec3.fromValues(scale, scale, scale)
    )

    mat4.ortho(
      projectionMatrix,
      0,
      canvas.clientWidth,
      canvas.clientHeight,
      0,
      zNear,
      zFar
    )

    return projectionMatrix
  }
}
