import { createContext, useContext } from "react"
import { Renderer } from "../Renderer/Renderer"

export const RendererContext = createContext<Renderer>(
  null as unknown as Renderer // never use default value
)
export const useRenderer = () => useContext(RendererContext)
