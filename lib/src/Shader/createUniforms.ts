import { mat4, vec4 } from "gl-matrix"
import { RenderProperty } from "../Renderer/RenderProperty"

type UniformInstance<T> = {
  value: T
  upload: (gl: WebGLRenderingContext) => void
}

export type UniformInstances<T> = {
  [K in keyof T]: UniformInstance<T[K]>
}

export function createUniforms<T>(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
): UniformInstances<T> {
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
  const uniforms: Record<
    string,
    {
      value: mat4 | vec4 | number
      upload: (gl: WebGLRenderingContext) => void
    }
  > = {}

  for (let i = 0; i < numUniforms; i++) {
    const uniformInfo = gl.getActiveUniform(program, i)
    if (uniformInfo) {
      const location = gl.getUniformLocation(program, uniformInfo.name)
      if (location === null) {
        throw new Error(`Failed to get uniform location: ${uniformInfo.name}`)
      }

      switch (uniformInfo.type) {
        case gl.FLOAT_MAT4: {
          const prop = new RenderProperty(mat4.create(), mat4.equals)
          uniforms[uniformInfo.name] = {
            get value() {
              return prop.value
            },
            set value(val: mat4) {
              prop.value = val
            },
            upload: (gl: WebGLRenderingContext) => {
              if (prop.isDirty) {
                gl.uniformMatrix4fv(location, false, prop.value)
                prop.mark()
              }
            },
          }
          break
        }
        case gl.FLOAT_VEC4: {
          const prop = new RenderProperty(vec4.create(), vec4.equals)
          uniforms[uniformInfo.name] = {
            get value() {
              return prop.value
            },
            set value(val: vec4) {
              prop.value = val
            },
            upload: (gl: WebGLRenderingContext) => {
              if (prop.isDirty) {
                gl.uniform4fv(location, prop.value)
                prop.mark()
              }
            },
          }
          break
        }
        case gl.FLOAT: {
          const prop = new RenderProperty(
            0 as number,
            (a: number, b: number) => a === b,
          )
          uniforms[uniformInfo.name] = {
            get value() {
              return prop.value
            },
            set value(val: number) {
              prop.value = val
            },
            upload: (gl: WebGLRenderingContext) => {
              if (prop.isDirty) {
                gl.uniform1f(location, prop.value)
                prop.mark()
              }
            },
          }
          break
        }
        default:
          throw new Error(
            `Unsupported uniform type: ${uniformInfo.type} for ${uniformInfo.name}`,
          )
      }
    }
  }

  return uniforms as UniformInstances<T>
}
