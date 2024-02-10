import {
  BorderedCircles,
  BorderedRectangles,
  GLCanvas,
  IRect,
  ISize,
  Rectangles,
} from "@ryohey/webgl-react"
import React, { FC, useEffect, useMemo, useState } from "react"

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
    width: 5,
    height: 5,
    dx: (Math.random() - 0.5) * 5,
    dy: (Math.random() - 0.5) * 5,
  }))

const Border: FC<ISize> = React.memo(({ width, height }) => {
  const rects = useMemo(() => [{ x: 0, y: 0, width, height }], [width, height])
  return (
    <BorderedRectangles
      strokeColor={[0, 1, 1, 1]}
      fillColor={[0, 0, 0, 0]}
      rects={rects}
    />
  )
})

export const App = () => {
  const [rects, setRects] = useState(createRandomRects(50000))
  const [circles, setCircles] = useState(createRandomRects(50000))

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
      <GLCanvas height={SIZE} width={SIZE}>
        <Border width={SIZE} height={SIZE} />
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
