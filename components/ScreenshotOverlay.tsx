import { useEffect, useRef, useState } from "react"
import AnnotationTools, { type ToolBarEffectRef } from "./AnnotationTools"
import { feishuBug } from "~flows/feishu"
import runAction from "~utils/action"
import GlobalState from "~store/bgglobalstate"

interface ScreenshotOverlayProps {
  onClose: () => void
}

const ScreenshotOverlay: React.FC<ScreenshotOverlayProps> = ({ onClose }) => {
  const [isSelecting, setIsSelecting] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [endPos, setEndPos] = useState({ x: 0, y: 0 })
  const [showTools, setShowTools] = useState(false)
  const [isFullPageMode, setIsFullPageMode] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const toolbarRef = useRef<ToolBarEffectRef>(null)
  
  // 计算选区尺寸和位置
  const selectionStyle = {
    left: Math.min(startPos.x, endPos.x),
    top: Math.min(startPos.y, endPos.y),
    width: Math.abs(endPos.x - startPos.x),
    height: Math.abs(endPos.y - startPos.y)
  }
  
  // 鼠标按下事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (showTools) return // 如果工具栏已显示，不重新开始选择
    
    setIsSelecting(true)
    setShowTools(false)
    const { clientX, clientY } = e
    setStartPos({ x: clientX, y: clientY })
    setEndPos({ x: clientX, y: clientY })
  }
  
  // 鼠标移动事件处理
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return
    const { clientX, clientY } = e
    setEndPos({ x: clientX, y: clientY })
  }
  
  // 鼠标释放事件处理
  const handleMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false)
      setShowTools(true)
      // 如果选区有效，显示工具栏
      if (Math.abs(endPos.x - startPos.x) > 5 && Math.abs(endPos.y - startPos.y) > 5) {
        setShowTools(true)
      }
    }
  }
  
  // 取消截图
  const handleCancel = () => {
    onClose()
  }
  
  // 完成截图
  const handleCapture = async () => {
    if (isFullPageMode) {
      // 长截图模式
      chrome.runtime.sendMessage({
        action: "captureFullPage"
      })
    } else {
      // 普通截图模式
      chrome.runtime.sendMessage({
        action: "captureVisibleTab",
        area: selectionStyle
      })
    }
    
    // 关闭截图模式
    setTimeout(() => {
        onClose()
    }, 1000)
   
  }
  
  // 切换长截图模式
  const toggleFullPageMode = () => {
    setIsFullPageMode(!isFullPageMode)
  }
  
  // 监听ESC键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (toolbarRef.current && toolbarRef.current.operationHistory.length > 0) {
          toolbarRef.current.handleUndo()
          return
        }
        onClose()
      }
    }
    
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  const onSubmitBug = (bug: any) => {
    console.log('bug', bug)
    handleCapture()
    GlobalState.instance.set('bug', bug)
  }
  
  return (
    <div 
      className="screenshot-overlay"
      ref={overlayRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: showTools ?  "transparent" : "rgba(0, 0, 0, 0.3)",
        zIndex: 999991,
        cursor: isSelecting ? "crosshair" : "default"
      }}>
      
      {/* 选区框 */}
      {(isSelecting || showTools) && !isFullPageMode && (
        <div 
          className="selection-box" 
          style={{
            position: "absolute",
            left: selectionStyle.left,
            top: selectionStyle.top,
            width: selectionStyle.width,
            height: selectionStyle.height,
            border: "1px solid #4285f4",
            backgroundColor: "transparent", // 选区内透明
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)", // 创建选区
            pointerEvents: "none"
          }}>
          <div 
            className="selection-size"
            style={{
              position: "absolute",
              top: "-25px",
              left: 0,
              backgroundColor: "#4285f4",
              color: "white",
              padding: "2px 6px",
              fontSize: "12px",
              borderRadius: "2px"
            }}>
            {Math.round(selectionStyle.width)} x {Math.round(selectionStyle.height)}
          </div>
        </div>
      )}
      
      {/* 全页面截图提示 */}
      {isFullPageMode && (
        <div 
          className="full-page-indicator"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
          <h3>长截图模式已启用</h3>
          <p>将捕获整个页面内容</p>
          <button 
            onClick={handleCapture}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              marginRight: "10px",
              cursor: "pointer"
            }}>
            开始截图
          </button>
          <button 
            onClick={toggleFullPageMode}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}>
            取消
          </button>
        </div>
      )}
      
      {/* 工具栏 */}
      {showTools && !isFullPageMode && (
        <div 
          className="annotation-toolbar"
          style={{
            position: "absolute",
            left: selectionStyle.left + selectionStyle.width,
            top: selectionStyle.top + selectionStyle.height,
            backgroundColor: "white",
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            zIndex: 999999
          }}>
          <AnnotationTools 
            ref={toolbarRef}
            onCapture={handleCapture}
            onCancel={handleCancel}
            onFullPageMode={toggleFullPageMode}
            selectionArea={selectionStyle}
            onSubmitBug={onSubmitBug}
          />
        </div>
      )}
    </div>
  )
}

export default ScreenshotOverlay