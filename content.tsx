import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"


import ScreenshotOverlay from "./components/ScreenshotOverlay"
import runAction from "~utils/action"
import { BG_RUN_ACTION } from "~actions/config"
import GlobalState from "~store/bgglobalstate"
import { feishuBug } from "~flows/feishu"
import { detachDebugger } from "~utils/apis"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const cacheOverflow =  document.body.style.overflow
function ContentScript() {
  const [isScreenshotMode, setIsScreenshotMode] = useState(false)
  const handleScreenshot = async (request, sender, sendResponse) => {
    if (request.name === "processScreenshot") {
      const { dataUrl, area } = request.body
      
      // 创建一个新的 Image 对象来加载截图
      const img = new Image()
      img.src = dataUrl
      
      await new Promise((resolve) => {
        img.onload = () => {
          // 创建 canvas 来裁剪图片
          const canvas = document.createElement("canvas")
          
          // 获取设备像素比
          const devicePixelRatio = window.devicePixelRatio || 1
          
          // 根据设备像素比调整 canvas 尺寸
          canvas.width = area.width * devicePixelRatio
          canvas.height = area.height * devicePixelRatio
          
          const ctx = canvas.getContext("2d")
          
          // 调整绘图比例
          ctx.scale(devicePixelRatio, devicePixelRatio)
          
          // 裁剪指定区域，注意要考虑设备像素比
          ctx.drawImage(
            img,
           (area.left + 1) * devicePixelRatio,
            (area.top + 1) * devicePixelRatio,
            area.width * devicePixelRatio,
            area.height * devicePixelRatio,
            0,
            0,
            area.width,
            area.height
          )
          
    

          // 将图片数据复制到剪贴板
          canvas.toBlob(async (blob) => {
            try {
              const clipboardItem = new ClipboardItem({
                'image/png': blob
              })
              await navigator.clipboard.write([clipboardItem])
              handleSubmitBug()
              console.log('图片已成功复制到剪贴板')
            } catch (err) {
              console.error('复制到剪贴板失败:', err)
            }
          }, 'image/png')
          setIsScreenshotMode(false)
          resolve(true)
        }
      })
      
      sendResponse({ success: true })
    }
  }

  const handleSubmitBug = async () => {
    const bug = await GlobalState.instance.get('bug')
    console.log('bug', bug)
    const { type, command,} = bug
    if (type === 'feishu') {
      let flow = feishuBug(command)
      runAction(flow.datas.nodes, flow.datas.edges)
    } else {
      // 自定义
      try {
        let commandJson = JSON.parse(command)
        const result = await runAction(commandJson.datas.nodes, commandJson.datas.edges)
        console.log('result', result)
      } catch (error) {
        console.log('error', error)
      }
    }
  }
  const handleBgRunActions = async (request, sender, sendResponse) => {
    console.log("request", request)
    if (request.action === BG_RUN_ACTION) {
      const { datas } = request
      const status = await runAction(datas.action.flowData.nodes, datas.action.flowData.edges, datas.nextId, datas.taskId, datas.tabId)
      console.log('status---', status)
      // chrome.debugger.detach({tabId: datas.tabId});
      await detachDebugger(datas.tabId)
    }
  }
  // 处理来自扩展图标的消息
  useEffect(() => {
    const messageListener = (message, sender, sendResponse) => {
      console.log("message", message)
        if (message.action === "startScreenshot") {
            document.body.style.overflow = "hidden"
            setIsScreenshotMode(true)
            sendResponse({ success: true })
            return
        }
        handleScreenshot(message, sender, sendResponse)
        handleBgRunActions(message, sender, sendResponse)
    }
    
    chrome.runtime.onMessage.addListener(messageListener)
    
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])
  

  useEffect(() => {
    if (!isScreenshotMode) {
      document.body.style.overflow = cacheOverflow
    }
  }, [isScreenshotMode])
  return (
    <>
      {/* 右上角截图按钮 */}
      {/* <ScreenshotButton onScreenshot={() => setIsScreenshotMode(true)} /> */}
      
      {/* 截图覆盖层 */}
      {isScreenshotMode && (
        <ScreenshotOverlay onClose={() => setIsScreenshotMode(false)} />
      )}
    </>
  )
}

export default ContentScript