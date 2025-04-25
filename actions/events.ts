

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