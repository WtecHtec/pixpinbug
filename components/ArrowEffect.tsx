import React, { useEffect, useRef, useState } from "react"

interface ArrowPosition {
  start: { x: number; y: number }
  end: { x: number; y: number }
}

interface ArrowData {
  id: string
  position: ArrowPosition
}

interface ArrowEffectProps {
  isActive: boolean
  onClose: () => void
  selectionArea: {
    left: number
    top: number
    width: number
    height: number
  }
}

const ArrowEffect: React.FC<ArrowEffectProps> = ({
  isActive,
  onClose,
  selectionArea
}) => {
  const [arrows, setArrows] = useState<ArrowData[]>([])
  const [activeArrow, setActiveArrow] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentArrow, setCurrentArrow] = useState<ArrowPosition | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const getRelativeCoordinates = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY)
    setIsDrawing(true)
    setCurrentArrow({
      start: { x, y },
      end: { x, y }
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentArrow || !isActive) return
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY)
    setCurrentArrow({
      ...currentArrow,
      end: { x, y }
    })
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentArrow || !isActive) return
    const newArrow: ArrowData = {
      id: `arrow-${Date.now()}`,
      position: currentArrow
    }
    setArrows([...arrows, newArrow])
    setIsDrawing(false)
    setCurrentArrow(null)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if ((e.key === "Delete" || e.key === "Backspace") && activeArrow) {
        setArrows(arrows.filter(arrow => arrow.id !== activeArrow))
        setActiveArrow(null)
      }
    }
    
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, activeArrow, arrows])

  const drawArrow = (start: { x: number; y: number }, end: { x: number; y: number }, isActive: boolean = false) => {
    const dx = end.x - start.x
    const dy = end.y - start.y
    const angle = Math.atan2(dy, dx)
    const length = Math.sqrt(dx * dx + dy * dy)
    const arrowHeadLength = 20
    const arrowHeadAngle = Math.PI / 6

    const arrowHead1X = end.x - arrowHeadLength * Math.cos(angle - arrowHeadAngle)
    const arrowHead1Y = end.y - arrowHeadLength * Math.sin(angle - arrowHeadAngle)
    const arrowHead2X = end.x - arrowHeadLength * Math.cos(angle + arrowHeadAngle)
    const arrowHead2Y = end.y - arrowHeadLength * Math.sin(angle + arrowHeadAngle)

    return (
      <g>
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke={isActive ? "#4285f4" : "#ff0000"}
          strokeWidth="2"
        />
        <line
          x1={arrowHead1X}
          y1={arrowHead1Y}
          x2={end.x}
          y2={end.y}
          stroke={isActive ? "#4285f4" : "#ff0000"}
          strokeWidth="2"
        />
        <line
          x1={arrowHead2X}
          y1={arrowHead2Y}
          x2={end.x}
          y2={end.y}
          stroke={isActive ? "#4285f4" : "#ff0000"}
          strokeWidth="2"
        />
      </g>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: selectionArea.left,
        top: selectionArea.top,
        width: selectionArea.width,
        height: selectionArea.height,
        cursor: isActive ? "crosshair" : "default",
        zIndex: 999998
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      >
        {arrows.map(arrow => (
          <g
            key={arrow.id}
            onClick={(e) => {
              e.stopPropagation()
              setActiveArrow(arrow.id)
            }}
          >
            {drawArrow(arrow.position.start, arrow.position.end, arrow.id === activeArrow)}
          </g>
        ))}
        {currentArrow && drawArrow(currentArrow.start, currentArrow.end)}
      </svg>
    </div>
  )
}

export default ArrowEffect