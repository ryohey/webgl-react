import { Buffer, Shader, UniformDefs } from "./Shader"
import { UniformDef, uniformFloat, uniformMat4, uniformVec4 } from "./Uniform"
import { Input, VertexArray } from "./VertexArray"
import { initShaderProgram } from "./initShaderProgram"

// Auto-detect uniform type from shader
function detectUniformType(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  index: number,
): UniformDef<any> {
  const uniformInfo = gl.getActiveUniform(program, index)
  if (!uniformInfo) {
    throw new Error(`Uniform at index ${index} not found`)
  }

  switch (uniformInfo.type) {
    case gl.FLOAT_MAT4:
      return uniformMat4()
    case gl.FLOAT_VEC4:
      return uniformVec4()
    case gl.FLOAT:
      return uniformFloat()
    default:
      throw new Error(
        `Unsupported uniform type: ${uniformInfo.type} for ${uniformInfo.name}`,
      )
  }
}

// Auto-detect attribute type from shader
function detectAttributeType(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  index: number,
): Input {
  const attribInfo = gl.getActiveAttrib(program, index)
  if (!attribInfo) {
    throw new Error(`Attribute at index ${index} not found`)
  }

  switch (attribInfo.type) {
    case gl.FLOAT_VEC2:
      return { size: 2, type: gl.FLOAT }
    case gl.FLOAT_VEC4:
      return { size: 4, type: gl.FLOAT }
    default:
      throw new Error(
        `Unsupported attribute type: ${attribInfo.type} for ${attribInfo.name}`,
      )
  }
}

// Shader configuration options
export interface ShaderOptions {
  instanceAttributes?: string[]
}

// Generic shader instance interface
export interface ShaderInstance<TUniforms, TAttributes extends string> {
  setUniforms(props: TUniforms): void
  createBuffer(): Buffer<any, TAttributes>
  draw(buffer: Buffer<any, TAttributes>): void
}

// Main createShader function - validation and auto-detection happens here
export function createShader<
  TUniforms extends Record<string, any>,
  TAttributes extends string,
>(
  gl: WebGL2RenderingContext,
  vertexShader: string,
  fragmentShader: string,
  bufferFactory: (
    vertexArray: VertexArray<TAttributes>,
  ) => Buffer<any, TAttributes>,
  options: ShaderOptions = {},
): ShaderInstance<TUniforms, TAttributes> {
  const program = initShaderProgram(gl, vertexShader, fragmentShader)

  // Auto-detect uniforms
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
  const uniformDefs: { [key: string]: UniformDef<any> } = {}

  for (let i = 0; i < numUniforms; i++) {
    const uniformInfo = gl.getActiveUniform(program, i)
    if (uniformInfo) {
      uniformDefs[uniformInfo.name] = detectUniformType(gl, program, i)
    }
  }

  // Auto-detect attributes
  const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
  const inputs: { [key: string]: Input } = {}

  for (let i = 0; i < numAttributes; i++) {
    const attribInfo = gl.getActiveAttrib(program, i)
    if (attribInfo) {
      const input = detectAttributeType(gl, program, i)
      // Add divisor for instanced attributes
      if (options.instanceAttributes?.includes(attribInfo.name)) {
        input.divisor = 1
      }
      inputs[attribInfo.name] = input
    }
  }

  return new Shader<TUniforms, TAttributes>(
    gl,
    program,
    inputs as { [Key in TAttributes]: Input },
    uniformDefs as UniformDefs<TUniforms>,
    bufferFactory,
  )
}
