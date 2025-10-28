import { mat4, vec2 } from "gl-matrix"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventSystem } from "./EventSystem"
import { HitAreaNode } from "../GLNode/HitAreaNode"
import { ContainerNode } from "../GLNode/RenderNode"

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
  let rootNode: ContainerNode

  beforeEach(() => {
    rootNode = new ContainerNode()
    eventSystem = new EventSystem(rootNode)
    mockCanvas = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 640,
        height: 640,
      }),
      width: 640,
      height: 640,
      offsetWidth: 640,
      offsetHeight: 640,
    } as HTMLCanvasElement
  })

  describe("tree-based hit detection", () => {
    it("should detect hits in tree structure", () => {
      const hitAreaNode = new HitAreaNode({
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        zIndex: 1,
      })

      rootNode.addChild(hitAreaNode)

      // Hit area should be detected
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: 35,
        clientY: 25,
      })

      expect(eventSystem.handleEvent(mouseEvent, mockCanvas, "onMouseDown")).toBe(false) // Hit detected but no handler

      // Remove hit area
      rootNode.removeChild(hitAreaNode)

      // Hit area should no longer be detected
      expect(eventSystem.handleEvent(mouseEvent, mockCanvas, "onMouseDown")).toBe(false)
    })
  })

  describe("hit detection", () => {
    it("should detect hits within bounds", () => {
      const onMouseDown = vi.fn()
      const hitAreaNode = new HitAreaNode({
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        zIndex: 1,
        onMouseDown,
      })

      rootNode.addChild(hitAreaNode)

      // Hit inside bounds
      const hitEvent = new MouseEvent("mousedown", {
        clientX: 35,
        clientY: 25,
      })
      expect(eventSystem.handleEvent(hitEvent, mockCanvas, "onMouseDown")).toBe(true)
      expect(onMouseDown).toHaveBeenCalledWith(
        expect.objectContaining({
          nativeEvent: hitEvent,
          point: vec2.fromValues(35, 25),
          data: undefined,
        }),
      )

      // Check that the event has the correct methods
      const calledEvent = onMouseDown.mock.calls[0][0]
      expect(typeof calledEvent.stopPropagation).toBe("function")
      expect(typeof calledEvent.preventDefault).toBe("function")
    })

    it("should not detect hits outside bounds", () => {
      const onMouseDown = vi.fn()
      const hitAreaNode = new HitAreaNode({
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        zIndex: 1,
        onMouseDown,
      })

      rootNode.addChild(hitAreaNode)

      // Hit outside bounds
      const missEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 100,
      })
      expect(eventSystem.handleEvent(missEvent, mockCanvas, "onMouseDown")).toBe(false)
      expect(onMouseDown).not.toHaveBeenCalled()
    })
  })

  describe("z-index ordering", () => {
    it("should prioritize higher z-index hit areas", () => {
      const onMouseDownLow = vi.fn()
      const onMouseDownHigh = vi.fn()

      const lowZIndexNode = new HitAreaNode({
        bounds: { x: 0, y: 0, width: 100, height: 100 },
        zIndex: 1,
        onMouseDown: onMouseDownLow,
      })

      const highZIndexNode = new HitAreaNode({
        bounds: { x: 10, y: 10, width: 50, height: 50 },
        zIndex: 10,
        onMouseDown: onMouseDownHigh,
      })

      rootNode.addChild(lowZIndexNode)
      rootNode.addChild(highZIndexNode)

      // Click in overlapping area
      const clickEvent = new MouseEvent("mousedown", {
        clientX: 35,
        clientY: 35,
      })

      expect(eventSystem.handleEvent(clickEvent, mockCanvas, "onMouseDown")).toBe(true)
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

      const hitAreaNode = new HitAreaNode({
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        zIndex: 1,
        ...handlers,
      })

      rootNode.addChild(hitAreaNode)

      const createEvent = (type: string) =>
        new MouseEvent(type, {
          clientX: 35,
          clientY: 25,
        })

      expect(
        eventSystem.handleEvent(createEvent("mousedown"), mockCanvas, "onMouseDown"),
      ).toBe(true)
      expect(handlers.onMouseDown).toHaveBeenCalled()

      expect(
        eventSystem.handleEvent(createEvent("mouseup"), mockCanvas, "onMouseUp"),
      ).toBe(true)
      expect(handlers.onMouseUp).toHaveBeenCalled()

      expect(
        eventSystem.handleMoveEvent(createEvent("mousemove"), mockCanvas, "onMouseMove", "onMouseEnter", "onMouseLeave"),
      ).toBe(true)
      expect(handlers.onMouseMove).toHaveBeenCalled()

      expect(eventSystem.handleEvent(createEvent("click"), mockCanvas, "onClick")).toBe(
        true,
      )
      expect(handlers.onClick).toHaveBeenCalled()
    })
  })

  describe("mouse enter/leave events", () => {
    it("should trigger enter and leave events", () => {
      const onMouseEnter = vi.fn()
      const onMouseLeave = vi.fn()

      const hitAreaNode = new HitAreaNode({
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        zIndex: 1,
        onMouseEnter,
        onMouseLeave,
      })

      rootNode.addChild(hitAreaNode)

      // Move outside first
      const outsideEvent = new MouseEvent("mousemove", {
        clientX: 5,
        clientY: 5,
      })
      eventSystem.handleMoveEvent(outsideEvent, mockCanvas, "onMouseMove", "onMouseEnter", "onMouseLeave")

      // Move inside - should trigger enter
      const insideEvent = new MouseEvent("mousemove", {
        clientX: 35,
        clientY: 25,
      })
      eventSystem.handleMoveEvent(insideEvent, mockCanvas, "onMouseMove", "onMouseEnter", "onMouseLeave")
      expect(onMouseEnter).toHaveBeenCalled()

      // Move outside - should trigger leave
      eventSystem.handleMoveEvent(outsideEvent, mockCanvas, "onMouseMove", "onMouseEnter", "onMouseLeave")
      expect(onMouseLeave).toHaveBeenCalled()
    })
  })


  describe("event data", () => {
    it("should pass custom data to event handlers", () => {
      const customData = { id: 123, name: "test rect" }
      const onMouseDown = vi.fn()

      const hitAreaNode = new HitAreaNode({
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        zIndex: 1,
        onMouseDown,
        data: customData,
      })

      rootNode.addChild(hitAreaNode)

      const clickEvent = new MouseEvent("mousedown", {
        clientX: 35,
        clientY: 25,
      })

      eventSystem.handleEvent(clickEvent, mockCanvas, "onMouseDown")

      expect(onMouseDown).toHaveBeenCalledWith(
        expect.objectContaining({
          nativeEvent: clickEvent,
          point: vec2.fromValues(35, 25),
          data: customData,
        }),
      )
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
        clientX: 35,
        clientY: 25,
      } as unknown as MouseEvent

      const hitAreaNode = new HitAreaNode({
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        zIndex: 1,
        onMouseDown,
      })

      rootNode.addChild(hitAreaNode)
      eventSystem.handleEvent(mockEvent, mockCanvas, "onMouseDown")

      expect(onMouseDown).toHaveBeenCalled()
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
  })

  describe("pointer events", () => {
    it("should handle pointer events like mouse events", () => {
      const onPointerDown = vi.fn()
      const onPointerUp = vi.fn()
      const onPointerMove = vi.fn()

      const hitAreaNode = new HitAreaNode({
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        zIndex: 1,
        onPointerDown,
        onPointerUp,
        onPointerMove,
      })

      rootNode.addChild(hitAreaNode)

      const createPointerEvent = (type: string) =>
        new PointerEvent(type, {
          clientX: 35,
          clientY: 25,
          pointerId: 1,
          pointerType: "mouse",
        })

      expect(
        eventSystem.handleEvent(
          createPointerEvent("pointerdown"),
          mockCanvas,
          "onPointerDown",
        ),
      ).toBe(true)
      expect(onPointerDown).toHaveBeenCalled()

      expect(
        eventSystem.handleEvent(
          createPointerEvent("pointerup"),
          mockCanvas,
          "onPointerUp",
        ),
      ).toBe(true)
      expect(onPointerUp).toHaveBeenCalled()

      expect(
        eventSystem.handleMoveEvent(
          createPointerEvent("pointermove"),
          mockCanvas,
          "onPointerMove",
          "onPointerEnter",
          "onPointerLeave",
        ),
      ).toBe(true)
      expect(onPointerMove).toHaveBeenCalled()
    })

    it("should handle pointer enter/leave events", () => {
      const onPointerEnter = vi.fn()
      const onPointerLeave = vi.fn()

      const hitAreaNode = new HitAreaNode({
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        zIndex: 1,
        onPointerEnter,
        onPointerLeave,
      })

      rootNode.addChild(hitAreaNode)

      // Move outside first
      const outsideEvent = new PointerEvent("pointermove", {
        clientX: 5,
        clientY: 5,
        pointerId: 1,
      })
      eventSystem.handleMoveEvent(outsideEvent, mockCanvas, "onPointerMove", "onPointerEnter", "onPointerLeave")

      // Move inside - should trigger enter
      const insideEvent = new PointerEvent("pointermove", {
        clientX: 35,
        clientY: 25,
        pointerId: 1,
      })
      eventSystem.handleMoveEvent(insideEvent, mockCanvas, "onPointerMove", "onPointerEnter", "onPointerLeave")
      expect(onPointerEnter).toHaveBeenCalled()

      // Move outside - should trigger leave
      eventSystem.handleMoveEvent(outsideEvent, mockCanvas, "onPointerMove", "onPointerEnter", "onPointerLeave")
      expect(onPointerLeave).toHaveBeenCalled()
    })

    it("should handle pointer cancel event", () => {
      const onPointerCancel = vi.fn()

      const hitAreaNode = new HitAreaNode({
        bounds: { x: 10, y: 10, width: 50, height: 30 },
        zIndex: 1,
        onPointerCancel,
      })

      rootNode.addChild(hitAreaNode)

      const cancelEvent = new PointerEvent("pointercancel", {
        clientX: 35,
        clientY: 25,
        pointerId: 1,
      })

      expect(eventSystem.handleEvent(cancelEvent, mockCanvas, "onPointerCancel")).toBe(
        true,
      )
      expect(onPointerCancel).toHaveBeenCalled()
    })
  })

  describe("transform support", () => {
    it("should handle hit detection with transforms", () => {
      const onMouseDown = vi.fn()
      
      // Create a transform that translates by (50, 50)
      const transform = mat4.create()
      mat4.translate(transform, transform, [50, 50, 0])
      
      const hitAreaNode = new HitAreaNode({
        bounds: { x: 0, y: 0, width: 50, height: 50 },
        zIndex: 1,
        transform: transform,
        onMouseDown,
      })

      rootNode.addChild(hitAreaNode)

      // Hit at transformed position (75, 75) should hit local bounds (25, 25)
      const hitEvent = new MouseEvent("mousedown", {
        clientX: 75,
        clientY: 75,
      })
      expect(eventSystem.handleEvent(hitEvent, mockCanvas, "onMouseDown")).toBe(true)
      expect(onMouseDown).toHaveBeenCalled()

      // Hit at original position (25, 25) should miss due to transform
      const missEvent = new MouseEvent("mousedown", {
        clientX: 25,
        clientY: 25,
      })
      onMouseDown.mockClear()
      expect(eventSystem.handleEvent(missEvent, mockCanvas, "onMouseDown")).toBe(false)
      expect(onMouseDown).not.toHaveBeenCalled()
    })

  })
})
