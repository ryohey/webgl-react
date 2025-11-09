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
import { createProjectionMatrix } from "../helpers/createProjectionMatrix"
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
  cursor?: string
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
      cursor,
      ...props
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useImperativeHandle(ref, () => canvasRef.current!)
    const [renderer, setRenderer] = useState<Renderer | null>(null)
    const [eventSystem, setEventSystem] = useState<EventSystem | null>(null)
    const [currentCursor, setCurrentCursor] = useState<string | null>(null)
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

      eventSystem.setOnCursorChange(setCurrentCursor)

      setRenderer(renderer)
      setEventSystem(eventSystem)
    }, [onInitError])

    const transform = useMemo(
      () =>
        canvasRef.current
          ? createProjectionMatrix(canvasRef.current)
          : mat4.create(),
      [canvasRef.current, canvasRef.current?.width, canvasRef.current?.height],
    )

    const handleMouseDown = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        let propagationStopped = false
        if (eventSystem && canvasRef.current) {
          const result = eventSystem.handleMouseDown(
            event.nativeEvent,
            canvasRef.current,
          )
          propagationStopped = result.propagationStopped
        }
        if (!propagationStopped) {
          props.onMouseDown?.(event)
        }
      },
      [eventSystem, props.onMouseDown],
    )

    const handleMouseUp = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        let propagationStopped = false
        if (eventSystem && canvasRef.current) {
          const result = eventSystem.handleMouseUp(
            event.nativeEvent,
            canvasRef.current,
          )
          propagationStopped = result.propagationStopped
        }
        if (!propagationStopped) {
          props.onMouseUp?.(event)
        }
      },
      [eventSystem, props.onMouseUp],
    )

    const handleMouseMove = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        let propagationStopped = false
        if (eventSystem && canvasRef.current) {
          const result = eventSystem.handleMouseMove(
            event.nativeEvent,
            canvasRef.current,
          )
          propagationStopped = result.propagationStopped
        }
        if (!propagationStopped) {
          props.onMouseMove?.(event)
        }
      },
      [eventSystem, props.onMouseMove],
    )

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        let propagationStopped = false
        if (eventSystem && canvasRef.current) {
          const result = eventSystem.handleClick(
            event.nativeEvent,
            canvasRef.current,
          )
          propagationStopped = result.propagationStopped
        }
        if (!propagationStopped) {
          props.onClick?.(event)
        }
      },
      [eventSystem, props.onClick],
    )

    const handlePointerDown = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        let propagationStopped = false
        if (eventSystem && canvasRef.current) {
          const result = eventSystem.handlePointerDown(
            event.nativeEvent,
            canvasRef.current,
          )
          propagationStopped = result.propagationStopped
        }
        if (!propagationStopped) {
          props.onPointerDown?.(event)
        }
      },
      [eventSystem, props.onPointerDown],
    )

    const handlePointerUp = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        let propagationStopped = false
        if (eventSystem && canvasRef.current) {
          const result = eventSystem.handlePointerUp(
            event.nativeEvent,
            canvasRef.current,
          )
          propagationStopped = result.propagationStopped
        }
        if (!propagationStopped) {
          props.onPointerUp?.(event)
        }
      },
      [eventSystem, props.onPointerUp],
    )

    const handlePointerMove = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        let propagationStopped = false
        if (eventSystem && canvasRef.current) {
          const result = eventSystem.handlePointerMove(
            event.nativeEvent,
            canvasRef.current,
          )
          propagationStopped = result.propagationStopped
        }
        if (!propagationStopped) {
          props.onPointerMove?.(event)
        }
      },
      [eventSystem, props.onPointerMove],
    )

    const handlePointerCancel = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        let propagationStopped = false
        if (eventSystem && canvasRef.current) {
          const result = eventSystem.handlePointerCancel(
            event.nativeEvent,
            canvasRef.current,
          )
          propagationStopped = result.propagationStopped
        }
        if (!propagationStopped) {
          props.onPointerCancel?.(event)
        }
      },
      [eventSystem, props.onPointerCancel],
    )

    const handleWheel = useCallback(
      (event: React.WheelEvent<HTMLCanvasElement>) => {
        let propagationStopped = false
        if (eventSystem && canvasRef.current) {
          const result = eventSystem.handleWheel(
            event.nativeEvent,
            canvasRef.current,
          )
          propagationStopped = result.propagationStopped
        }
        if (!propagationStopped) {
          props.onWheel?.(event)
        }
      },
      [eventSystem, props.onWheel],
    )

    const canvasScale = window.devicePixelRatio

    const canvasStyle = useMemo(
      () => ({
        ...style,
        width,
        height,
        cursor: currentCursor ?? cursor ?? "default",
      }),
      [style, width, height, cursor, currentCursor],
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
          onWheel={handleWheel}
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
