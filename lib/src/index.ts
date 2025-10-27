// Main exports using reconciler-based implementation with existing names
export { GLCanvas } from "./GLCanvas/GLCanvas"

// Shape components
export { BorderedCircles } from "./GLNode/BorderedCircles/BorderedCircles"
export { BorderedRectangles } from "./GLNode/BorderedRectangles/BorderedRectangles"
export { Rectangles } from "./GLNode/Rectangles/Rectangles"

// Transform component
export * from "./GLNode/Transform"

// Hooks and utilities
export * from "./hooks/useEventSystem"
export * from "./hooks/useRenderer"
export * from "./hooks/useTransform"

// Types and helpers
export * from "./EventSystem/EventSystem"
export * from "./EventSystem/HitAreaEvent"
export * from "./helpers/geometry"
export * from "./helpers/polygon"

// Low-level exports for advanced usage
export * from "./GLNode/GLFallback"
export * from "./GLNode/GLNode"
export * from "./GLNode/HitArea"
export * from "./Renderer/Renderer"
export * from "./Shader/createShader"
