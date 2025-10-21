declare module 'twgl.js' {
  export interface ProgramInfo {
    program: WebGLProgram
    uniformSetters: { [key: string]: (value: any) => void }
    attribSetters: { [key: string]: (attrib: any) => void }
  }

  export interface AttribInfo {
    buffer: WebGLBuffer
    numComponents: number
    type?: number
    normalize?: boolean
    stride?: number
    offset?: number
    divisor?: number
  }

  export interface BufferInfo {
    attribs: { [key: string]: AttribInfo }
    indices?: WebGLBuffer
    numElements: number
    elementType?: number
  }

  export interface Arrays {
    [key: string]: number[] | ArrayBuffer | ArrayBufferView | { data: number[] | ArrayBuffer | ArrayBufferView; [key: string]: any }
  }

  export function createProgramInfo(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    shaderSources: string[],
    opt_attribs?: string[],
    opt_locations?: number[],
    opt_errorCallback?: (msg: string) => void
  ): ProgramInfo

  export function createBufferInfoFromArrays(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    arrays: Arrays,
    opt_mapping?: { [key: string]: string }
  ): BufferInfo

  export function setBuffersAndAttributes(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    programInfo: ProgramInfo,
    bufferInfo: BufferInfo
  ): void

  export function setUniforms(
    programInfo: ProgramInfo,
    uniforms: { [key: string]: any }
  ): void

  export function drawBufferInfo(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    bufferInfo: BufferInfo,
    type?: number,
    count?: number,
    offset?: number,
    instanceCount?: number
  ): void
}