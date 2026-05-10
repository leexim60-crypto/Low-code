/**
 * 移动组件命令（排序）
 */
export class MoveComponentCommand {
  constructor(store, fromIndex, toIndex) {
    this.store = store
    this.fromIndex = fromIndex
    this.toIndex = toIndex
  }

  execute() {
    const components = this.store.pageConfig.value.components
    if (this.fromIndex < 0 || this.fromIndex >= components.length) return
    if (this.toIndex < 0 || this.toIndex >= components.length) return

    const [item] = components.splice(this.fromIndex, 1)
    components.splice(this.toIndex, 0, item)
  }

  undo() {
    // 反向移动
    const components = this.store.pageConfig.value.components
    const [item] = components.splice(this.toIndex, 1)
    components.splice(this.fromIndex, 0, item)
  }

  /**
   * 合并：连续移动同一组件时，只保留最终位置
   */
  merge(other) {
    if (other instanceof MoveComponentCommand) {
      // 合并：from 取自己的 from，to 取新的 to
      this.toIndex = other.toIndex
      return true
    }
    return false
  }

  serialize() {
    return {
      type: 'moveComponent',
      fromIndex: this.fromIndex,
      toIndex: this.toIndex
    }
  }
}
