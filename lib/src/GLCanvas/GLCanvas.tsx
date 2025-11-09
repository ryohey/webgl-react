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
import { EventSystemContext } from "../hooks/useEventSystem"
import { RendererContext } from "../hooks/useRenderer"
import { TransformContext } from "../hooks/useTransform"
import { Renderer } from "../Renderer/Renderer"

export type GLSurfaceProps = Omit<
  React.DetailedHTMLProps<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  >,
  "ref"
> & {
  width: number
  height: number
  onInitError?: (error: string) => void
  contextAttributes?: WebGLContextAttributes
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
      contextAttributes,
      ...props
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useImperativeHandle(ref, () => canvasRef.current!)
    const [renderer, setRenderer] = useState<Renderer | null>(null)
    const [eventSystem, setEventSystem] = useState<EventSystem | null>(null)
    const size = useComponentSize(canvasRef)
    const errorAlert = useCallback((error: string) => alert(error), [])

    useEffect(() => {
      const canvas = canvasRef.current
      if (canvas === null) {
        throw new Error("canvas is not mounted")
      }
      // Initialize GL context
      const gl = createGLContext(
        canvas,
        contextAttributes ?? {
          alpha: true,
          antialias: false,
          depth: false,
          powerPreference: "high-performance",
          premultipliedAlpha: true,
          preserveDrawingBuffer: false,
        },
      )

      // Continue only if WebGL is enabled
      if (gl === null) {
        ;(onInitError ?? errorAlert)(
          "WebGL can't be initialized. May be browser doesn't support",
        )
        return
      }

      const renderer = new Renderer(gl)
      const eventSystem = new EventSystem()

      setRenderer(renderer)
      setEventSystem(eventSystem)
    }, [onInitError])

    const transform = useMemo(
      () => renderer?.createProjectionMatrix() ?? mat4.create(),
      [renderer, size.width, size.height],
    )

    const handleMouseDown = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (eventSystem && canvasRef.current) {
          eventSystem.handleMouseDown(event.nativeEvent, canvasRef.current)
        }
        props.onMouseDown?.(event)
      },
      [eventSystem, props.onMouseDown],
    )

    const handleMouseUp = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (eventSystem && canvasRef.current) {
          eventSystem.handleMouseUp(event.nativeEvent, canvasRef.current)
        }
        props.onMouseUp?.(event)
      },
      [eventSystem, props.onMouseUp],
    )

    const handleMouseMove = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (eventSystem && canvasRef.current) {
          eventSystem.handleMouseMove(event.nativeEvent, canvasRef.current)
        }
        props.onMouseMove?.(event)
      },
      [eventSystem, props.onMouseMove],
    )

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (eventSystem && canvasRef.current) {
          eventSystem.handleClick(event.nativeEvent, canvasRef.current)
        }
        props.onClick?.(event)
      },
      [eventSystem, props.onClick],
    )

    const handlePointerDown = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (eventSystem && canvasRef.current) {
          eventSystem.handlePointerDown(event.nativeEvent, canvasRef.current)
        }
        props.onPointerDown?.(event)
      },
      [eventSystem, props.onPointerDown],
    )

    const handlePointerUp = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (eventSystem && canvasRef.current) {
          eventSystem.handlePointerUp(event.nativeEvent, canvasRef.current)
        }
        props.onPointerUp?.(event)
      },
      [eventSystem, props.onPointerUp],
    )

    const handlePointerMove = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (eventSystem && canvasRef.current) {
          eventSystem.handlePointerMove(event.nativeEvent, canvasRef.current)
        }
        props.onPointerMove?.(event)
      },
      [eventSystem, props.onPointerMove],
    )

    const handlePointerCancel = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (eventSystem && canvasRef.current) {
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

    return (
      <>
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
        {renderer && eventSystem && (
          <RendererContext.Provider value={renderer}>
            <EventSystemContext.Provider value={eventSystem}>
              <TransformContext.Provider value={transform}>
                {children}
              </TransformContext.Provider>
            </EventSystemContext.Provider>
          </RendererContext.Provider>
        )}
      </>
    )
  },
)
