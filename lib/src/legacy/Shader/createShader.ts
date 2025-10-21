import { RenderNode } from "../../GLNode/RenderNode"
import * as twgl from 'twgl.js'

// Type for simplified update data where attributes can be just arrays or data
type SimpleArrays = Record<string, number[] | ArrayBuffer | ArrayBufferView>

// Helper function to merge init configuration with update data
function mergeArrays(
  init: twgl.Arrays, 
  update: SimpleArrays
): twgl.Arrays {
  const result: any = {}
  
  for (const key in init) {
    const initValue = init[key]
    const updateValue = update[key]
    
    if (!updateValue) {
      // If no update data for this attribute, keep the init value
      result[key] = initValue
      continue
    }
    
    if (typeof initValue === 'object' && !Array.isArray(initValue) && 'data' in initValue) {
      // This is an attribute with configuration (numComponents, divisor, etc.)
      result[key] = {
        ...initValue,
        data: updateValue
      }
    } else {
      // This is a simple array attribute
      result[key] = updateValue
    }
  }
  
  return result
}

export interface CreateShaderOptions<TData> {
  vertexShader: string
  fragmentShader: string
  init: twgl.Arrays
  update: (data: TData) => SimpleArrays
}

export function createShader<
  TUniforms extends Record<string, any> = {},
  TData = any
>(options: CreateShaderOptions<TData>): (gl: WebGLRenderingContext | WebGL2RenderingContext) => RenderNode<TData, TUniforms> {
  return (gl: WebGLRenderingContext | WebGL2RenderingContext) => {
    const { vertexShader, fragmentShader, init, update } = options

    // Create program using twgl
    const programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader])

    // Create initial buffer
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, init)

    // Create update function that merges configuration from init with data from update
    const updateWithConfig = (data: TData) => {
      const updateData = update(data)
      return mergeArrays(init, updateData)
    }

    return new RenderNode<TData, TUniforms>(gl, programInfo, bufferInfo, updateWithConfig)
  }
}