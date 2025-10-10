# webgl-react

A high-performance React library for 2D rendering using WebGL with screen coordinates.

[![npm version](https://badge.fury.io/js/@ryohey%2Fwebgl-react.svg)](https://badge.fury.io/js/@ryohey%2Fwebgl-react)
![Node.js CI](https://github.com/ryohey/webgl-react/workflows/Node.js%20CI/badge.svg)

## Why webgl-react?

Traditional DOM-based rendering becomes a performance bottleneck when dealing with thousands of shapes or frequent updates. Creating large numbers of `<div>` elements or SVG shapes can significantly impact rendering performance and cause frame drops.

webgl-react solves this by:

- **High Performance**: Uses WebGL for hardware-accelerated rendering
- **Batch Rendering**: Draws thousands of shapes in a single draw call using instanced rendering
- **Screen Coordinates**: Works with familiar pixel-based coordinates instead of normalized device coordinates
- **React Integration**: Seamlessly integrates with React's component model and lifecycle
- **Interactive**: Includes a powerful event system for handling user interactions

The library uses optimized GLSL shaders for different shape types and automatically falls back to WebGL 1.0 when WebGL 2.0 is not available, ensuring maximum browser compatibility.

## Installation

```bash
npm install @ryohey/webgl-react
```

### Dependencies

webgl-react requires the following peer dependencies:

```bash
npm install react gl-matrix
```

- **React**: 16.8+ (hooks support required)
- **gl-matrix**: For matrix operations and vector math

## Quick Start Example

```ts
import { BorderedCircles, GLCanvas, Rectangles } from "@ryohey/webgl-react"

export const App = () => {
  const rects = [
    {
      x: 100,
      y: 200,
      width: 30,
      height: 50,
    },
  ]
  const circleRects = [
    {
      x: 10,
      y: 50,
      width: 10,
      height: 10,
    },
  ]
  return (
    <>
      <h1>WebGL React</h1>
      <GLCanvas
        height={SIZE}
        width={SIZE}
        style={{ border: "1px solid black" }}
      >
        <Rectangles rects={rects} color={[0.5, 1, 0.5, 1.0]} />
        <BorderedCircles
          rects={circleRects}
          fillColor={[0, 0, 0.5, 0.5]}
          strokeColor={[0, 0, 0, 1]}
          zIndex={0}
        />
      </GLCanvas>
    </>
  )
}
```

## GLCanvas

GLCanvas is the root component that initializes the WebGL context and provides the rendering environment for all child components.

### Props

All standard HTML canvas props are supported, plus:

- `width`: Canvas width in pixels (required)
- `height`: Canvas height in pixels (required)
- `onInitError?: (error: string) => void`: Error callback for WebGL initialization failures (defaults to `alert`)

### Features

- **Automatic Context Management**: Initializes WebGL 2.0 context with fallback to WebGL 1.0
- **Device Pixel Ratio Scaling**: Automatically handles high-DPI displays for crisp rendering
- **Orthographic Projection**: Sets up screen coordinate system (0,0 at top-left)
- **Event System Integration**: Provides mouse and pointer event handling for child components
- **Error Handling**: Graceful fallback when WebGL is not supported

```tsx
import { GLCanvas } from "@ryohey/webgl-react"

<GLCanvas
  width={800}
  height={600}
  style={{ border: "1px solid #ccc" }}
  onInitError={(error) => console.error("WebGL Error:", error)}
  onClick={(event) => console.log("Canvas clicked")}
>
  {/* Your WebGL components here */}
</GLCanvas>
```

## Built-in Shapes

webgl-react provides several optimized shape components for common use cases:

### Rectangles

Renders solid-filled rectangles with a single color.

```tsx
import { Rectangles } from "@ryohey/webgl-react"

const rects = [
  { x: 10, y: 20, width: 100, height: 50 },
  { x: 150, y: 80, width: 80, height: 60 },
]

<Rectangles
  rects={rects}
  color={[1.0, 0.5, 0.2, 1.0]} // RGBA values (0-1)
  zIndex={1}
/>
```

### BorderedRectangles

Rectangles with both fill and stroke colors.

```tsx
import { BorderedRectangles } from "@ryohey/webgl-react"

<BorderedRectangles
  rects={rects}
  fillColor={[0.9, 0.9, 0.9, 1.0]}
  strokeColor={[0.2, 0.2, 0.2, 1.0]}
  zIndex={2}
/>
```

### BorderedCircles

Circles with customizable fill and stroke colors.

```tsx
import { BorderedCircles } from "@ryohey/webgl-react"

const circles = [
  { x: 50, y: 50, width: 40, height: 40 }, // width/height define bounding box
]

<BorderedCircles
  rects={circles}
  fillColor={[0.3, 0.7, 1.0, 0.8]}
  strokeColor={[0.0, 0.0, 1.0, 1.0]}
  zIndex={3}
/>
```

### Common Props

All shape components support:

- `rects`: Array of rectangle objects with `{ x, y, width, height }`
- `zIndex?: number`: Rendering order (higher values rendered on top)
- Color values are RGBA arrays with values from 0.0 to 1.0

### Performance Tips

- Group similar shapes into single components when possible
- Use z-index strategically to minimize overdraw
- Consider shape complexity when choosing between different components

## Event Handling

### HitArea

HitArea is a component that enables mouse and pointer event handling for WebGL rendered shapes. It defines an invisible interactive area that can respond to user input.

```tsx
import { HitArea } from "@ryohey/webgl-react"

<HitArea
  bounds={{ x: 100, y: 200, width: 30, height: 50 }}
  zIndex={1}
  onClick={(event) => console.log('Clicked!', event.point)}
  onMouseEnter={(event) => console.log('Mouse entered')}
  onMouseLeave={(event) => console.log('Mouse left')}
/>
```

#### Props

- `bounds`: Rectangle defining the hit area (`{ x, y, width, height }`)
- `zIndex`: Optional z-index for layering (higher values are on top)
- Event handlers:
  - `onClick`, `onMouseDown`, `onMouseUp`, `onMouseMove`
  - `onMouseEnter`, `onMouseLeave`
  - `onPointerDown`, `onPointerUp`, `onPointerMove`
  - `onPointerEnter`, `onPointerLeave`, `onPointerCancel`

### EventSystem

The EventSystem manages hit testing and event routing for all HitArea components within a GLCanvas. It automatically handles z-index ordering and ensures events are delivered to the topmost interactive element.

Features:
- Z-index based hit testing (higher z-index elements receive events first)
- Mouse enter/leave tracking
- Support for both mouse and pointer events
- Coordinate transformation from canvas to local space
- Canvas-level event fallback when no hit areas are targeted

## Custom Shapes

webgl-react allows you to create custom shapes by writing your own GLSL shaders and using the GLNode component.

### Creating a Custom Shape

1. **Write WebGL 2.0 Shader**: Create a shader function that returns a `Shader` instance
2. **Write WebGL 1.0 Fallback Shader**: Create a fallback shader for older browsers
3. **Define Buffer Data**: Structure your vertex data to match shader attributes
4. **Create Component**: Use GLNode to wrap your shader and data

### Example: Custom Triangle Shape

```tsx
import { GLNode } from "@ryohey/webgl-react"
import { Shader } from "@ryohey/webgl-react/Shader"
import { LegacyShader } from "@ryohey/webgl-react/legacy"

// WebGL 2.0 Shader
const createTriangleShader = (gl: WebGL2RenderingContext) => {
  const vertexShader = `#version 300 es
    in vec2 a_position;
    in vec2 a_offset;
    in vec4 a_color;
    
    uniform mat4 u_transform;
    
    out vec4 v_color;
    
    void main() {
      vec2 position = a_position + a_offset;
      gl_Position = u_transform * vec4(position, 0.0, 1.0);
      v_color = a_color;
    }
  `
  
  const fragmentShader = `#version 300 es
    precision highp float;
    
    in vec4 v_color;
    out vec4 fragColor;
    
    void main() {
      fragColor = v_color;
    }
  `
  
  return new Shader(gl, vertexShader, fragmentShader, {
    attributes: {
      a_position: { size: 2, type: gl.FLOAT },
      a_offset: { size: 2, type: gl.FLOAT, divisor: 1 },
      a_color: { size: 4, type: gl.FLOAT, divisor: 1 },
    },
    uniforms: {
      u_transform: 'mat4'
    }
  })
}

// WebGL 1.0 Fallback Shader
const createTriangleShaderFallback = (gl: WebGLRenderingContext) => {
  // Similar implementation but with WebGL 1.0 syntax
  return new LegacyShader(gl, vertexShaderSource, fragmentShaderSource, ...)
}

// Custom Triangle Component
interface TriangleProps {
  triangles: Array<{ x: number, y: number, color: [number, number, number, number] }>
  zIndex?: number
}

export const Triangles: FC<TriangleProps> = ({ triangles, zIndex }) => {
  const transform = useTransform()
  
  const uniforms = useMemo(() => ({ transform }), [transform])
  
  // Define triangle vertices (relative to center)
  const vertices = [
    [0, -20],    // top
    [-20, 20],   // bottom left  
    [20, 20]     // bottom right
  ]
  
  return (
    <GLNode
      shader={createTriangleShader}
      shaderFallback={createTriangleShaderFallback}
      uniforms={uniforms}
      buffer={{ vertices, instances: triangles }}
      zIndex={zIndex}
    />
  )
}
```

### Shader Fallback System

The `shaderFallback` prop provides automatic compatibility with older browsers:

- **Modern Browsers**: Uses WebGL 2.0 shader with advanced features
- **Legacy Browsers**: Automatically falls back to WebGL 1.0 compatible shader
- **Graceful Degradation**: Ensures your app works across all devices

### Best Practices

1. **Always Provide Fallbacks**: Include `shaderFallback` for maximum compatibility
2. **Optimize Instancing**: Use instanced rendering for drawing multiple similar shapes
3. **Minimize State Changes**: Group similar shapes to reduce GPU state changes
4. **Test Across Browsers**: Verify both WebGL 2.0 and fallback implementations work
5. **Handle Errors**: Use GLCanvas's `onInitError` to handle WebGL unavailability

## Transform

The Transform component applies transformation matrices to its child components, enabling translation, rotation, scaling, and other matrix operations.

### Basic Usage

```tsx
import { Transform } from "@ryohey/webgl-react"
import { mat4 } from "gl-matrix"

const transformMatrix = mat4.create()
mat4.translate(transformMatrix, transformMatrix, [100, 50, 0]) // Move 100px right, 50px down
mat4.rotate(transformMatrix, transformMatrix, Math.PI / 4, [0, 0, 1]) // Rotate 45 degrees
mat4.scale(transformMatrix, transformMatrix, [1.5, 1.5, 1]) // Scale 1.5x

<Transform transform={transformMatrix}>
  <Rectangles rects={rects} color={[1, 0, 0, 1]} />
  <HitArea bounds={{ x: 0, y: 0, width: 100, height: 100 }} />
</Transform>
```

### Nested Transforms

Transforms can be nested to create hierarchical transformations:

```tsx
<Transform transform={parentTransform}>
  <Rectangles rects={backgroundRects} color={[0.9, 0.9, 0.9, 1]} />
  
  <Transform transform={childTransform}>
    <Rectangles rects={foregroundRects} color={[1, 0, 0, 1]} />
  </Transform>
</Transform>
```

### Integration with Projection Matrix

The transform matrix is automatically combined with the projection matrix provided by GLCanvas through the `useTransform` hook, so you don't need to worry about coordinate system conversions.

## Hooks

webgl-react provides several React hooks for accessing the rendering context and utilities.

### useTransform

Returns the current transformation matrix from the rendering system. This includes both the projection matrix from GLCanvas and any transformation matrices from Transform components.

```tsx
import { useTransform } from "@ryohey/webgl-react"

function MyShapeComponent() {
  const transform = useTransform()
  
  // Use transform in shader uniforms
  const uniforms = useMemo(() => ({ transform }), [transform])
  
  return <GLNode shader={myShader} uniforms={uniforms} buffer={data} />
}
```

**Features:**
- Combines projection matrix from GLCanvas with transform matrices
- Automatically handles screen coordinate system (0,0 at top-left)
- Updates when canvas size changes or transform components change
- Includes device pixel ratio scaling
- Inherits transformations from parent Transform components

### useEventSystem

Provides access to the event system for advanced event handling scenarios.

```tsx
import { useEventSystem } from "@ryohey/webgl-react"

function MyInteractiveComponent() {
  const eventSystem = useEventSystem()
  
  useEffect(() => {
    // Register custom event handlers if needed
    // (Most cases should use HitArea component instead)
  }, [eventSystem])
}
```

### useRenderer (Internal)

Provides access to the WebGL renderer instance. **This is an internal hook** primarily used by the library itself.

```tsx
import { useRenderer } from "@ryohey/webgl-react"

function MyAdvancedComponent() {
  const renderer = useRenderer()
  
  // Direct access to WebGL context and rendering utilities
  // Use with caution - prefer higher-level components when possible
}
```

**Warning:** Direct renderer access should be avoided unless you're building custom low-level components. Use the provided shape components and GLNode for most use cases.

## Advanced Topics

### Performance Optimization

1. **Batching**: Group similar shapes into single components to minimize draw calls
2. **Z-Index Management**: Use z-index strategically to control rendering order and minimize overdraw
3. **Memory Management**: Avoid recreating large arrays on every render - use useMemo for expensive calculations
4. **Update Frequency**: Consider the update frequency of your data and optimize accordingly

### Debugging

Enable WebGL debugging by setting up error callbacks:

```tsx
<GLCanvas
  onInitError={(error) => {
    console.error('WebGL initialization failed:', error)
    // Implement fallback UI
  }}
>
```

### Integration with Animation Libraries

webgl-react works well with animation libraries like Framer Motion or React Spring:

```tsx
import { useSpring, animated } from '@react-spring/web'

function AnimatedShape() {
  const { x } = useSpring({ x: 100 })
  
  return (
    <animated.div>
      {x.to(x => (
        <Rectangles 
          rects={[{ x, y: 50, width: 100, height: 100 }]} 
          color={[1, 0, 0, 1]} 
        />
      ))}
    </animated.div>
  )
}
```

## Browser Compatibility

| Feature | Support |
|---------|---------|
| WebGL 2.0 | Chrome 56+, Firefox 51+, Safari 15+ |
| WebGL 1.0 Fallback | IE 11+, all modern browsers |
| High DPI Support | All browsers with devicePixelRatio |
| Pointer Events | IE 11+, all modern browsers |

### Graceful Degradation

The library automatically handles browser compatibility:

1. **WebGL 2.0**: Full feature set with optimal performance
2. **WebGL 1.0**: Automatic fallback with slightly reduced features
3. **No WebGL**: Error callback triggered, allowing fallback UI implementation

## Contributing

Contributions are welcome! Please see our [contribution guidelines](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.
