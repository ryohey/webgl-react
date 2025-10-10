import { createContext, useContext } from "react"
import { EventSystem } from "../EventSystem/EventSystem"

export const EventSystemContext = createContext<EventSystem>(
  null as unknown as EventSystem,
)

export const useEventSystem = () => useContext(EventSystemContext)
