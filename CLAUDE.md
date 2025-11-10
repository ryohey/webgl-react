# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start` - Start both lib and example development servers concurrently
- `npm run start:lib` - Start lib development server (Rollup watch mode)
- `npm run start:example` - Start example development server (Vite)

### Build and Test
- `npm run build` - Build the library (runs in lib workspace)
- `npm test` - Run tests using Vitest (runs in lib workspace)
- `npm run test:watch` - Run tests in watch mode (in lib workspace)
- `npm publish` - Publish library to npm (runs in lib workspace)

### Workspace Commands
The project uses npm workspaces with two main workspaces:
- `lib/` - The main webgl-react library
- `example/` - Example application demonstrating library usage

## Architecture

### Core Architecture
webgl-react is a React library for high-performance 2D rendering using WebGL with screen coordinates. The library uses a component-based architecture where WebGL rendering is abstracted into React components.

### Key Components

#### GLCanvas (`lib/src/GLCanvas/GLCanvas.tsx`)
- Root WebGL component that initializes WebGL context
- Provides `RendererContext` and `ProjectionMatrixContext` to child components
- Creates orthographic projection matrix for screen coordinate system
- Handles canvas sizing and device pixel ratio scaling

#### Renderer (`lib/src/Renderer/Renderer.ts`)
- Core WebGL rendering engine
- Manages renderable objects and render queue
- Implements z-index based sorting for render order
- Uses `requestAnimationFrame` for efficient render scheduling
- Configures WebGL state (blending, viewport, etc.)

#### Shape Components
- `Rectangles` - Solid rectangle rendering
- `BorderedRectangles` - Rectangles with borders
- `BorderedCircles` - Circles with borders
- Each shape has its own shader implementation in corresponding directories

#### Transform Component (`lib/src/GLNode/Transform.tsx`)
- Applies transformation matrices to child components
- Works with the projection matrix system

#### Shader System
- Custom GLSL shaders for different shape types
- `Shader` class for shader program management
- `VertexArray` and `Uniform` helpers for WebGL resource management
- Instanced rendering for efficient batch drawing

### Legacy Support
The library includes a legacy export (`./legacy`) for backward compatibility with older versions.

### Rendering Flow
1. GLCanvas initializes WebGL context and creates Renderer
2. Shape components register with Renderer as Renderable objects
3. Renderer sorts objects by zIndex and calls draw() on each
4. Each shape uses its specific shader and vertex data for rendering
5. All rendering happens in screen coordinates using orthographic projection