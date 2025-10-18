import { Input } from "./VertexArray"

export type AttributeInputs<T extends string> = {
  [Key in T]: Input
}

export function createAttributes<TAttributes extends string>(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  instanceAttributes: string[] = [],
): AttributeInputs<TAttributes> {
  const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
  const inputs: Record<string, Input> = {}

  for (let i = 0; i < numAttributes; i++) {
    const attribInfo = gl.getActiveAttrib(program, i)
    if (attribInfo) {
      const input = createAttributeInput(gl, attribInfo)
      // Add divisor for instanced attributes
      if (instanceAttributes.includes(attribInfo.name)) {
        input.divisor = 1
      }
      inputs[attribInfo.name] = input
    }
  }

  return inputs as AttributeInputs<TAttributes>
}

// Create attribute input from WebGL attribute info
function createAttributeInput(
  gl: WebGLRenderingContext,
  attribInfo: WebGLActiveInfo,
): Input {
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
