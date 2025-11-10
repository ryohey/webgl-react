import { mat4, vec4 } from "gl-matrix"
import { RenderProperty } from "../Renderer/RenderProperty"

export type UploadFunc<T> = (
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation,
  value: T,
) => void

export interface UniformDef<T> {
  initialValue: T
  isEqual: (a: T, b: T) => boolean
  upload: UploadFunc<T>
}

export class Uniform<T> {
  private location: WebGLUniformLocation
  private prop: RenderProperty<T>
  private uploadFunc: UploadFunc<T>

  constructor(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    name: string,
    initialValue: RenderProperty<T>,
    fn: UploadFunc<T>,
  ) {
    const location = gl.getUniformLocation(program, name)
    if (location === null) {
      throw new Error(`failed to getUniformLocation ${name}`)
    }
    this.location = location
    this.prop = initialValue
    this.uploadFunc = fn
  }

  set value(value: T) {
    this.prop.value = value
  }

  get value() {
    return this.prop.value
  }

  upload(gl: WebGL2RenderingContext) {
    if (this.prop.isDirty) {
      this.uploadFunc(gl, this.location, this.prop.value)
      this.prop.mark()
    }
  }
}

export const uniformMat4 = (
  initialValue: mat4 = mat4.create(),
): UniformDef<mat4> => ({
  initialValue,
  isEqual: mat4.equals,
  upload: (gl, location, value) => gl.uniformMatrix4fv(location, false, value),
})

export const uniformVec4 = (
  initialValue: vec4 = vec4.create(),
): UniformDef<vec4> => ({
  initialValue,
  isEqual: vec4.equals,
  upload: (gl, location, value) => gl.uniform4fv(location, value),
})

export const uniformFloat = (initialValue: number = 0): UniformDef<number> => ({
  initialValue,
  isEqual: (a, b) => a === b,
  upload: (gl, location, value) => gl.uniform1f(location, value),
})
