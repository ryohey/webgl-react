import { mat4, vec4 } from "gl-matrix"
import { Uniform, UniformInstances } from "./Uniform"

export function createUniforms<T>(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
): UniformInstances<T> {
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
  const uniforms: Record<string, Uniform<any>> = {}

  for (let i = 0; i < numUniforms; i++) {
    const uniformInfo = gl.getActiveUniform(program, i)
    if (uniformInfo) {
      const location = gl.getUniformLocation(program, uniformInfo.name)
      if (location === null) {
        throw new Error(`Failed to get uniform location: ${uniformInfo.name}`)
      }

      switch (uniformInfo.type) {
        case gl.FLOAT_MAT4:
          uniforms[uniformInfo.name] = new Uniform(
            location,
            uniformInfo.type,
            mat4.create(),
            mat4.equals,
          )
          break
        case gl.FLOAT_VEC4:
          uniforms[uniformInfo.name] = new Uniform(
            location,
            uniformInfo.type,
            vec4.create(),
            vec4.equals,
          )
          break
        case gl.FLOAT:
          uniforms[uniformInfo.name] = new Uniform(
            location,
            uniformInfo.type,
            0 as number,
            (a: number, b: number) => a === b,
          )
          break
        default:
          throw new Error(
            `Unsupported uniform type: ${uniformInfo.type} for ${uniformInfo.name}`,
          )
      }
    }
  }

  return uniforms as UniformInstances<T>
}
