import { mat4, vec3 } from "gl-matrix"

export function createProjectionMatrix(canvas: HTMLCanvasElement) {
  const zNear = 0
  const zFar = 100.0
  const transform = mat4.create()

  const scale = canvas.clientWidth / canvas.width
  mat4.scale(transform, transform, vec3.fromValues(scale, scale, scale))

  mat4.ortho(
    transform,
    0,
    canvas.clientWidth,
    canvas.clientHeight,
    0,
    zNear,
    zFar,
  )

  return transform
}
