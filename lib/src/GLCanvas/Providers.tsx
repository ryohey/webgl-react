import { mat4 } from "gl-matrix"
import { FC } from "react"
import { EventSystem } from "../EventSystem/EventSystem"
import { EventSystemContext } from "../hooks/useEventSystem"
import { RendererContext } from "../hooks/useRenderer"
import { TransformContext } from "../hooks/useTransform"
import { Renderer } from "../Renderer/Renderer"

export interface ProvidersProps {
  children?: React.ReactNode
  renderer: Renderer | null
  eventSystem: EventSystem | null
  transform: mat4
}

export const Providers: FC<ProvidersProps> = ({
  children,
  renderer,
  eventSystem,
  transform,
}) => {
  if (!renderer || !eventSystem) {
    return null
  }
  return (
    <RendererContext.Provider value={renderer}>
      <EventSystemContext.Provider value={eventSystem}>
        <TransformContext.Provider value={transform}>
          {children}
        </TransformContext.Provider>
      </EventSystemContext.Provider>
    </RendererContext.Provider>
  )
}
