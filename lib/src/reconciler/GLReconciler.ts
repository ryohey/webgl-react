import Reconciler from "react-reconciler"
import { DefaultEventPriority } from "react-reconciler/constants"
import { RenderNode } from "../GLNode/RenderNode"
import { GLContainer, GLHostContext, GLPrimitiveProps } from "./types"

const GLReconciler = Reconciler({
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  createInstance: (
    type: string,
    props: GLPrimitiveProps,
    _rootContainerInstance: GLContainer,
    hostContext: GLHostContext,
    _internalInstanceHandle: any,
  ) => {
    const instance = props.createNode(hostContext.gl)

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

  appendChildToContainer: (container: GLContainer, child: RenderNode) => {
    container.renderer.rootNode.children.push(child)
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
    container: GLContainer,
    child: RenderNode,
    beforeChild: RenderNode,
  ) => {
    const index = container.renderer.rootNode.children.indexOf(beforeChild)
    if (index !== -1) {
      container.renderer.rootNode.children.splice(index, 0, child)
    } else {
      container.renderer.rootNode.children.push(child)
    }
  },

  removeChild: (parentInstance: RenderNode, child: RenderNode) => {
    const index = parentInstance.children.indexOf(child)
    if (index !== -1) {
      parentInstance.children.splice(index, 1)
    }
  },

  removeChildFromContainer: (container: GLContainer, child: RenderNode) => {
    const index = container.renderer.rootNode.children.indexOf(child)
    if (index !== -1) {
      container.renderer.rootNode.children.splice(index, 1)
    }
  },

  commitUpdate: (
    instance: RenderNode,
    _type: string,
    prevProps: GLPrimitiveProps,
    nextProps: GLPrimitiveProps,
    _internalHandle: any,
  ) => {
    // バッファとuniformsを更新
    if (instance) {
      if (prevProps.buffer !== nextProps.buffer) {
        instance.update(nextProps.buffer)
      }
      if (prevProps.uniforms !== nextProps.uniforms) {
        instance.setUniforms(nextProps.uniforms)
      }
    }
  },

  commitMount: () => {
    // マウント後の処理が必要な場合はここに
  },

  getPublicInstance: (instance: RenderNode) => instance,

  getRootHostContext: (rootContainerInstance: GLContainer): GLHostContext => ({
    gl: rootContainerInstance.renderer.gl,
    renderer: rootContainerInstance.renderer,
    transform: rootContainerInstance.renderer.createProjectionMatrix(),
  }),

  getChildHostContext: (
    parentHostContext: GLHostContext,
    _type: string,
  ): GLHostContext => parentHostContext,

  shouldSetTextContent: () => false,

  finalizeInitialChildren: () => false,

  clearContainer: (container: GLContainer) => {
    container.renderer.rootNode.children = []
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

  // 必須メソッドの追加
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
