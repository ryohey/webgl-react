export const withFallback =
  <T>(
    shader: (gl: WebGLRenderingContext | WebGL2RenderingContext) => T,
    shaderFallback: (gl: WebGLRenderingContext) => T,
  ) =>
  (gl: WebGLRenderingContext | WebGL2RenderingContext) => {
    const isWebGL2 = gl instanceof WebGL2RenderingContext
    return isWebGL2 ? shader(gl) : shaderFallback(gl)
  }
