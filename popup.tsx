import { useEffect, useState } from "react"
import "./style.css"

function IndexPopup() {
  const [isCapturing, setIsCapturing] = useState(false)

  const handleCapture = async () => {
    setIsCapturing(true)
    
    // 发送消息给后台脚本开始截图
    chrome.runtime.sendMessage({ action: "startScreenshot" })
    
    // 关闭弹窗
    window.close()
  }
  useEffect(() => {
    handleCapture()
  }, [])

  return (
    <div className="popup-container">
      <h1>Pixpin 截图工具</h1>
      <button 
        onClick={handleCapture}
        disabled={isCapturing}
        className="capture-button"
      >
        {isCapturing ? "截图中..." : "开始截图"}
      </button>
    </div>
  )
}

export default IndexPopup