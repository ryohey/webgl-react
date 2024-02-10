//
export function initShaderProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string
) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)!
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)!

  // Create the shader program

  const shaderProgram = gl.createProgram()!
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(shaderProgram)
    gl.deleteProgram(shaderProgram)
    throw new Error("Unable to initialize the shader program: " + log)
  }

  return shaderProgram
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!

  // Send the source to the shader object

  gl.shaderSource(shader, source)

  // Compile the shader program

  gl.compileShader(shader)

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error("An error occurred compiling the shaders: " + log)
  }

  return shader
}
