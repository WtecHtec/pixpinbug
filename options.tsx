import { useEffect, useState } from "react"
import type { PlasmoCSConfig } from "plasmo"

export interface BugConfig {
  id: string
  name: string
  type: 'feishu' | 'custom'
  command: string
}

const Options = () => {
  const [bugConfigs, setBugConfigs] = useState<BugConfig[]>([])
  const [newConfig, setNewConfig] = useState<Partial<BugConfig>>({
    name: '',
    type: 'feishu',
    command: ''
  })

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

  const handleSave = async () => {
    if (!newConfig.name || !newConfig.command) return
    
    const config: BugConfig = {
      id: Date.now().toString(),
      name: newConfig.name,
      type: newConfig.type as 'feishu' | 'custom',
      command: newConfig.command
    }

    const updatedConfigs = [...bugConfigs, config]
    await chrome.storage.local.set({ bugConfigs: updatedConfigs })
    setBugConfigs(updatedConfigs)
    setNewConfig({ name: '', type: 'feishu', command: '' })
  }

  const handleDelete = async (id: string) => {
    const updatedConfigs = bugConfigs.filter(config => config.id !== id)
    await chrome.storage.local.set({ bugConfigs: updatedConfigs })
    setBugConfigs(updatedConfigs)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Bug 提交配置</h2>
      <div> 注意：自定义的情况,需要使用
        <a target="_blank" href="https://chromewebstore.google.com/detail/replaytact-form-automatio/ohkipcncfnmjoeneihmglaadloddopkg?authuser=0&hl=zh-CN">插件</a>
        编辑工作流,复制到命令
     </div>
     <div> 注意: 飞书项目下命令输入缺陷新建页面的URL</div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="配置名称"
          value={newConfig.name}
          onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <select
          value={newConfig.type}
          onChange={(e) => setNewConfig({ ...newConfig, type: e.target.value as 'feishu' | 'custom' })}
          style={{ marginRight: '10px', padding: '5px' }}
        >
          <option value="feishu">飞书项目</option>
          <option value="custom">自定义</option>
        </select>
        <input
          type="text"
          placeholder="命令"
          value={newConfig.command}
          onChange={(e) => setNewConfig({ ...newConfig, command: e.target.value })}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button 
          onClick={handleSave}
          style={{
            padding: '5px 10px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          添加
        </button>
      </div>

      <div>
        {bugConfigs.map(config => (
          <div 
            key={config.id} 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
              border: '1px solid #ddd',
              marginBottom: '10px',
              borderRadius: '4px'
            }}
          >
            <div>
              <strong>{config.id}</strong>
              <span style={{ margin: '0 10px', color: '#666' }}>|</span>
              <strong>{config.name}</strong>
              <span style={{ margin: '0 10px', color: '#666' }}>|</span>
              <span>{config.type === 'feishu' ? '飞书项目' : '自定义'}</span>
              <span style={{ margin: '0 10px', color: '#666' }}>|</span>
              <span style={{
                maxWidth: '40vw',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#666'
              }}>{config.command}</span>
            </div>
            <button
              onClick={() => handleDelete(config.id)}
              style={{
                padding: '5px 10px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Options