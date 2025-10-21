import Reconciler from "react-reconciler"
import { DefaultEventPriority } from "react-reconciler/constants"
import { RenderNode } from "../GLNode/RenderNode"
import { Renderer } from "../Renderer/Renderer"
import { GLPrimitiveProps } from "./types"

type GLHostContext = {
  gl: WebGLRenderingContext | WebGL2RenderingContext
  renderer: Renderer
}

const GLReconciler = Reconciler({
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  createInstance: (
    type: string,
    props: GLPrimitiveProps,
    rootContainer: Renderer,
  ) => {
    const instance = props.createNode(rootContainer.gl)

    instance.type = type
    instance.update(props.buffer)
    instance.setUniforms(props.uniforms)

    return instance
  },

  createTextInstance: () => {
    throw new Error("Text instances are not supported in WebGL renderer")
  },

  appendInitialChild: (parentInstance: RenderNode, child: RenderNode) => {
    parentInstance.children.push(child)
  },

  appendChild: (parentInstance: RenderNode, child: RenderNode) => {
    parentInstance.children.push(child)
  },

  appendChildToContainer: (container: Renderer, child: RenderNode) => {
    container.rootNode.children.push(child)
  },

  insertBefore: (
    parentInstance: RenderNode,
    child: RenderNode,
    beforeChild: RenderNode,
  ) => {
    const index = parentInstance.children.indexOf(beforeChild)
    if (index !== -1) {
      parentInstance.children.splice(index, 0, child)
    } else {
      parentInstance.children.push(child)
    }
  },

  insertInContainerBefore: (
    container: Renderer,
    child: RenderNode,
    beforeChild: RenderNode,
  ) => {
    const index = container.rootNode.children.indexOf(beforeChild)
    if (index !== -1) {
      container.rootNode.children.splice(index, 0, child)
    } else {
      container.rootNode.children.push(child)
    }
  },

  removeChild: (parentInstance: RenderNode, child: RenderNode) => {
    const index = parentInstance.children.indexOf(child)
    if (index !== -1) {
      parentInstance.children.splice(index, 1)
    }
  },

  removeChildFromContainer: (container: Renderer, child: RenderNode) => {
    const index = container.rootNode.children.indexOf(child)
    if (index !== -1) {
      container.rootNode.children.splice(index, 1)
    }
  },

  commitUpdate: (
    instance: RenderNode,
    _type: string,
    prevProps: GLPrimitiveProps,
    nextProps: GLPrimitiveProps,
    _internalHandle: any,
  ) => {
    if (prevProps.buffer !== nextProps.buffer) {
      instance.update(nextProps.buffer)
    }
    if (prevProps.uniforms !== nextProps.uniforms) {
      instance.setUniforms(nextProps.uniforms)
    }
  },

  commitMount: () => {},
  getPublicInstance: (instance) => instance,
  getRootHostContext: (rootContainerInstance): GLHostContext => ({
    gl: rootContainerInstance.gl,
    renderer: rootContainerInstance,
  }),

  getChildHostContext: (
    parentHostContext: GLHostContext,
    _type: string,
  ): GLHostContext => parentHostContext,

  shouldSetTextContent: () => false,
  finalizeInitialChildren: () => false,

  clearContainer: (container: Renderer) => {
    container.rootNode.children = []
  },

  commitTextUpdate: () => {
    throw new Error("Text updates are not supported in WebGL renderer")
  },

  prepareForCommit: () => null,
  resetAfterCommit: (container) => {
    container.setNeedsDisplay()
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
