import Reconciler from "react-reconciler"
import { GLContainer } from "../GLContainer/GLContainer"
import { HitAreaNode } from "../GLNode/HitAreaNode"
import { RenderNode } from "../GLNode/RenderNode"
import { NODE_TYPES } from "../GLNode/types"
import { GLPrimitiveProps, HitAreaPrimitiveProps } from "./types"

// import { DefaultEventPriority } from "react-reconciler/constants"
export const DefaultEventPriority = 0b0000000000000000000000000010000

interface GLHostContext {}

type GLInstance = RenderNode | HitAreaNode

const GLReconciler = Reconciler({
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  createInstance: (
    type: string,
    props: GLPrimitiveProps | HitAreaPrimitiveProps,
    rootContainer: GLContainer,
  ) => {
    let instance: GLInstance

    if (type === "hit-area") {
      const hitAreaProps = props as HitAreaPrimitiveProps
      instance = new HitAreaNode({
        bounds: hitAreaProps.bounds,
        zIndex: hitAreaProps.zIndex,
        transform: hitAreaProps.transform,
        data: hitAreaProps.data,
        onMouseDown: hitAreaProps.onMouseDown,
        onMouseUp: hitAreaProps.onMouseUp,
        onMouseMove: hitAreaProps.onMouseMove,
        onMouseEnter: hitAreaProps.onMouseEnter,
        onMouseLeave: hitAreaProps.onMouseLeave,
        onClick: hitAreaProps.onClick,
        onPointerDown: hitAreaProps.onPointerDown,
        onPointerUp: hitAreaProps.onPointerUp,
        onPointerMove: hitAreaProps.onPointerMove,
        onPointerEnter: hitAreaProps.onPointerEnter,
        onPointerLeave: hitAreaProps.onPointerLeave,
        onPointerCancel: hitAreaProps.onPointerCancel,
      })
    } else {
      const glProps = props as GLPrimitiveProps
      instance = glProps.createNode(rootContainer.renderer.gl)
      instance.update(glProps.buffer)
      instance.setUniforms(glProps.uniforms)
    }

    return instance
  },

  createTextInstance: () => {
    throw new Error("Text instances are not supported in WebGL renderer")
  },

  appendInitialChild: (parentInstance: GLInstance, child: GLInstance) => {
    parentInstance.addChild(child)
  },

  appendChild: (parentInstance: GLInstance, child: GLInstance) => {
    parentInstance.addChild(child)
  },

  appendChildToContainer: (container: GLContainer, child: GLInstance) => {
    container.rootNode.addChild(child)
  },

  insertBefore: (
    parentInstance: GLInstance,
    child: GLInstance,
    beforeChild: GLInstance,
  ) => {
    const index = parentInstance.children.indexOf(beforeChild)
    if (index !== -1) {
      parentInstance.children.splice(index, 0, child)
      child.parent = parentInstance
    } else {
      parentInstance.addChild(child)
    }
  },

  insertInContainerBefore: (
    container: GLContainer,
    child: GLInstance,
    beforeChild: GLInstance,
  ) => {
    const index = container.rootNode.children.indexOf(beforeChild)
    if (index !== -1) {
      container.rootNode.children.splice(index, 0, child)
      child.parent = container.rootNode
    } else {
      container.rootNode.addChild(child)
    }
  },

  removeChild: (parentInstance: GLInstance, child: GLInstance) => {
    parentInstance.removeChild(child)
  },

  removeChildFromContainer: (container: GLContainer, child: GLInstance) => {
    container.rootNode.removeChild(child)
  },

  commitUpdate: (
    instance: GLInstance,
    _type: string,
    prevProps: GLPrimitiveProps | HitAreaPrimitiveProps,
    nextProps: GLPrimitiveProps | HitAreaPrimitiveProps,
    _internalHandle: any,
  ) => {
    if (instance.type === NODE_TYPES.HIT_AREA) {
      const nextHitAreaProps = nextProps as HitAreaPrimitiveProps
      const hitAreaInstance = instance as HitAreaNode

      // Update HitAreaNode properties directly
      hitAreaInstance.bounds = nextHitAreaProps.bounds
      hitAreaInstance.zIndex = nextHitAreaProps.zIndex || 0
      hitAreaInstance.transform =
        nextHitAreaProps.transform || hitAreaInstance.transform
      hitAreaInstance.data = nextHitAreaProps.data
      hitAreaInstance.onMouseDown = nextHitAreaProps.onMouseDown
      hitAreaInstance.onMouseUp = nextHitAreaProps.onMouseUp
      hitAreaInstance.onMouseMove = nextHitAreaProps.onMouseMove
      hitAreaInstance.onMouseEnter = nextHitAreaProps.onMouseEnter
      hitAreaInstance.onMouseLeave = nextHitAreaProps.onMouseLeave
      hitAreaInstance.onClick = nextHitAreaProps.onClick
      hitAreaInstance.onPointerDown = nextHitAreaProps.onPointerDown
      hitAreaInstance.onPointerUp = nextHitAreaProps.onPointerUp
      hitAreaInstance.onPointerMove = nextHitAreaProps.onPointerMove
      hitAreaInstance.onPointerEnter = nextHitAreaProps.onPointerEnter
      hitAreaInstance.onPointerLeave = nextHitAreaProps.onPointerLeave
      hitAreaInstance.onPointerCancel = nextHitAreaProps.onPointerCancel
    } else {
      // This is a RenderNode
      const prevGLProps = prevProps as GLPrimitiveProps
      const nextGLProps = nextProps as GLPrimitiveProps
      const renderInstance = instance as RenderNode

      if (prevGLProps.buffer !== nextGLProps.buffer) {
        renderInstance.update(nextGLProps.buffer)
      }
      if (prevGLProps.uniforms !== nextGLProps.uniforms) {
        renderInstance.setUniforms(nextGLProps.uniforms)
      }
    }
  },

  commitMount: () => {},
  getPublicInstance: (instance) => instance,
  getRootHostContext: (): GLHostContext => ({}),
  getChildHostContext: () => null as any,
  shouldSetTextContent: () => false,
  finalizeInitialChildren: () => false,

  clearContainer: (container: GLContainer) => {
    container.rootNode.children = []
  },

  commitTextUpdate: () => {
    throw new Error("Text updates are not supported in WebGL renderer")
  },

  prepareForCommit: () => null,
  resetAfterCommit: (container) => {
    container.renderer.setNeedsDisplay()
  },
  preparePortalMount: () => {},

  getCurrentUpdatePriority: () => DefaultEventPriority,

  getInstanceFromNode: () => null,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  prepareScopeUpdate: () => {},
  getInstanceFromScope: () => null,
  detachDeletedInstance: () => {},

  scheduleTimeout: (fn: (...args: unknown[]) => unknown, delay?: number) =>
    setTimeout(fn, delay),
  cancelTimeout: (id: unknown) => clearTimeout(id as any),
  noTimeout: -1,
  isPrimaryRenderer: false,
  warnsIfNotActing: false,
  supportsMicrotasks: false,
  scheduleMicrotask:
    typeof queueMicrotask === "function"
      ? queueMicrotask
      : (fn: () => void) => Promise.resolve().then(fn),

  NotPendingTransition: null,
  HostTransitionContext: {} as any,
  preloadInstance: () => true,
  startSuspendingCommit: () => {},
  suspendInstance: () => {},
  waitForCommitToBeReady: () => null,
  hideInstance: () => {},
  hideTextInstance: () => {},
  unhideInstance: () => {},
  unhideTextInstance: () => {},
  setCurrentUpdatePriority: () => {},
  resolveUpdatePriority: () => DefaultEventPriority,
  resetFormInstance: () => {},
  requestPostPaintCallback: () => {},
  maySuspendCommit: () => false,
  shouldAttemptEagerTransition: () => false,
  trackSchedulerEvent: () => {},
  resolveEventType: () => null,
  resolveEventTimeStamp: () => 0,
})

export default GLReconciler
