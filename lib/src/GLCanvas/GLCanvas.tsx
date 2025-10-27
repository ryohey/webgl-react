import useComponentSize from "@rehooks/component-size"
import { mat4 } from "gl-matrix"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { EventSystem } from "../EventSystem/EventSystem"
import { ContainerNode } from "../GLNode/RenderNode"
import GLReconciler from "../reconciler/GLReconciler"
import { Renderer } from "../Renderer/Renderer"
import { Providers } from "./Providers"

export type GLSurfaceProps = Omit<
  React.DetailedHTMLProps<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  >,
  "ref"
> & {
  width: number
  height: number
  onInitError?: () => void
  eventSystem?: EventSystem
}

function createGLContext(
  canvas: HTMLCanvasElement,
  options: WebGLContextAttributes,
) {
  return (
    canvas.getContext("webgl2", options) ?? canvas.getContext("webgl", options)
  )
}

export const GLCanvas = forwardRef<HTMLCanvasElement, GLSurfaceProps>(
  (
    {
      width,
      height,
      style,
      children,
      onInitError,
      eventSystem: eventSystemExternal,
      ...props
    },
    ref,
  ) => {
    const rootNode = useMemo(() => new ContainerNode(), [])
    const eventSystem = useMemo(
      () => eventSystemExternal ?? new EventSystem(rootNode),
      [eventSystemExternal, rootNode],
    )
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useImperativeHandle(ref, () => canvasRef.current!)
    const [container, setContainer] = useState<any>(null)
    const [fiberRoot, setFiberRoot] = useState<any>(null)
    const size = useComponentSize(canvasRef)

    useEffect(() => {
      const canvas = canvasRef.current

      if (canvas === null) {
        throw new Error("canvas is not mounted")
      }

      const gl = createGLContext(canvas, {
        alpha: true,
        antialias: false,
        depth: false,
        desynchronized: true,
        powerPreference: "high-performance",
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
      })

      if (gl === null) {
        if (onInitError) {
          onInitError()
        } else {
          alert("WebGL can't be initialized. May be browser doesn't support")
        }
        return
      }

      const renderer = new Renderer(gl, rootNode)

      const containerInstance = {
        renderer,
        eventSystem,
      }

      const root = GLReconciler.createContainer(
        containerInstance,
        0,
        null,
        false,
        null,
        "",
        () => {},
        null,
      )

      setContainer(containerInstance)
      setFiberRoot(root)

      return () => {
        if (root) {
          GLReconciler.updateContainer(null, root, null, () => {})
        }
      }
    }, [onInitError, eventSystem])

    const transform = useMemo(
      () => container?.renderer?.createProjectionMatrix() ?? mat4.create(),
      [container, size.width, size.height],
    )

    const content = (
      <Providers renderer={container?.renderer} transform={transform}>
        {children}
      </Providers>
    )

    // Render
    useEffect(() => {
      if (fiberRoot) {
        GLReconciler.updateContainer(content, fiberRoot, null, () => {})
      }
    }, [fiberRoot, content])

    const handleMouseDown = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (canvasRef.current) {
          eventSystem.handleMouseDown(event.nativeEvent, canvasRef.current)
        }
        props.onMouseDown?.(event)
      },
      [eventSystem, props.onMouseDown],
    )

    const handleMouseUp = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (canvasRef.current) {
          eventSystem.handleMouseUp(event.nativeEvent, canvasRef.current)
        }
        props.onMouseUp?.(event)
      },
      [eventSystem, props.onMouseUp],
    )

    const handleMouseMove = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (canvasRef.current) {
          eventSystem.handleMouseMove(event.nativeEvent, canvasRef.current)
        }
        props.onMouseMove?.(event)
      },
      [eventSystem, props.onMouseMove],
    )

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (canvasRef.current) {
          eventSystem.handleClick(event.nativeEvent, canvasRef.current)
        }
        props.onClick?.(event)
      },
      [eventSystem, props.onClick],
    )

    const handlePointerDown = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (canvasRef.current) {
          eventSystem.handlePointerDown(event.nativeEvent, canvasRef.current)
        }
        props.onPointerDown?.(event)
      },
      [eventSystem, props.onPointerDown],
    )

    const handlePointerUp = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (canvasRef.current) {
          eventSystem.handlePointerUp(event.nativeEvent, canvasRef.current)
        }
        props.onPointerUp?.(event)
      },
      [eventSystem, props.onPointerUp],
    )

    const handlePointerMove = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (canvasRef.current) {
          eventSystem.handlePointerMove(event.nativeEvent, canvasRef.current)
        }
        props.onPointerMove?.(event)
      },
      [eventSystem, props.onPointerMove],
    )

    const handlePointerCancel = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (canvasRef.current) {
          eventSystem.handlePointerCancel(event.nativeEvent, canvasRef.current)
        }
        props.onPointerCancel?.(event)
      },
      [eventSystem, props.onPointerCancel],
    )

    const canvasScale = window.devicePixelRatio

    const canvasStyle = useMemo(
      () => ({
        ...style,
        width,
        height,
      }),
      [style, width, height],
    )

    if (!container) {
      return (
        <canvas
          {...props}
          ref={canvasRef}
          width={width * canvasScale}
          height={height * canvasScale}
          style={canvasStyle}
        />
      )
    }

    return (
      <canvas
        {...props}
        ref={canvasRef}
        width={width * canvasScale}
        height={height * canvasScale}
        style={canvasStyle}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerCancel={handlePointerCancel}
      />
    )
  },
)
