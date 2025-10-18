import { Attrib } from "./Attrib"

export type AttributeInstances<T extends string> = {
  [Key in T]: Attrib
}

export function createAttributes<TAttributes extends string>(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
): AttributeInstances<TAttributes> {
  const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
  const attributes: Record<string, Attrib> = {}

  for (let i = 0; i < numAttributes; i++) {
    const attribInfo = gl.getActiveAttrib(program, i)
    if (attribInfo) {
      // Determine size based on WebGL type
      let size: number
      switch (attribInfo.type) {
        case gl.FLOAT:
          size = 1
          break
        case gl.FLOAT_VEC2:
          size = 2
          break
        case gl.FLOAT_VEC3:
          size = 3
          break
        case gl.FLOAT_VEC4:
          size = 4
          break
        default:
          throw new Error(`Unsupported attribute type: ${attribInfo.type} for ${attribInfo.name}`)
      }

      attributes[attribInfo.name] = new Attrib(gl, program, attribInfo.name, size)
    }
  }

  return attributes as AttributeInstances<TAttributes>
}