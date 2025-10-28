import { mat4 } from "gl-matrix"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import ReactReconciler from "react-reconciler"
import { EventSystem } from "../EventSystem/EventSystem"
import { GLContainer } from "../GLContainer/GLContainer"
import { ContainerNode } from "../GLNode/RenderNode"
import { createProjectionMatrix } from "../helpers/createProjectionMatrix"
import GLReconciler from "../reconciler/GLReconciler"
import { Renderer } from "../Renderer/Renderer"
import { Providers } from "./Providers"
import { useEventHandlers } from "./useEventHandlers"

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
    const [container, setContainer] = useState<GLContainer | null>(null)
    const [fiberRoot, setFiberRoot] =
      useState<ReactReconciler.OpaqueRoot | null>(null)

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
        rootNode,
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

    const projectionMatrix = useMemo(
      () =>
        canvasRef.current
          ? createProjectionMatrix(canvasRef.current)
          : mat4.create(),
      [canvasRef.current?.width, canvasRef.current?.height],
    )

    const content = (
      <Providers
        renderer={container?.renderer ?? null}
        transform={projectionMatrix}
      >
        {children}
      </Providers>
    )

    // Render
    useEffect(() => {
      if (fiberRoot) {
        GLReconciler.updateContainer(content, fiberRoot, null, () => {})
      }
    }, [fiberRoot, content])

    const eventHandlers = useEventHandlers(eventSystem, canvasRef, props)

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
        {...eventHandlers}
        ref={canvasRef}
        width={width * canvasScale}
        height={height * canvasScale}
        style={canvasStyle}
      />
    )
  },
)
