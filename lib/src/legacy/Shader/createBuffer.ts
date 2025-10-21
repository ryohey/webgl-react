import { LegacyShaderBuffer } from "./ShaderBufferImpl"
import { AttributeInstances } from "./createAttributes"
import { BufferData } from "../../Shader/Buffer"

// Re-export BufferData for legacy modules
export type { BufferData }

// Legacy type alias for backward compatibility
export type LegacyBufferData<TAttributes extends string> = {
  [K in TAttributes]?: number[]
}

// Initialization function that returns static geometry data
export interface LegacyBufferInitFunction<TAttributes extends string> {
  (): BufferData<TAttributes>
}

// Split buffer data and vertex count to avoid type conflicts
export interface BufferUpdateResult<TAttributes extends string> {
  readonly bufferData: BufferData<TAttributes>
  readonly vertexCount: number
}

export interface BufferUpdateFunction<TData, TAttributes extends string> {
  (data: TData): BufferUpdateResult<TAttributes>
}

export function createBuffer<TData, TAttributes extends string>(
  gl: WebGLRenderingContext,
  attributes: AttributeInstances<TAttributes>,
  update: BufferUpdateFunction<TData, TAttributes>,
  init?: LegacyBufferInitFunction<TAttributes>,
): LegacyShaderBuffer<TData, TAttributes> {
  // Create buffers for each attribute from auto-detected attributes
  const buffers = {} as { [K in TAttributes]: WebGLBuffer }
  for (const attributeName in attributes) {
    buffers[attributeName] = gl.createBuffer()!
  }

  return new LegacyShaderBuffer(gl, buffers, update, init)
}