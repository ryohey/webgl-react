// Main exports using reconciler-based implementation with existing names
export { GLCanvas } from "./GLCanvas/GLCanvas"
export { Rectangles } from "./GLNode/Rectangles/Rectangles" 
export { BorderedRectangles } from "./GLNode/BorderedRectangles/BorderedRectangles"
export { BorderedCircles } from "./GLNode/BorderedCircles/BorderedCircles"

// Base primitive for custom shapes (same as GLNode but exposed for clarity)
export { GLNode as GLPrimitive } from "./GLNode/GLNode"
export type { GLNodeProps as GLPrimitiveProps } from "./GLNode/GLNode"

// Transform component still uses context
export * from "./GLNode/Transform"

// Hooks and utilities
export * from "./hooks/useEventSystem"
export * from "./hooks/useRenderer"
export * from "./hooks/useTransform"

// Types and helpers
export * from "./helpers/geometry"
export * from "./helpers/polygon"
export * from "./EventSystem/EventSystem"
export * from "./EventSystem/HitAreaEvent"

// Low-level exports for advanced usage
export * from "./GLNode/GLFallback"
export * from "./GLNode/GLNode"
export * from "./GLNode/HitArea"
export * from "./Renderer/Renderer"
export * from "./Shader/createShader"
export type { BufferUpdater, BufferInitFunction } from "./Shader/createBuffer"
// Note: VertexArray is now hidden - use BufferUpdater interface instead
