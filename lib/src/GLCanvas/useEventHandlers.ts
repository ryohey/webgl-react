import { RefObject, useCallback } from "react"
import { EventSystem } from "../EventSystem/EventSystem"

export function useEventHandlers(
  eventSystem: EventSystem,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  props: {
    onMouseDown?: (event: React.MouseEvent<HTMLCanvasElement>) => void
    onMouseUp?: (event: React.MouseEvent<HTMLCanvasElement>) => void
    onMouseMove?: (event: React.MouseEvent<HTMLCanvasElement>) => void
    onClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void
    onPointerDown?: (event: React.PointerEvent<HTMLCanvasElement>) => void
    onPointerUp?: (event: React.PointerEvent<HTMLCanvasElement>) => void
    onPointerMove?: (event: React.PointerEvent<HTMLCanvasElement>) => void
    onPointerCancel?: (event: React.PointerEvent<HTMLCanvasElement>) => void
  },
) {
  const createEventHandler = (eventName: keyof typeof props) =>
    useCallback(
      (
        event:
          | React.MouseEvent<HTMLCanvasElement>
          | React.PointerEvent<HTMLCanvasElement>,
      ) => {
        if (canvasRef.current) {
          if (
            eventSystem.handleEvent(
              event.nativeEvent,
              canvasRef.current,
              eventName as any,
            )
          ) {
            return
          }
        }
        const propHandler = props[eventName as keyof typeof props] as
          | ((
              event:
                | React.MouseEvent<HTMLCanvasElement>
                | React.PointerEvent<HTMLCanvasElement>,
            ) => void)
          | undefined
        propHandler?.(event)
      },
      [eventSystem, canvasRef, props[eventName as keyof typeof props]],
    )

  const createMoveEventHandler = (
    eventName: keyof typeof props,
    enterEventName: "onMouseEnter" | "onPointerEnter",
    leaveEventName: "onMouseLeave" | "onPointerLeave",
  ) => {
    return useCallback(
      (
        event:
          | React.MouseEvent<HTMLCanvasElement>
          | React.PointerEvent<HTMLCanvasElement>,
      ) => {
        if (canvasRef.current) {
          if (
            eventSystem.handleMoveEvent(
              event.nativeEvent,
              canvasRef.current,
              eventName as any,
              enterEventName,
              leaveEventName,
            )
          ) {
            return
          }
        }
        const propHandler = props[eventName as keyof typeof props] as
          | ((
              event:
                | React.MouseEvent<HTMLCanvasElement>
                | React.PointerEvent<HTMLCanvasElement>,
            ) => void)
          | undefined
        propHandler?.(event)
      },
      [
        eventSystem,
        canvasRef,
        props[eventName as keyof typeof props],
        enterEventName,
        leaveEventName,
      ],
    )
  }

  const eventHandlers = Object.fromEntries(
    [
      "onMouseDown",
      "onMouseUp",
      "onClick",
      "onPointerDown",
      "onPointerUp",
      "onPointerCancel",
    ].map((eventName) => [
      eventName,
      createEventHandler(eventName as keyof typeof props),
    ]),
  )

  const moveEventHandlers = {
    onMouseMove: createMoveEventHandler(
      "onMouseMove",
      "onMouseEnter",
      "onMouseLeave",
    ),
    onPointerMove: createMoveEventHandler(
      "onPointerMove",
      "onPointerEnter",
      "onPointerLeave",
    ),
  }

  return {
    ...eventHandlers,
    ...moveEventHandlers,
  }
}
