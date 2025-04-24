import React, { useEffect, useRef, useState } from "react"

interface SpotlightPosition {
  x: number
  y: number
}

interface SpotlightSize {
  width: number
  height: number
}

interface SpotlightData {
  id: string
  position: SpotlightPosition
  size: SpotlightSize
  shape: "rectangle" | "circle"
}

interface SpotlightEffectProps {
  shape: "rectangle" | "circle"
  opacity: number
  onClose: () => void
  selectionArea: {
    left: number
    top: number
    width: number
    height: number
  }
}

const SpotlightEffect: React.FC<SpotlightEffectProps> = ({
  shape,
  opacity,
  onClose,
  selectionArea
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [spotlights, setSpotlights] = useState<SpotlightData[]>([])
  const [activeSpotlight, setActiveSpotlight] = useState<string | null>(null)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })

  const getRelativeCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
  
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
  
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY
  
    return { x, y }
  }
  
  // 绘制聚光灯效果
  const drawSpotlight = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 绘制半透明黑色背景
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 绘制所有聚光灯
    spotlights.forEach(spotlight => {
      // 设置混合模式为"destination-out"
      ctx.globalCompositeOperation = "destination-out"
      
      // 根据形状绘制透明区域
      if (spotlight.shape === "rectangle") {
        ctx.fillStyle = "rgba(255, 255, 255, 1)"
        ctx.fillRect(
          spotlight.position.x,
          spotlight.position.y,
          spotlight.size.width,
          spotlight.size.height
        )
      } else if (spotlight.shape === "circle") {
        const radius = Math.min(spotlight.size.width, spotlight.size.height) / 2
        const centerX = spotlight.position.x + spotlight.size.width / 2
        const centerY = spotlight.position.y + spotlight.size.height / 2
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // 恢复默认混合模式
      ctx.globalCompositeOperation = "source-over"
      
      // 绘制边框
      ctx.strokeStyle = spotlight.id === activeSpotlight ? "#4285f4" : "#888888"
      ctx.lineWidth = 2
      
      if (spotlight.shape === "rectangle") {
        ctx.strokeRect(
          spotlight.position.x,
          spotlight.position.y,
          spotlight.size.width,
          spotlight.size.height
        )
      } else if (spotlight.shape === "circle") {
        const radius = Math.min(spotlight.size.width, spotlight.size.height) / 2
        const centerX = spotlight.position.x + spotlight.size.width / 2
        const centerY = spotlight.position.y + spotlight.size.height / 2
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
  }

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { x, y } = getRelativeCoordinates(clientX, clientY)
  
    const clickedSpotlight = spotlights.find(spotlight =>
      x >= spotlight.position.x &&
      x <= spotlight.position.x + spotlight.size.width &&
      y >= spotlight.position.y &&
      y <= spotlight.position.y + spotlight.size.height
    )
  
    if (clickedSpotlight) {
      setIsDragging(true)
      setActiveSpotlight(clickedSpotlight.id)
      setDragStartPos({
        x: x - clickedSpotlight.position.x,
        y: y - clickedSpotlight.position.y
      })
    } else {
      setIsSelecting(true)
      setStartPos({ x, y })
      setActiveSpotlight(null)
    }
  }

  // 处理鼠标移动事件
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { x, y } = getRelativeCoordinates(clientX, clientY)
  
    if (isSelecting) {
      const width = x - startPos.x
      const height = y - startPos.y
  
      const tempSpotlight: SpotlightData = {
        id: 'temp',
        position: {
          x: width > 0 ? startPos.x : x,
          y: height > 0 ? startPos.y : y
        },
        size: {
          width: Math.abs(width),
          height: Math.abs(height)
        },
        shape
      }
  
      setSpotlights([...spotlights.filter(s => s.id !== 'temp'), tempSpotlight])
    } else if (isDragging && activeSpotlight) {
      setSpotlights(spotlights.map(spotlight =>
        spotlight.id === activeSpotlight
          ? {
              ...spotlight,
              position: {
                x: x - dragStartPos.x,
                y: y - dragStartPos.y
              }
            }
          : spotlight
      ))
    }
  }

  // 处理鼠标释放事件
  const handleMouseUp = () => {
    if (isSelecting) {
      // 完成新聚光灯创建
      setSpotlights(spotlights.map(spotlight =>
        spotlight.id === 'temp'
          ? { ...spotlight, id: `spotlight-${Date.now()}` }
          : spotlight
      ))
      setIsSelecting(false)
    }
    setIsDragging(false)
  }

  // 当属性变化时重绘
  useEffect(() => {
    drawSpotlight()
  }, [shape, spotlights, opacity, isSelecting, activeSpotlight])

  // 窗口大小变化时重绘
  useEffect(() => {
    const handleResize = () => {
      drawSpotlight()
    }
    
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [spotlights, shape, opacity, isSelecting, activeSpotlight])

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "Delete" || e.key === "Backspace") {
        // 删除当前选中的聚光灯
        if (activeSpotlight) {
          setSpotlights(spotlights.filter(s => s.id !== activeSpotlight))
          setActiveSpotlight(null)
        }
      }
    }
    
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, activeSpotlight, spotlights])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        left: selectionArea.left,
        top: selectionArea.top,
        width: selectionArea.width + 2,
        height: selectionArea.height + 2,
        zIndex: 999998,
        cursor: isSelecting ? "crosshair" : isDragging ? "grabbing" : "grab"
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  )
}

export default SpotlightEffect