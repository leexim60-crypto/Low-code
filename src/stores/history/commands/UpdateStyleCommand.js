/**
 * 更新组件样式命令
 * 支持合并：同组件同样式属性500ms内连续修改合并
 */
export class UpdateStyleCommand {
  constructor(store, componentId, styleName, oldValue, newValue) {
    this.store = store
    this.componentId = componentId
    this.styleName = styleName
    this.oldValue = oldValue
    this.newValue = newValue
    this.timestamp = Date.now()
  }

  execute() {
    const comp = this.store.findComponentById(
      this.store.pageConfig.value.components,
      this.componentId
    )
    if (comp) {
      comp.style[this.styleName] = this.newValue
    }
  }

  undo() {
    const comp = this.store.findComponentById(
      this.store.pageConfig.value.components,
      this.componentId
    )
    if (comp) {
      comp.style[this.styleName] = this.oldValue
    }
  }

  merge(other) {
    if (
      other instanceof UpdateStyleCommand &&
      other.componentId === this.componentId &&
      other.styleName === this.styleName &&
      other.timestamp - this.timestamp < 500
    ) {
      this.newValue = other.newValue
      this.timestamp = other.timestamp
      return true
    }
    return false
  }

  serialize() {
    return {
      type: 'updateStyle',
      componentId: this.componentId,
      styleName: this.styleName,
      oldValue: this.oldValue,
      newValue: this.newValue
    }
  }
}
