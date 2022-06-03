import { describe, expect, it } from "vitest"
import { RenderProperty } from "./RenderProperty"

describe("RenderProperty", () => {
  it("should flagged as isDirty", () => {
    const prop = new RenderProperty(100)
    expect(prop.value).toBe(100)
    expect(prop.isDirty).toBeTruthy()
    prop.value = 100
    expect(prop.value).toBe(100)
    expect(prop.isDirty).toBeTruthy()
    prop.value = 101
    expect(prop.value).toBe(101)
    expect(prop.isDirty).toBeTruthy()
  })
})
