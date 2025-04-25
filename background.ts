import { sendToContentScript } from "@plasmohq/messaging"
import { ACTICON_MAP } from "~actions"
import { BG_RUN_ACTION } from "~actions/config"
import GlobalState from "~store/bgglobalstate"

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startScreenshot") {
    // 向当前活动标签页发送消息
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "startScreenshot" },
          (response) => {
            sendResponse(response)
          }
        )
      }
    })
    return true // 保持消息通道开放
  }
  
  if (message.action === "captureVisibleTab") {
    captureScreenshot(message.area, sender.tab?.id, sendResponse)
    return true
  }
  
  if (message.action === "captureFullPage") {
    captureFullPage(sender.tab?.id, sendResponse)
    return true
  }
  const action = message.action
  if (typeof ACTICON_MAP[action] === 'function') {
    ACTICON_MAP[action]({ request: message, sender, sendResponse });
    return true
  }
  if (action === "openOptionsPage") {
    chrome.runtime.openOptionsPage();
    return true
  }
})

// 截图功能
async function captureScreenshot(area, tabId, sendResponse) {
  try {
    await new Promise(resolve => setTimeout(resolve, 100))
    // 捕获可见区域
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: "png" })
    // console.error("截图成功:", dataUrl)
    // 发送消息到content script处理截图
    if (tabId) {
      sendToContentScript({
        name: "processScreenshot",
        tabId,
        body: {
          dataUrl,
          area
        }
      })
    }
    
    sendResponse({ success: true, dataUrl })
  } catch (error) {
    console.error("截图失败:", error)
    sendResponse({ success: false, error: error.message })
  }
}

// 长截图功能
async function captureFullPage(tabId, sendResponse) {
  if (!tabId) {
    sendResponse({ success: false, error: "无效的标签页ID" })
    return
  }
  
  try {
    // 获取页面信息
    const pageInfo = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return {
          scrollHeight: document.body.scrollHeight,
          clientHeight: document.documentElement.clientHeight,
          scrollWidth: document.body.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        }
      }
    })
    
    const { scrollHeight, clientHeight } = pageInfo[0].result
    
    // 计算需要截取的次数
    const captureCount = Math.ceil(scrollHeight / clientHeight)
    const screenshots = []
    
    // 保存原始滚动位置
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // window._originalScrollTop = window.scrollY
        return window.scrollY
      }
    })
    
    // 分段截图
    for (let i = 0; i < captureCount; i++) {
      // 滚动到指定位置
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (i, clientHeight) => {
          window.scrollTo(0, i * clientHeight)
          return window.scrollY
        },
        args: [i, clientHeight]
      })
      
      // 等待页面渲染
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 截取当前可见区域
      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: "png" })
      screenshots.push({
        dataUrl,
        position: i * clientHeight
      })
    }
    
    // 恢复原始滚动位置
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // window.scrollTo(0, window._originalScrollTop || 0)
        // delete window._originalScrollTop
      }
    })
    
    // 发送截图数据到content script
    sendToContentScript({
      name: "processFullPageScreenshot",
      tabId,
      body: {
        screenshots,
        pageInfo: pageInfo[0].result
      }
    })
    
    sendResponse({ success: true })
  } catch (error) {
    console.error("长截图失败:", error)
    sendResponse({ success: false, error: error.message })
  }
}



// 监听标签页更新
  chrome.tabs.onUpdated.addListener( async (tabId, changeInfo, tab) => {
    const openNewTabDatas = GlobalState.instance.get('openNewTab') || []
   
    if (changeInfo.status === 'complete' && openNewTabDatas.length > 0) {
      // 标签页已完成加载
     
      let indxflows =  openNewTabDatas.findIndex((item) => item.tabId === tabId)
      console.log('标签页已完成加载:', tab.url, openNewTabDatas, tabId)
      if (indxflows === -1) {
        return
      }
      chrome.tabs.sendMessage(tabId, { action: BG_RUN_ACTION, datas: { ...openNewTabDatas[indxflows], tabId}  }, function (response) {
        console.log(response?.result);
        openNewTabDatas.splice(indxflows, 1)
        GlobalState.instance.set('openNewTab', openNewTabDatas)
        chrome.debugger.attach({tabId: tabId}, "1.3", () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }
        });
      });
    }
  })


  chrome.commands.onCommand.addListener((command) => {
    if (command === "take-screenshot") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startScreenshot" });
      });
    }
  });