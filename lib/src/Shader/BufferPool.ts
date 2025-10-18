// Helper class to manage Float32Array buffer reuse for performance
export class BufferPool {
  private buffers: Map<string, Float32Array> = new Map()

  // Get or create a Float32Array buffer for the given attribute
  // Resizes if needed when data size changes
  getBuffer(attributeName: string, requiredSize: number): Float32Array {
    const existing = this.buffers.get(attributeName)
    
    if (!existing || existing.length < requiredSize) {
      // Create new buffer if doesn't exist or is too small
      const newBuffer = new Float32Array(requiredSize)
      this.buffers.set(attributeName, newBuffer)
      return newBuffer
    }
    
    // Return existing buffer (may be larger than needed, but that's OK)
    return existing
  }

  // Set data to the buffer and return a view of the exact size needed
  setBufferData(attributeName: string, data: number[]): Float32Array {
    const buffer = this.getBuffer(attributeName, data.length)
    buffer.set(data, 0)
    
    // Return a view of the exact size (important for WebGL buffer uploads)
    return buffer.subarray(0, data.length)
  }

  // Clear all buffers (useful for cleanup)
  clear(): void {
    this.buffers.clear()
  }
}