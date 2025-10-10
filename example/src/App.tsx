import {
  BorderedCircles,
  BorderedRectangles,
  GLCanvas,
  HitArea,
  IRect,
  ISize,
  Rectangles,
} from "@ryohey/webgl-react"
import React, { FC, useEffect, useMemo, useState } from "react"

const SIZE = 640

const physics = (r: IRect & { id: number; dx: number; dy: number }) => {
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
    id: i,
    x: Math.random() * (SIZE - 30),
    y: Math.random() * (SIZE - 30),
    width: 20,
    height: 20,
    dx: (Math.random() - 0.5) * 5,
    dy: (Math.random() - 0.5) * 5,
  }))

const getRandomColor = (): [number, number, number, number] => [
  Math.random(),
  Math.random(),
  Math.random(),
  1.0,
]

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
  const [rects, setRects] = useState(createRandomRects(5))
  const [circles, setCircles] = useState(createRandomRects(20))
  const [rectColors, setRectColors] = useState<
    Record<number, [number, number, number, number]>
  >({})

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

  const handleRectClick = (index: number) => (event: any) => {
    console.log(`Clicked rect ${index}:`, event.point, event.data)
    setRectColors((prev) => ({
      ...prev,
      [index]: getRandomColor(),
    }))
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log("Canvas clicked:", event.nativeEvent)
  }

  const defaultColor: [number, number, number, number] = [1, 0, 0, 1.0]

  return (
    <>
      <h1>WebGL React</h1>
      <p>Click on the red rectangles to change their colors!</p>
      <GLCanvas height={SIZE} width={SIZE} onClick={handleCanvasClick}>
        <Border width={SIZE} height={SIZE} />
        {rects.map((rect, index) => (
          <React.Fragment key={rect.id}>
            <Rectangles
              rects={[rect]}
              color={rectColors[index] || defaultColor}
            />
            <HitArea
              bounds={rect}
              onClick={handleRectClick(index)}
              data={{ rectIndex: index, name: `Rect ${index}` }}
              zIndex={1}
            />
          </React.Fragment>
        ))}
        <BorderedCircles
          rects={circles}
          fillColor={[0, 0, 0.5, 0.5]}
          strokeColor={[0, 0, 0, 1]}
          zIndex={0}
        />
        <BorderedRectangles
          rects={circles}
          fillColor={[0, 0, 0.5, 0.5]}
          strokeColor={[0, 0, 0, 1]}
          zIndex={0}
        />
      </GLCanvas>
    </>
  )
}
