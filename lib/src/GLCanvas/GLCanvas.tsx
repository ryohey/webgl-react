import useComponentSize from "@rehooks/component-size"
import { mat4 } from "gl-matrix"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { EventSystem } from "../EventSystem/EventSystem"
import { EventSystemContext } from "../hooks/useEventSystem"
import { TransformContext } from "../hooks/useTransform"
import { RendererContext } from "../hooks/useRenderer"
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
  ({ width, height, style, children, ...props }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useImperativeHandle(ref, () => canvasRef.current!)
    const [renderer, setRenderer] = useState<Renderer | null>(null)
    const [eventSystem, setEventSystem] = useState<EventSystem | null>(null)
    const size = useComponentSize(canvasRef)

    useEffect(() => {
      const canvas = canvasRef.current
      if (canvas === null) {
        throw new Error("canvas is not mounted")
      }
      // GL コンテキストを初期化する
      // Initialize GL context
      const gl = createGLContext(canvas, {
        alpha: true,
        antialias: false,
        depth: false,
        desynchronized: true,
        powerPreference: "high-performance",
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
      })

      // WebGL が使用可能で動作している場合にのみ続行します
      // Continue only if WebGL is enabled
      if (gl === null) {
        alert("WebGL can't be initialized. May be browser doesn't support")
        return
      }

      const renderer = new Renderer(gl)
      const eventSystem = new EventSystem()

      setRenderer(renderer)
      setEventSystem(eventSystem)
    }, [])

    const transform = useMemo(
      () => renderer?.createProjectionMatrix() ?? mat4.create(),
      [renderer, size.width, size.height],
    )

    // Canvas event handlers are now handled directly in the JSX

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (eventSystem && canvasRef.current) {
        eventSystem.handleMouseDown(event.nativeEvent, canvasRef.current)
      }
    }

    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (eventSystem && canvasRef.current) {
        eventSystem.handleMouseUp(event.nativeEvent, canvasRef.current)
      }
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (eventSystem && canvasRef.current) {
        eventSystem.handleMouseMove(event.nativeEvent, canvasRef.current)
      }
    }

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (eventSystem && canvasRef.current) {
        eventSystem.handleClick(event.nativeEvent, canvasRef.current)
      }
    }

    const handlePointerDown = (
      event: React.PointerEvent<HTMLCanvasElement>,
    ) => {
      if (eventSystem && canvasRef.current) {
        eventSystem.handlePointerDown(event.nativeEvent, canvasRef.current)
      }
    }

    const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (eventSystem && canvasRef.current) {
        eventSystem.handlePointerUp(event.nativeEvent, canvasRef.current)
      }
    }

    const handlePointerMove = (
      event: React.PointerEvent<HTMLCanvasElement>,
    ) => {
      if (eventSystem && canvasRef.current) {
        eventSystem.handlePointerMove(event.nativeEvent, canvasRef.current)
      }
    }

    const handlePointerCancel = (
      event: React.PointerEvent<HTMLCanvasElement>,
    ) => {
      if (eventSystem && canvasRef.current) {
        eventSystem.handlePointerCancel(event.nativeEvent, canvasRef.current)
      }
    }

    const canvasScale = window.devicePixelRatio

    return (
      <>
        <canvas
          {...props}
          ref={canvasRef}
          width={width * canvasScale}
          height={height * canvasScale}
          style={{
            ...style,
            width: width,
            height: height,
          }}
          onMouseDown={(event) => {
            handleMouseDown(event)
            props.onMouseDown?.(event)
          }}
          onMouseUp={(event) => {
            handleMouseUp(event)
            props.onMouseUp?.(event)
          }}
          onMouseMove={(event) => {
            handleMouseMove(event)
            props.onMouseMove?.(event)
          }}
          onClick={(event) => {
            handleClick(event)
            props.onClick?.(event)
          }}
          onPointerDown={(event) => {
            handlePointerDown(event)
            props.onPointerDown?.(event)
          }}
          onPointerUp={(event) => {
            handlePointerUp(event)
            props.onPointerUp?.(event)
          }}
          onPointerMove={(event) => {
            handlePointerMove(event)
            props.onPointerMove?.(event)
          }}
          onPointerCancel={(event) => {
            handlePointerCancel(event)
            props.onPointerCancel?.(event)
          }}
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
