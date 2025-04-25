import React, { useEffect, useRef, useState } from "react"

interface SequencePosition {
  x: number
  y: number
}

interface SequenceData {
  id: string
  position: SequencePosition
  number: number
}

interface SequenceEffectProps {
    isActive: boolean,
  onClose: () => void
  selectionArea: {
    left: number
    top: number
    width: number
    height: number
  }
}

const SequenceEffect: React.FC<SequenceEffectProps> = ({
    isActive,
  onClose,
  selectionArea
}) => {
  const [sequences, setSequences] = useState<SequenceData[]>([])
  const [activeSequence, setActiveSequence] = useState<string | null>(null)
  const [currentNumber, setCurrentNumber] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // 获取相对坐标
  const getRelativeCoordinates = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  // 处理点击添加序列号
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY)
    
    const newSequence: SequenceData = {
      id: `sequence-${Date.now()}`,
      position: { x, y },
      number: currentNumber
    }
    
    setSequences([...sequences, newSequence])
    setCurrentNumber(currentNumber + 1)
  }

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent, sequenceId: string) => {
    e.stopPropagation()
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY)
    const sequence = sequences.find(s => s.id === sequenceId)
    
    if (sequence) {
      setIsDragging(true)
      setActiveSequence(sequenceId)
      setDragStartPos({
        x: x - sequence.position.x,
        y: y - sequence.position.y
      })
    }
  }

  // 处理鼠标移动事件
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !activeSequence) return
    
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY)
    
    setSequences(sequences.map(sequence =>
      sequence.id === activeSequence
        ? {
            ...sequence,
            position: {
              x: x - dragStartPos.x,
              y: y - dragStartPos.y
            }
          }
        : sequence
    ))
  }

  // 处理鼠标释放事件
  const handleMouseUp = () => {
    setIsDragging(false)
    // setActiveSequence(null)
  }

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if ((e.key === "Delete" || e.key === "Backspace") && activeSequence) {
        setSequences(sequences.filter(s => s.id !== activeSequence))
        setActiveSequence(null)
        // 重新计算序号
        const remainingSequences = sequences
          .filter(s => s.id !== activeSequence)
          .sort((a, b) => a.number - b.number)
        
        remainingSequences.forEach((seq, index) => {
          seq.number = index + 1
        })
        
        setCurrentNumber(remainingSequences.length + 1)
      }
    }
    
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, activeSequence, sequences])

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: selectionArea.left,
        top: selectionArea.top,
        width: selectionArea.width,
        height: selectionArea.height,
        cursor: isDragging ? "grabbing" : "pointer",
        zIndex: 999998,
        pointerEvents: isActive? "auto" : "none",
      }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {sequences.map(sequence => (
        <div
          key={sequence.id}
          style={{
            position: "absolute",
            left: sequence.position.x - 16,
            top: sequence.position.y - 16,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            border: `2px solid ${sequence.id === activeSequence ? "#4285f4" : "#888"}`,
            borderRadius: "50%",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            fontSize: "14px",
            fontWeight: "bold",
            color: sequence.id === activeSequence ? "#4285f4" : "#333"
          }}
          onMouseDown={(e) => handleMouseDown(e, sequence.id)}
          onClick={(e) => e.stopPropagation()}
        >
          {sequence.number}
        </div>
      ))}
    </div>
  )
}

export default SequenceEffect