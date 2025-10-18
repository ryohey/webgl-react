import { mat4, vec4 } from "gl-matrix"
import { RenderProperty } from "../Renderer/RenderProperty"

export type UniformInstance<T> = {
  value: T
  upload: (gl: WebGLRenderingContext) => void
}

export type UniformInstances<T> = {
  [K in keyof T]: UniformInstance<T[K]>
}

export class Uniform<T> implements UniformInstance<T> {
  private prop: RenderProperty<T>

  constructor(
    private location: WebGLUniformLocation,
    private uniformType: GLenum,
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
      switch (this.uniformType) {
        case gl.FLOAT_MAT4:
          gl.uniformMatrix4fv(this.location, false, this.value as unknown as Float32Array)
          break
        case gl.FLOAT_VEC4:
          gl.uniform4fv(this.location, this.value as unknown as Float32Array)
          break
        case gl.FLOAT:
          gl.uniform1f(this.location, this.value as unknown as number)
          break
        default:
          throw new Error(`Unsupported uniform type: ${this.uniformType}`)
      }
      this.prop.mark()
    }
  }
}