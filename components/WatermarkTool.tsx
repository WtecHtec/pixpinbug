import { useEffect, useRef, useState } from "react"

interface WatermarkToolProps {
  text: string
  selectionArea: {
    left: number
    top: number
    width: number
    height: number
  }
  onClose: () => void
}

const WatermarkTool: React.FC<WatermarkToolProps> = ({
  text,
  selectionArea,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [opacity, setOpacity] = useState(0.3)
  const [angle, setAngle] = useState(-30)
  const [fontSize, setFontSize] = useState(16)
  
  console.log("selectionArea::::", selectionArea)
  // 绘制水印
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.width = selectionArea.width
    canvas.height = selectionArea.height
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 设置水印样式
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`
    ctx.font = `${fontSize}px Arial`
    
    // 保存当前状态
    ctx.save()
    
    // 旋转画布
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((angle * Math.PI) / 180)
    
    // 计算水印间距
    const textWidth = ctx.measureText(text).width
    const xGap = textWidth + 40
    const yGap = fontSize * 2
    
    // 绘制重复水印
    for (let y = -canvas.height; y < canvas.height; y += yGap) {
      for (let x = -canvas.width; x < canvas.width; x += xGap) {
        ctx.fillText(text, x, y)
      }
    }
    
    // 恢复画布状态
    ctx.restore()
  }, [text, selectionArea, opacity, angle, fontSize])
  
  return (
    <div className="pixpin-watermark-container">
      <canvas
        ref={canvasRef}
        className="pixpin-watermark-canvas"
        style={{
          position: "fixed",
          left: selectionArea.left,
          top: selectionArea.top,
          width: selectionArea.width,
          height: selectionArea.height,
          pointerEvents: "none",
          zIndex: 999997
        }}
      />
      
      <div className="pixpin-watermark-controls" style={{
        position: "fixed",
        right: 20,
        top: 20,
        backgroundColor: "white",
        padding: 10,
        borderRadius: 4,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        zIndex: 999999
      }}>
        <div>
          <label>透明度：</label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>角度：</label>
          <input
            type="range"
            min="-90"
            max="90"
            step="5"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label>字体大小：</label>
          <input
            type="range"
            min="8"
            max="36"
            step="1"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
          />
        </div>
        <button style={{
                padding: "8px",
                backgroundColor: "#4285f4",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }} onClick={onClose}>关闭水印</button>
      </div>
    </div>
  )
}

export default WatermarkTool