import { describe, it, expect, beforeEach, vi } from "vitest"
import { createShader } from "./createShader"

// Mock WebGL context
const createMockGL = () => {
  const shaderProgram = {} as WebGLProgram
  
  return {
    FLOAT: 0x1406,
    FLOAT_VEC2: 0x8B50,
    FLOAT_VEC4: 0x8B52,
    FLOAT_MAT4: 0x8B5C,
    TRIANGLES: 0x0004,
    ACTIVE_UNIFORMS: 0x8B86,
    ACTIVE_ATTRIBUTES: 0x8B89,
    getProgramParameter: (program: WebGLProgram, pname: number) => {
      if (pname === 0x8B86) return 2 // ACTIVE_UNIFORMS
      if (pname === 0x8B89) return 2 // ACTIVE_ATTRIBUTES
      return 0
    },
    getActiveUniform: (program: WebGLProgram, index: number) => {
      if (index === 0) return { name: "transform", type: 0x8B5C } // FLOAT_MAT4
      if (index === 1) return { name: "color", type: 0x8B52 } // FLOAT_VEC4
      return null
    },
    getActiveAttrib: (program: WebGLProgram, index: number) => {
      if (index === 0) return { name: "position", type: 0x8B50 } // FLOAT_VEC2
      if (index === 1) return { name: "bounds", type: 0x8B52 } // FLOAT_VEC4
      return null
    },
    getUniformLocation: () => ({} as WebGLUniformLocation),
    getAttribLocation: () => 0,
    createShaderProgram: () => shaderProgram,
    useProgram: () => {},
    createVertexArray: () => ({} as WebGLVertexArrayObject),
    bindVertexArray: () => {},
    createBuffer: () => ({} as WebGLBuffer),
    bindBuffer: () => {},
    enableVertexAttribArray: () => {},
    vertexAttribPointer: () => {},
    vertexAttribDivisor: () => {},
    bufferData: () => {},
    drawArrays: () => {},
    drawArraysInstanced: () => {},
    uniformMatrix4fv: () => {},
    uniform4fv: () => {},
  } as unknown as WebGL2RenderingContext
}

// Mock initShaderProgram
vi.mock("./initShaderProgram", () => ({
  initShaderProgram: () => ({} as WebGLProgram)
}))

describe("createShader", () => {
  let gl: WebGL2RenderingContext

  beforeEach(() => {
    gl = createMockGL()
  })

  it("should create shader with auto-detected uniforms and attributes", () => {
    const mockUpdate = vi.fn().mockReturnValue({
      position: [0, 0, 1, 0, 0, 1, 1, 1],
      vertexCount: 4
    })
    
    const shaderFactory = createShader<
      { transform: any; color: any },
      "position" | "bounds",
      any
    >({
      vertexShader: "vertex shader source",
      fragmentShader: "fragment shader source",
      update: mockUpdate
    })

    const shader = shaderFactory(gl)
    const bufferInfo = shader.createBuffer()

    expect(shader).toBeDefined()
    expect(typeof shader.setUniforms).toBe("function")
    expect(typeof shader.createBuffer).toBe("function")
    expect(typeof shader.draw).toBe("function")
    expect(bufferInfo).toBeDefined()
    expect(typeof bufferInfo.update).toBe("function")
    expect(bufferInfo.buffer).toBeDefined()
  })

  it("should handle instanced rendering with instanceAttributes", () => {
    const mockUpdate = vi.fn().mockReturnValue({
      position: [0, 0, 1, 0, 0, 1, 1, 1],
      bounds: [0, 0, 100, 100],
      vertexCount: 4,
      instanceCount: 1
    })
    
    const shaderFactory = createShader<
      { transform: any; color: any },
      "position" | "bounds",
      any
    >({
      vertexShader: "vertex shader source",
      fragmentShader: "fragment shader source",
      update: mockUpdate,
      instanceAttributes: ["bounds"]
    })

    const shader = shaderFactory(gl)
    const bufferInfo = shader.createBuffer()

    expect(shader).toBeDefined()
    expect(bufferInfo).toBeDefined()
    expect(typeof bufferInfo.update).toBe("function")
    expect(bufferInfo.buffer).toBeDefined()
  })
})