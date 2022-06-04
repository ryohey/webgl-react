# webgl-react

webgl-react is a React library for 2D rendering in WebGL with screen coordinates.

[![npm version](https://badge.fury.io/js/@ryohey%2Fwebgl-react.svg)](https://badge.fury.io/js/@ryohey%2Fwebgl-react)

## Why?

In react, drawing large numbers of shapes with divs, etc. is a very heavy process. webgl-react provides a React component that uses WebGL to draw large numbers of shapes in a single draw call.

webgl-react uses different shaders for different shapes. If you do not find the shape you need, you can write your own shaders, please read the [Custom Shape](#custom-shape) section.

## Example

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

GLCanvas is a wrapper for the canvas component. You can use any of the canvas props.

## Shapes

- Rectangles
- BorderedRectangles
- BorderedCircles

## [Custom Shape](custom-shape)

1. Write a GLSL shader and pass it to `new Shader()`
2. Create a subclass of ShaderBuffer that matches the shader attributes
3. Create a wrapper for the GLNode component by passing them to `createShader` and `createBuffer`

## Transform

Specifies the transformation matrix to be applied to the child component. The specified transformation matrix will be multiplied by the projection matrix provided by `useProjectionMatrix`.

## Hooks

### useProjectionMatrix

Gets the projection matrix that the figure component reads internally. GLCanvas provides by default a matrix of orthographic projections that translates to the screen coordinate system.

### useRenderer (internal)

Gets the Renderer class responsible for WebGL rendering. Usually not used outside of the library.
