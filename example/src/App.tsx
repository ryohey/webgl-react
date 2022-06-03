import {
  BorderedCircles,
  GLCanvas,
  IRect,
  Rectangles,
} from "@ryohey/webgl-react"
import { useEffect, useState } from "react"

const SIZE = 640

const physics = (r: IRect & { dx: number; dy: number }) => {
  if (r.x < 0 || r.x + r.width > SIZE) {
    r.dx *= -1
  }
  if (r.y < 0 || r.y + r.height > SIZE) {
    r.dy *= -1
  }
  return {
    ...r,
    x: r.x + r.dx,
    y: r.y + r.dy,
  }
}

const createRandomRects = (num: number) =>
  [...Array(num).keys()].map((i) => ({
    x: Math.random() * (SIZE - 30),
    y: Math.random() * (SIZE - 30),
    width: 30,
    height: 30,
    dx: (Math.random() - 0.5) * 5,
    dy: (Math.random() - 0.5) * 5,
  }))

export const App = () => {
  const [rects, setRects] = useState(createRandomRects(500))
  const [circles, setCircles] = useState(createRandomRects(500))

  useEffect(() => {
    let handle: number
    const update = () => {
      setRects((rects) => rects.map(physics))
      setCircles((rects) => rects.map(physics))
      handle = requestAnimationFrame(update)
    }
    update()
    return () => cancelAnimationFrame(handle)
  }, [])

  return (
    <>
      <h1>WebGL React</h1>
      <GLCanvas
        height={SIZE}
        width={SIZE}
        style={{ border: "1px solid black" }}
      >
        <Rectangles rects={rects} color={[0.5, 1, 0.5, 1.0]} />
        <BorderedCircles
          rects={circles}
          fillColor={[0, 0, 0.5, 0.5]}
          strokeColor={[0, 0, 0, 1]}
          zIndex={0}
        />
      </GLCanvas>
    </>
  )
}
