

import GlobalState from "~store/bgglobalstate";

export async function handleRunActions(message) {
	const { request, sendResponse } = message
	const { datas } = request
	const actionData = GlobalState.instance.get('action') || []
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true })

	if (Array.isArray(tabs) && tabs.length && Array.isArray(actionData)) {
		const actionIndex = actionData.findIndex(item => item.taskId === datas.taskId)
		if (datas.status !== 1 ) {
			actionIndex > -1 && actionData.splice(actionIndex, 1, )
			return
		}
		if (actionIndex > -1) {
			actionData.splice(actionIndex, 1, { ...datas, tabId: tabs[0].id, })
		} else {
			actionData.push({ ...datas, tabId: tabs[0].id })
		}
	}
	const result = GlobalState.instance.set('action', actionData)
	sendResponse({ result });
}





export async function handelOpenNewTab(message) {
	const { request, sendResponse } = message
	const { datas } = request
	const openNewTabDatas = GlobalState.instance.get('openNewTab') || []
	const tab = await chrome.tabs.create({
		url: datas.newTabUrl,
		active: true
	});
	openNewTabDatas.push({
		tabId: tab.id,
		action: datas
	})
	GlobalState.instance.set('openNewTab', [...openNewTabDatas])
	sendResponse({ datas });
}

export async function handleDetachBugger(message) {
	const {  sendResponse } = message
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
	chrome.debugger.detach({tabId: tabs[0].id});
	sendResponse({  });
}
export async function simulateClickWithDebugger(message) {
	const { request, sendResponse } = message
	const { datas } = request
	const { selector, tabId, rect } = datas
	// 1. 获取元素位置
	// const script = `document.querySelector("${selector}").getBoundingClientRect()`;
	// const result = await chrome.debugger.sendCommand({tabId: tabId}, "Runtime.evaluate", {
	//   expression: script
	// }) as any;
	
	// const rect = result.result.value;
	const x = rect.left + rect.width / 2;
	const y = rect.top + rect.height / 2;
	
	// 2. 模拟鼠标事件序列
	await chrome.debugger.sendCommand({tabId: tabId}, "Input.dispatchMouseEvent", {
	  type: "mousePressed",
	  x: x,
	  y: y,
	  button: "left",
	  clickCount: 1
	});
	
	await chrome.debugger.sendCommand({tabId: tabId}, "Input.dispatchMouseEvent", {
	  type: "mouseReleased",
	  x: x,
	  y: y,
	  button: "left",
	  clickCount: 1
	});
	sendResponse({  });
}