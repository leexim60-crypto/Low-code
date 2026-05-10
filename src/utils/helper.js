// 生成唯一ID
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 深拷贝
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// 下载JSON文件
export function downloadJSON(json, filename = 'page.json') {
  const dataStr = JSON.stringify(json, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  const exportFileDefaultName = filename
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  document.body.appendChild(linkElement)
  linkElement.click()
  document.body.removeChild(linkElement)
}

// 读取本地JSON文件
export function readLocalJSON() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result)
          resolve(json)
        } catch (err) {
          reject(new Error('Invalid JSON file'))
        }
      }
      reader.readAsText(file)
    }
    input.click()
  })
}

// 保存到本地存储
export function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
    return false
  }
}

// 从本地存储读取
export function loadFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
    return null
  }
}
