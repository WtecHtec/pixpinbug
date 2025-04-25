import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import SpotlightEffect from "./SpotlightEffect"
import WatermarkTool from "./WatermarkTool"
import SequenceEffect from "./SequenceEffect"
import ArrowEffect from "./ArrowEffect"
import { feishuBug } from "~flows/feishu"
import runAction from "~utils/action"
import type { BugConfig } from "~options"

interface AnnotationToolsProps {
  onCapture: () => void
  onCancel: () => void
  onFullPageMode: () => void
  onSubmitBug: (data: any) => void
  selectionArea: {
    left: number
    top: number
    width: number
    height: number
  }
}

export interface ToolBarEffectRef {
  operationHistory: Array<{
    type: string;
    data: any;
  }>
  handleUndo: () => void
}

const AnnotationTools = forwardRef<ToolBarEffectRef, AnnotationToolsProps>((props, ref) => {
  const {
    onCapture,
    onCancel,
    onFullPageMode,
    selectionArea,
    onSubmitBug,
  } = props as AnnotationToolsProps
  const [activeTab, setActiveTab] = useState("basic")
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null)
  const [showSpotlight, setShowSpotlight] = useState(false)
  const [spotlightShape, setSpotlightShape] = useState<"rectangle" | "circle">("rectangle")
  const [spotlightOpacity, setSpotlightOpacity] = useState(0.5)
  const [showWatermark, setShowWatermark] = useState(false)
  const [watermarkText, setWatermarkText] = useState("")
  const [isSequenceMode, setIsSequenceMode] = useState(false)
  const [currentActive, setCurrentActive] = useState<string | null>(null)
  const [showArrow, setShowArrow] = useState(false)
  const [bugConfigs, setBugConfigs] = useState<BugConfig[]>([])
  // 添加操作历史状态
  const [operationHistory, setOperationHistory] = useState<Array<{
    type: string;
    data: any;
  }>>([])

  useImperativeHandle(ref, () => ({
    operationHistory,
    handleUndo
  }))

  // 标注工具列表
  const annotationTools = [
    { id: "rectangle", icon: "□", label: "矩形" },
    { id: "sequence", icon: "①", label: "序列号" },
    { id: "arrow", icon: "↗", label: "箭头" }
  ]

  // 聚光灯工具列表
  const spotlightTools = [
    { id: "rectangle-spotlight", icon: "▣", label: "矩形聚光" },
    // { id: "circle-spotlight", icon: "◉", label: "圆形聚光" }
  ]

  // 处理标注工具点击
  const handleAnnotationClick = (toolId: string) => {
    setActiveAnnotation(toolId)
    setCurrentActive(toolId)
    // 这里可以添加标注绘制逻辑
    if (toolId === "sequence") {
      setIsSequenceMode(true)
    } else if (toolId === "arrow") {
      setShowArrow(true)
    }
    setOperationHistory([...operationHistory, {
      type: 'annotation',
      data: { toolId }
    }])
  }



  // 处理聚光灯工具点击
  const handleSpotlightClick = (shape: "rectangle" | "circle") => {
    setActiveAnnotation(`${shape}-spotlight`)
    setSpotlightShape(shape)
    setShowSpotlight(true)
    setCurrentActive('spotlight')
    setOperationHistory([...operationHistory, {
      type: 'spotlight',
      data: { shape }
    }])
  }

  // 应用水印
  const handleApplyWatermark = () => {
    if (watermarkText.trim()) {
      setShowWatermark(true)
      setOperationHistory([...operationHistory, {
        type: 'watermark',
        data: { text: watermarkText }
      }])
    }
  }


  // 添加撤销功能
  const handleUndo = () => {
    if (operationHistory.length > 0) {
      const newHistory = [...operationHistory]
      const lastOperation = newHistory.pop()
      setOperationHistory(newHistory)

      // 根据操作类型执行相应的撤销逻辑
      switch (lastOperation.type) {
        case 'spotlight':
          setShowSpotlight(false)
          break
        case 'watermark':
          setShowWatermark(false)
          break
        case 'annotation':
          if (lastOperation.data.toolId === 'sequence') {
            setIsSequenceMode(false)
          } else if (lastOperation.data.toolId === 'arrow') {
            setShowArrow(false)
          }
          setActiveAnnotation(null)
          break
        // 可以添加更多操作类型的处理
      }
    }
  }

  useEffect(() => {
    // 从存储中加载配置
    const loadConfigs = async () => {
      const configs = await chrome.storage.local.get('bugConfigs')
      if (configs.bugConfigs) {
        setBugConfigs(configs.bugConfigs)
      }
    }
    loadConfigs()
  }, [])
  return (
    <div
      className="annotation-tools-container"
      style={{
        padding: "8px",
        minWidth: "200px"
      }}>
      {/* 工具栏标签页 */}
      <div
        className="tool-tabs"
        style={{
          display: "flex",
          borderBottom: "1px solid #eee",
          marginBottom: "8px"
        }}>
        <button
          className={activeTab === "basic" ? "active" : ""}
          onClick={() => setActiveTab("basic")}
          style={{
            padding: "6px 12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            borderBottom: activeTab === "basic" ? "2px solid #4285f4" : "none",
            color: activeTab === "basic" ? "#4285f4" : "inherit"
          }}>
          基本
        </button>
        <button
          className={activeTab === "bug" ? "active" : ""}
          onClick={() => setActiveTab("bug")}
          style={{
            padding: "6px 12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            borderBottom: activeTab === "bug" ? "2px solid #4285f4" : "none",
            color: activeTab === "bug" ? "#4285f4" : "inherit"
          }}>
          AC
        </button>
        {/* <button 
          className={activeTab === "annotation" ? "active" : ""}
          onClick={() => setActiveTab("annotation")}
          style={{
            padding: "6px 12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            borderBottom: activeTab === "annotation" ? "2px solid #4285f4" : "none",
            color: activeTab === "annotation" ? "#4285f4" : "inherit"
          }}>
          标注
        </button> */}
        <button
          className={activeTab === "spotlight" ? "active" : ""}
          onClick={() => setActiveTab("spotlight")}
          style={{
            padding: "6px 12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            borderBottom: activeTab === "spotlight" ? "2px solid #4285f4" : "none",
            color: activeTab === "spotlight" ? "#4285f4" : "inherit"
          }}>
          聚光灯
        </button>
        <button
          className={activeTab === "watermark" ? "active" : ""}
          onClick={() => setActiveTab("watermark")}
          style={{
            padding: "6px 12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            borderBottom: activeTab === "watermark" ? "2px solid #4285f4" : "none",
            color: activeTab === "watermark" ? "#4285f4" : "inherit"
          }}>
          水印
        </button>
      </div>

      {/* 标签页内容 */}
      <div
        className="tab-content"
        style={{
          padding: "8px 0"
        }}>
        {activeTab === "basic" && (
          <div
            className="basic-tools"
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap"
            }}>
            <button
              onClick={onCapture}
              style={{
                padding: "8px 16px",
                backgroundColor: "#4285f4",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}>
              完成截图
            </button>

            {/* <button 
              onClick={onFullPageMode}
              style={{
                padding: "8px 16px",
                backgroundColor: "#34a853",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}>
              长截图
            </button> */}

            <button
              onClick={handleUndo}
              disabled={operationHistory.length === 0}
              style={{
                padding: "8px 16px",
                backgroundColor: "#757575",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: operationHistory.length === 0 ? "not-allowed" : "pointer",
                opacity: operationHistory.length === 0 ? 0.6 : 1
              }}>
              撤销
            </button>
            <button
              onClick={onCancel}
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

            <button
              onClick={() => {
                // Use chrome.runtime.getURL to get the options page URL
                // const optionsUrl = chrome.runtime.getURL('options.html');
                // // Open in a new tab
                // window.open(optionsUrl, '_blank');
                // 通过消息传递来打开选项页面
                chrome.runtime.sendMessage({ action: "openOptionsPage" });
              }
              }
              style={{
                padding: "8px 16px",
                backgroundColor: "#757575",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}>
              设置
            </button>
          </div>
        )}

        {
          activeTab === "bug" && (
            <div
              className="basic-tools"
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                overflow: "auto",
              }}>
              {bugConfigs.map(config => (
                <button
                  key={config.id}
                  onClick={() => onSubmitBug(config)}
                  style={{
                    padding: "8px",
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                    textAlign: "left",
                    marginBottom: "4px",
                  }}
                >
                  {config.name}
                </button>
              ))}
            </div>
          )
        }
        {activeTab === "annotation" && (
          <div
            className="annotation-tools"
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap"
            }}>
            {annotationTools.map(tool => (
              <button
                key={tool.id}
                className={activeAnnotation === tool.id ? "active" : ""}
                onClick={() => handleAnnotationClick(tool.id)}
                title={tool.label}
                style={{
                  width: "36px",
                  height: "36px",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: activeAnnotation === tool.id ? "#e8f0fe" : "none",
                  border: `1px solid ${activeAnnotation === tool.id ? "#4285f4" : "#ddd"}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                  color: activeAnnotation === tool.id ? "#4285f4" : "inherit"
                }}>
                {tool.icon}
              </button>
            ))}
          </div>
        )}

        {activeTab === "spotlight" && (
          <div
            className="spotlight-tools"
            style={{
              display: "flex",
              gap: "8px",
              flexDirection: "column"
            }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {spotlightTools.map(tool => (
                <button
                  key={tool.id}
                  className={activeAnnotation === tool.id ? "active" : ""}
                  onClick={() => handleSpotlightClick(tool.id.includes("rectangle") ? "rectangle" : "circle")}
                  title={tool.label}
                  style={{
                    width: "36px",
                    height: "36px",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: activeAnnotation === tool.id ? "#e8f0fe" : "none",
                    border: `1px solid ${activeAnnotation === tool.id ? "#4285f4" : "#ddd"}`,
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: activeAnnotation === tool.id ? "#4285f4" : "inherit"
                  }}>
                  {tool.icon}
                </button>
              ))}
            </div>

            <div
              className="opacity-slider"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "8px"
              }}>
              <label style={{ fontSize: "13px" }}>透明度：</label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={spotlightOpacity}
                onChange={(e) => setSpotlightOpacity(parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        )}

        {activeTab === "watermark" && (
          <div
            className="watermark-tools"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="输入水印文字"
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}
            />
            <button
              onClick={handleApplyWatermark}
              style={{
                padding: "8px",
                backgroundColor: "#4285f4",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}>
              应用水印
            </button>
          </div>
        )}
      </div>



      {/* 渲染聚光灯效果 */}
      {showSpotlight && (
        <SpotlightEffect
          isActive={currentActive === "spotlight"}
          selectionArea={selectionArea}
          shape={spotlightShape}
          //   initialPosition={{ x: selectionArea.left, y: selectionArea.top }}
          //   initialSize={{ width: selectionArea.width, height: selectionArea.height }}
          opacity={spotlightOpacity}
          onClose={() => setShowSpotlight(false)}
        />
      )}

      {/* 渲染水印 */}
      {showWatermark && (
        <WatermarkTool
          text={watermarkText}
          selectionArea={selectionArea}
          onClose={() => setShowWatermark(false)}
        />
      )}
      {/* 在选区内绘制序列号 */}
      {isSequenceMode && (
        <SequenceEffect
          isActive={currentActive === "sequence"}
          selectionArea={selectionArea}
          onClose={() => setIsSequenceMode(false)}
        />
      )}

      {/* 添加箭头效果渲染 */}
      {showArrow && (
        <ArrowEffect
          isActive={currentActive === "arrow"}
          selectionArea={selectionArea}
          onClose={() => setShowArrow(false)}
        />
      )}
    </div>
  )
})

export default AnnotationTools