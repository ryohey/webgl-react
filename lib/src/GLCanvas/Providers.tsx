import { mat4 } from "gl-matrix"
import { FC } from "react"
import { RendererContext } from "../hooks/useRenderer"
import { TransformContext } from "../hooks/useTransform"
import { Renderer } from "../Renderer/Renderer"

export interface ProvidersProps {
  children?: React.ReactNode
  renderer: Renderer | null
  transform: mat4
}

export const Providers: FC<ProvidersProps> = ({
  children,
  renderer,
  transform,
}) => {
  if (!renderer) {
    return null
  }
  return (
    <RendererContext.Provider value={renderer}>
      <TransformContext.Provider value={transform}>
        {children}
      </TransformContext.Provider>
    </RendererContext.Provider>
  )
}
