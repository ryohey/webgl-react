import { describe, it, expect, beforeEach, vi } from "vitest"
import { createShader } from "./createShader"

// Mock twgl
vi.mock("twgl.js", () => ({
  createProgramInfo: vi.fn(() => ({
    program: {} as WebGLProgram,
    uniformSetters: {},
    attribSetters: {},
  })),
  createBufferInfoFromArrays: vi.fn(() => ({
    attribs: {},
    numElements: 6,
  })),
  setUniforms: vi.fn(),
  setBuffersAndAttributes: vi.fn(),
  drawBufferInfo: vi.fn(),
}))

// Mock WebGL context
const createMockGL = () => {
  return {
    useProgram: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    ARRAY_BUFFER: 34962,
    DYNAMIC_DRAW: 35048,
  } as unknown as WebGL2RenderingContext
}

describe("createShader", () => {
  let gl: WebGL2RenderingContext

  beforeEach(() => {
    gl = createMockGL()
  })

  it("should create shader with twgl", () => {
    const mockUpdate = vi.fn().mockReturnValue({
      position: [0, 0, 1, 0, 0, 1, 1, 1],
    })
    
    const shaderFactory = createShader({
      vertexShader: "vertex shader source",
      fragmentShader: "fragment shader source",
      init: {
        position: [0, 0, 1, 0, 0, 1, 1, 1],
      },
      update: mockUpdate
    })

    const renderNode = shaderFactory(gl)

    expect(renderNode).toBeDefined()
    expect(typeof renderNode.setUniforms).toBe("function")
    expect(typeof renderNode.update).toBe("function")
    expect(typeof renderNode.draw).toBe("function")
  })

  it("should handle initialization arrays", () => {
    const mockInit = vi.fn().mockReturnValue({
      position: [0, 0, 1, 0, 0, 1, 1, 1],
    })
    
    const mockUpdate = vi.fn().mockReturnValue({
      position: [0, 0, 1, 0, 0, 1, 1, 1],
    })
    
    const shaderFactory = createShader({
      vertexShader: "vertex shader source",
      fragmentShader: "fragment shader source",
      init: mockInit(),
      update: mockUpdate
    })

    const renderNode = shaderFactory(gl)

    expect(renderNode).toBeDefined()
    expect(mockInit).toHaveBeenCalled()
  })
})