import { Mat4Uniform, Vec4Uniform, FloatUniform, UniformInstances, UniformInstance } from "./Uniform"

export function createUniforms<T extends Record<string, any>>(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
): UniformInstances<T> {
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
  const uniforms: Record<string, UniformInstance<any>> = {}

  for (let i = 0; i < numUniforms; i++) {
    const uniformInfo = gl.getActiveUniform(program, i)
    if (uniformInfo) {
      const location = gl.getUniformLocation(program, uniformInfo.name)
      if (location === null) {
        throw new Error(`Failed to get uniform location: ${uniformInfo.name}`)
      }

      switch (uniformInfo.type) {
        case gl.FLOAT_MAT4:
          uniforms[uniformInfo.name] = new Mat4Uniform(location)
          break
        case gl.FLOAT_VEC4:
          uniforms[uniformInfo.name] = new Vec4Uniform(location)
          break
        case gl.FLOAT:
          uniforms[uniformInfo.name] = new FloatUniform(location)
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
