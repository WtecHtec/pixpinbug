import { openNewTab, runActions, simulateClickWithDebugger } from "~utils/apis"
import { uuid } from "~utils/utils"


function getDom(selector, timeout = 1000, frequency = 10) {
    let current = 0
    return new Promise((resolve) => {
        const findEl = () => {
            current = current + 1
            console.log('current --- selector', selector, current)
            // const elDom = document.querySelector(selector)
            const elDom = document.evaluate(selector, document).iterateNext()
            if (elDom) {
                resolve(elDom)
                return
            }
            if (current > frequency) {
                console.log(`重复${frequency}次,没有找到`)
                resolve('')
                return
            }
            setTimeout(() => {
                findEl()
            }, timeout)
        }
        findEl()
    })
}

function requestAnimationFrameFn(fn) {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            fn()
            resolve(1)
        })
    })
}
async function handleClick(data, tabId) {
    const { xPath } = data
    const el = await getDom(xPath) as any;
    if (el) {
        try {
            el.focus()
            await requestAnimationFrameFn(async () => {
                var event = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
                el.dispatchEvent(event);
                el.click()
                
            })
            const rect = el.getBoundingClientRect();
            await simulateClickWithDebugger( {
                rect,
                tabId
            })
        } catch (error) {
            return 0
        }
        return 1
    }
    return -1
}

async function handleInput(data) {
    const { xPath, inputValue, useFaker, fakerType, fakerLocale } = data
    const el = await getDom(xPath) as any;
    if (el) {
        try {
            el.focus()
            await requestAnimationFrameFn(() => {
                console.log('inputValue', inputValue)


                let value = inputValue



                console.log('handleInput value====', value)
                el.value = value
                var event = new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                    data: inputValue
                });
                el.dispatchEvent(event);
            })
        } catch (error) {
            return 0
        }
        return 1
    }
    return -1
}

async function delay(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(1)
        }, time)
    })
}

async function handleKeyDownEvent(data) {
    const { xPath, inputValue } = data
    const el = await getDom(xPath) as any;
    if (el) {
        try {
            el.focus()
            await requestAnimationFrameFn(() => {
                el.dispatchEvent(new KeyboardEvent('keydown', {
                    keyCode: Number(inputValue),
                    bubbles: true,
                    cancelable: true
                }))
            })
        } catch (error) {
            return 0
        }
        return 1
    }
    return -1
}


const waitTime = (delay) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(1)
        }, delay || 1000)
    })
}
const handleSelect = async (data) => {
    const { xPath, inputValue } = data
    const el = await getDom(xPath) as any;
    if (el) {
        try {
            el.focus()
            await requestAnimationFrameFn(async () => {
                el.dispatchEvent(new KeyboardEvent('keydown', {
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true
                }))
                await waitTime(1000)
                el.dispatchEvent(new KeyboardEvent('keydown', {
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true
                }))
                console.log('inputValue 回车2')

            })

        } catch (error) {
            return 0
        }
        return 1
    }
    return -1
}


async function handlePaste() {
    try {
        console.log('粘贴操作开始');
        await requestAnimationFrameFn(async () => {
            // 创建并触发粘贴事件
            // const pasteEvent = new ClipboardEvent('paste', {
            //     bubbles: true,
            //     cancelable: true,
            //     // 创建 DataTransfer 对象
            //     clipboardData: new DataTransfer()
            // });
            
            // // 在活动元素上触发粘贴事件
            // document.activeElement.dispatchEvent(pasteEvent);
 console.log('粘贴操作dom',  document.activeElement);
             // 2. 检查剪贴板是否包含图片
             // 获取剪贴板数据
             const clipboardItems = await navigator.clipboard.read();
             for (const clipboardItem of clipboardItems) {
                // 检查是否包含图片类型
                const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
                console.log('粘贴操作开始',  document.activeElement, clipboardItem);

                if (imageTypes.length > 0) {
                    // 获取图片数据
                    const blob = await clipboardItem.getType(imageTypes[0]);
                    
                    // const blob = await item.getType(type);
      const file = new File([blob], 'pasted-image.png', { type: blob.type });

      // 3. 创建一个 ClipboardEvent 并附加文件数据
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true,
      });

      // 4. 触发粘贴事件
      document.dispatchEvent(pasteEvent);
     document.activeElement.dispatchEvent(pasteEvent);
      window.dispatchEvent(pasteEvent);
      console.log('粘贴事件已触发');
                   
                    break;
                }
            }
              // 创建 DataTransfer 对象
            // const dataTransfer = new DataTransfer();
            
            // // 创建粘贴事件
            // const pasteEvent = new ClipboardEvent('paste', {
            //     bubbles: true,
            //     cancelable: true,
            //     clipboardData: dataTransfer
            // });
            // console.log('粘贴操作开始' ,  document.activeElement);
            // // 在当前焦点元素上触发粘贴事件
            // document.activeElement.dispatchEvent(pasteEvent);
        });
        return 1;
    } catch (error) {
        console.error('粘贴操作失败:', error);
        return 0;
    }
}



const HANDEL_TYPE_EVENT = {
    'click': handleClick,
    'input': handleInput,
    'keydownevent': handleKeyDownEvent,
    'select': handleSelect,
    'paste': handlePaste,
}

async function runAction(nodes, edges, startSource = 'start', taskId = '', tabId = '') {
    if (!Array.isArray(nodes) || !Array.isArray(edges)) return
    const cpNode = JSON.parse(JSON.stringify(nodes))
    const endId = 'end'
    return new Promise(async (resolve) => {
        // 单个链表
        let currentEdge = edges.find(item => item.source === startSource)

        if (!currentEdge) return
        if (startSource === 'start') {
            taskId = uuid()
            // 新开页面
            let currentNode = cpNode.find(item => item.id === startSource)
            if (currentNode.data.newtab === '1') {
                currentNode.data.newtab = '0'
                await openNewTab(taskId, { nodes: cpNode, edges }, currentNode.data.newtaburl, 'start', 1, new Date().getTime())
                return
            }
        }
        let currentNode = nodes.find(item => item.id === currentEdge.target)
        let status = 1
        while (currentEdge && currentNode) {
            console.log('currentEdge', currentEdge, currentNode)
            const { data, id } = currentNode
            if (id === endId) {
               
                await waitTime(2000)
 
                await handlePaste()
                console.log('粘贴成功')
                resolve(1)
                return
            }
            const { handleType } = data
            if (typeof HANDEL_TYPE_EVENT[handleType] === 'function') {
                //   await runActions(taskId,  currentEdge.target, 1, { nodes, edges }, new Date().getTime())
                // 1: 正常  -1: 未找到DOM 0: 处理失败
                status = await HANDEL_TYPE_EVENT[handleType](data, tabId)
                if ([0, -1].includes(status)) {
                    resolve(status)
                    break
                }
            }
            await delay(1000)
            currentEdge = edges.find(item => item.source === currentEdge.target)
            if (currentEdge) {
                currentNode = nodes.find(item => item.id === currentEdge.target)
            }
        }
        resolve(1)
    })
}

export default runAction