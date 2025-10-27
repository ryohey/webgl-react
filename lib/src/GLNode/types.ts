// Node types for reconciler
export const NODE_TYPES = {
  RENDER: 'render',
  HIT_AREA: 'hit-area',
  CONTAINER: 'container'
} as const

export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES]