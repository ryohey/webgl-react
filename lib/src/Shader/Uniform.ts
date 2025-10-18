import { mat4, vec4 } from "gl-matrix"
import { RenderProperty } from "../Renderer/RenderProperty"

export type UniformInstance<T> = {
  value: T
  upload: (gl: WebGLRenderingContext) => void
}

export type UniformInstances<T> = {
  [K in keyof T]: UniformInstance<T[K]>
}

abstract class BaseUniform<T> implements UniformInstance<T> {
  protected prop: RenderProperty<T>

  constructor(
    protected location: WebGLUniformLocation,
    initialValue: T,
    equalsFn: (a: T, b: T) => boolean,
  ) {
    this.prop = new RenderProperty(initialValue, equalsFn)
  }

  get value(): T {
    return this.prop.value
  }

  set value(val: T) {
    this.prop.value = val
  }

  upload(gl: WebGLRenderingContext): void {
    if (this.prop.isDirty) {
      this.uploadValue(gl, this.value)
      this.prop.mark()
    }
  }

  protected abstract uploadValue(gl: WebGLRenderingContext, value: T): void
}

export class Mat4Uniform extends BaseUniform<mat4> {
  constructor(location: WebGLUniformLocation) {
    super(location, mat4.create(), mat4.equals)
  }

  protected uploadValue(gl: WebGLRenderingContext, value: mat4): void {
    gl.uniformMatrix4fv(this.location, false, value)
  }
}

export class Vec4Uniform extends BaseUniform<vec4> {
  constructor(location: WebGLUniformLocation) {
    super(location, vec4.create(), vec4.equals)
  }

  protected uploadValue(gl: WebGLRenderingContext, value: vec4): void {
    gl.uniform4fv(this.location, value)
  }
}

export class FloatUniform extends BaseUniform<number> {
  constructor(location: WebGLUniformLocation) {
    super(location, 0 as number, (a: number, b: number) => a === b)
  }

  protected uploadValue(gl: WebGLRenderingContext, value: number): void {
    gl.uniform1f(this.location, value)
  }
}