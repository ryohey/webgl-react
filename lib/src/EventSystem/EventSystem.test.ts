import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventSystem } from "./EventSystem"
import { HitArea } from "./HitArea"
import { createProjectionMatrix } from "../helpers/createProjectionMatrix"

// Mock MouseEvent and PointerEvent for Node.js environment
global.MouseEvent = vi.fn().mockImplementation((type: string, init?: any) => ({
  type,
  clientX: init?.clientX || 0,
  clientY: init?.clientY || 0,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
})) as any

global.PointerEvent = vi
  .fn()
  .mockImplementation((type: string, init?: any) => ({
    type,
    clientX: init?.clientX || 0,
    clientY: init?.clientY || 0,
    pointerId: init?.pointerId || 1,
    pointerType: init?.pointerType || "mouse",
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  })) as any

describe("EventSystem", () => {
  let eventSystem: EventSystem
  let mockCanvas: HTMLCanvasElement

  beforeEach(() => {
    eventSystem = new EventSystem()
    mockCanvas = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 640,
        height: 640,
      }),
      clientWidth: 640,
      clientHeight: 640,
      width: 640,
      height: 640,
    } as HTMLCanvasElement
  })

  describe("addHitArea and removeHitArea", () => {
    it("should add and remove hit areas", () => {
      const hitArea: HitArea = {
        id: "test-1",
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        transform: createProjectionMatrix(mockCanvas),
        zIndex: 1,
      }

      eventSystem.addHitArea(hitArea)

      // Hit area should be added
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: 35,
        clientY: 25,
      })

      expect(eventSystem.handleMouseDown(mouseEvent, mockCanvas)).toBe(false) // No handler, but hit detected

      eventSystem.removeHitArea("test-1")

      // Hit area should be removed
      expect(eventSystem.handleMouseDown(mouseEvent, mockCanvas)).toBe(false)
    })
  })

  describe("hit detection", () => {
    it("should detect hits within bounds", () => {
      const onMouseDown = vi.fn()

      // Use the same projection matrix that EventSystem uses
      const transform = createProjectionMatrix(mockCanvas)

      const hitArea: HitArea = {
        id: "test-1",
        bounds: { x: 10, y: 10, width: 50, height: 30 }, // Pixel coordinates
        transform,
        zIndex: 1,
        onMouseDown,
      }

      eventSystem.addHitArea(hitArea)

      // Hit inside bounds
      const hitEvent = new MouseEvent("mousedown", {
        clientX: 35,
        clientY: 25,
      })
      expect(eventSystem.handleMouseDown(hitEvent, mockCanvas)).toBe(true)
      expect(onMouseDown).toHaveBeenCalledWith(hitEvent)
    })

    it("should not detect hits outside bounds", () => {
      const onMouseDown = vi.fn()
      const hitArea: HitArea = {
        id: "test-1",
        bounds: { x: 10, y: 10, width: 50, height: 30 }, // Pixel coordinates
        transform: createProjectionMatrix(mockCanvas),
        zIndex: 1,
        onMouseDown,
      }

      eventSystem.addHitArea(hitArea)

      // Hit outside bounds
      const missEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 100,
      })
      expect(eventSystem.handleMouseDown(missEvent, mockCanvas)).toBe(false)
      expect(onMouseDown).not.toHaveBeenCalled()
    })
  })

  describe("z-index ordering", () => {
    it("should prioritize higher z-index hit areas", () => {
      const onMouseDownLow = vi.fn()
      const onMouseDownHigh = vi.fn()

      const lowZIndexArea: HitArea = {
        id: "low",
        bounds: { x: 0, y: 0, width: 100, height: 100 }, // Pixel coordinates
        transform: createProjectionMatrix(mockCanvas),
        zIndex: 1,
        onMouseDown: onMouseDownLow,
      }

      const highZIndexArea: HitArea = {
        id: "high",
        bounds: { x: 10, y: 10, width: 50, height: 50 }, // Pixel coordinates
        transform: createProjectionMatrix(mockCanvas),
        zIndex: 10,
        onMouseDown: onMouseDownHigh,
      }

      eventSystem.addHitArea(lowZIndexArea)
      eventSystem.addHitArea(highZIndexArea)

      // Click in overlapping area
      const clickEvent = new MouseEvent("mousedown", {
        clientX: 35,
        clientY: 35,
      })

      expect(eventSystem.handleMouseDown(clickEvent, mockCanvas)).toBe(true)
      expect(onMouseDownHigh).toHaveBeenCalled()
      expect(onMouseDownLow).not.toHaveBeenCalled()
    })
  })

  describe("event types", () => {
    it("should handle all mouse event types", () => {
      const handlers = {
        onMouseDown: vi.fn(),
        onMouseUp: vi.fn(),
        onMouseMove: vi.fn(),
        onMouseEnter: vi.fn(),
        onMouseLeave: vi.fn(),
        onClick: vi.fn(),
      }

      const hitArea: HitArea = {
        id: "test-1",
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        transform: createProjectionMatrix(mockCanvas),
        zIndex: 1,
        ...handlers,
      }

      eventSystem.addHitArea(hitArea)

      const createEvent = (type: string) =>
        new MouseEvent(type, {
          clientX: 35,
          clientY: 25,
        })

      expect(
        eventSystem.handleMouseDown(createEvent("mousedown"), mockCanvas),
      ).toBe(true)
      expect(handlers.onMouseDown).toHaveBeenCalled()

      expect(
        eventSystem.handleMouseUp(createEvent("mouseup"), mockCanvas),
      ).toBe(true)
      expect(handlers.onMouseUp).toHaveBeenCalled()

      expect(
        eventSystem.handleMouseMove(createEvent("mousemove"), mockCanvas),
      ).toBe(true)
      expect(handlers.onMouseMove).toHaveBeenCalled()

      expect(eventSystem.handleClick(createEvent("click"), mockCanvas)).toBe(
        true,
      )
      expect(handlers.onClick).toHaveBeenCalled()
    })
  })

  describe("mouse enter/leave events", () => {
    it("should trigger enter and leave events", () => {
      const onMouseEnter = vi.fn()
      const onMouseLeave = vi.fn()

      const hitArea: HitArea = {
        id: "test-1",
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        transform: createProjectionMatrix(mockCanvas),
        zIndex: 1,
        onMouseEnter,
        onMouseLeave,
      }

      eventSystem.addHitArea(hitArea)

      // Move outside first
      const outsideEvent = new MouseEvent("mousemove", {
        clientX: 5,
        clientY: 5,
      })
      eventSystem.handleMouseMove(outsideEvent, mockCanvas)

      // Move inside - should trigger enter
      const insideEvent = new MouseEvent("mousemove", {
        clientX: 35,
        clientY: 25,
      })
      eventSystem.handleMouseMove(insideEvent, mockCanvas)
      expect(onMouseEnter).toHaveBeenCalled()

      // Move outside - should trigger leave
      eventSystem.handleMouseMove(outsideEvent, mockCanvas)
      expect(onMouseLeave).toHaveBeenCalled()
    })
  })

  describe("canvas event fallback", () => {
    it("should call canvas handlers when no hit area handles the event", () => {
      const onCanvasMouseDown = vi.fn()
      eventSystem.setCanvasEventHandlers({
        onMouseDown: onCanvasMouseDown,
      })

      const clickEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 100,
      })

      expect(eventSystem.handleMouseDown(clickEvent, mockCanvas)).toBe(true)
      expect(onCanvasMouseDown).toHaveBeenCalledWith(clickEvent)
    })

    it("should not call canvas handlers when hit area handles the event", () => {
      const onCanvasMouseDown = vi.fn()
      const onHitAreaMouseDown = vi.fn()

      eventSystem.setCanvasEventHandlers({
        onMouseDown: onCanvasMouseDown,
      })

      const hitArea: HitArea = {
        id: "test-1",
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        transform: createProjectionMatrix(mockCanvas),
        zIndex: 1,
        onMouseDown: onHitAreaMouseDown,
      }

      eventSystem.addHitArea(hitArea)

      const clickEvent = new MouseEvent("mousedown", {
        clientX: 35,
        clientY: 25,
      })

      expect(eventSystem.handleMouseDown(clickEvent, mockCanvas)).toBe(true)
      expect(onHitAreaMouseDown).toHaveBeenCalled()
      expect(onCanvasMouseDown).not.toHaveBeenCalled()
    })
  })

  describe("event methods", () => {
    it("should allow stopping propagation and preventing default", () => {
      const onMouseDown = vi.fn((event) => {
        event.stopPropagation()
        event.preventDefault()
      })

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientX: 35,
        clientY: 25,
      } as unknown as MouseEvent

      const hitArea: HitArea = {
        id: "test-1",
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        transform: createProjectionMatrix(mockCanvas),
        zIndex: 1,
        onMouseDown,
      }

      eventSystem.addHitArea(hitArea)
      eventSystem.handleMouseDown(mockEvent, mockCanvas)

      expect(onMouseDown).toHaveBeenCalled()
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })
  })

  describe("pointer events", () => {
    it("should handle pointer events like mouse events", () => {
      const onPointerDown = vi.fn()
      const onPointerUp = vi.fn()
      const onPointerMove = vi.fn()

      const hitArea: HitArea = {
        id: "test-1",
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        transform: createProjectionMatrix(mockCanvas),
        zIndex: 1,
        onPointerDown,
        onPointerUp,
        onPointerMove,
      }

      eventSystem.addHitArea(hitArea)

      const createPointerEvent = (type: string) =>
        new PointerEvent(type, {
          clientX: 35,
          clientY: 25,
          pointerId: 1,
          pointerType: "mouse",
        })

      expect(
        eventSystem.handlePointerDown(
          createPointerEvent("pointerdown"),
          mockCanvas,
        ),
      ).toBe(true)
      expect(onPointerDown).toHaveBeenCalled()

      expect(
        eventSystem.handlePointerUp(
          createPointerEvent("pointerup"),
          mockCanvas,
        ),
      ).toBe(true)
      expect(onPointerUp).toHaveBeenCalled()

      expect(
        eventSystem.handlePointerMove(
          createPointerEvent("pointermove"),
          mockCanvas,
        ),
      ).toBe(true)
      expect(onPointerMove).toHaveBeenCalled()
    })

    it("should handle pointer enter/leave events", () => {
      const onPointerEnter = vi.fn()
      const onPointerLeave = vi.fn()

      const hitArea: HitArea = {
        id: "test-1",
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        transform: createProjectionMatrix(mockCanvas),
        zIndex: 1,
        onPointerEnter,
        onPointerLeave,
      }

      eventSystem.addHitArea(hitArea)

      // Move outside first
      const outsideEvent = new PointerEvent("pointermove", {
        clientX: 5,
        clientY: 5,
        pointerId: 1,
      })
      eventSystem.handlePointerMove(outsideEvent, mockCanvas)

      // Move inside - should trigger enter
      const insideEvent = new PointerEvent("pointermove", {
        clientX: 35,
        clientY: 25,
        pointerId: 1,
      })
      eventSystem.handlePointerMove(insideEvent, mockCanvas)
      expect(onPointerEnter).toHaveBeenCalled()

      // Move outside - should trigger leave
      eventSystem.handlePointerMove(outsideEvent, mockCanvas)
      expect(onPointerLeave).toHaveBeenCalled()
    })

    it("should handle pointer cancel event", () => {
      const onPointerCancel = vi.fn()

      const hitArea: HitArea = {
        id: "test-1",
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        transform: createProjectionMatrix(mockCanvas),
        zIndex: 1,
        onPointerCancel,
      }

      eventSystem.addHitArea(hitArea)

      const cancelEvent = new PointerEvent("pointercancel", {
        clientX: 35,
        clientY: 25,
        pointerId: 1,
      })

      expect(eventSystem.handlePointerCancel(cancelEvent, mockCanvas)).toBe(
        true,
      )
      expect(onPointerCancel).toHaveBeenCalled()
    })
  })
})
