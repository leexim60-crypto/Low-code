/**
 * 更新组件属性命令
 * 支持合并：同组件同属性500ms内连续修改合并
 */
export class UpdatePropsCommand {
  constructor(store, componentId, propName, oldValue, newValue) {
    this.store = store
    this.componentId = componentId
    this.propName = propName
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
      comp.props[this.propName] = this.newValue
    }
  }

  undo() {
    const comp = this.store.findComponentById(
      this.store.pageConfig.value.components,
      this.componentId
    )
    if (comp) {
      comp.props[this.propName] = this.oldValue
    }
  }

  /**
   * 合并条件：同组件、同属性、500ms内
   * 合并后：oldValue 保留最初的，newValue 取最新的
   */
  merge(other) {
    if (
      other instanceof UpdatePropsCommand &&
      other.componentId === this.componentId &&
      other.propName === this.propName &&
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
      type: 'updateProps',
      componentId: this.componentId,
      propName: this.propName,
      oldValue: this.oldValue,
      newValue: this.newValue
    }
  }
}
