import { useState } from "react"

interface ScreenshotButtonProps {
  onScreenshot: () => void
}

const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({ onScreenshot }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div
      className="screenshot-button-container"
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 999990,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      
      {/* 悬停提示 */}
      {isHovered && (
        <div
          className="tooltip"
          style={{
            position: "absolute",
            bottom: "100%",
            marginBottom: "5px",
            backgroundColor: "#333",
            color: "white",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "12px",
            whiteSpace: "nowrap"
          }}>
          点击开始截图
        </div>
      )}
      
      {/* 截图按钮 */}
      <button
        className="screenshot-icon-button"
        onClick={onScreenshot}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "#4285f4",
          border: "none",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s, background-color 0.2s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)"
          e.currentTarget.style.backgroundColor = "#3367d6"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)"
          e.currentTarget.style.backgroundColor = "#4285f4"
        }}>
        
        {/* 相机图标 SVG */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </button>
    </div>
  )
}

export default ScreenshotButton