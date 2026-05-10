/**
 * 添加组件命令
 */
export class AddComponentCommand {
  constructor(store, component, parentId, index) {
    this.store = store
    this.component = component
    this.parentId = parentId
    this.index = index
  }

  execute() {
    const targetArray = this.parentId
      ? this._getParentChildren()
      : this.store.pageConfig.value.components

    if (targetArray) {
      if (this.index >= 0) {
        targetArray.splice(this.index, 0, this.component)
      } else {
        targetArray.push(this.component)
      }
      this.store.selectedComponentId.value = this.component.id
    }
  }

  undo() {
    const targetArray = this.parentId
      ? this._getParentChildren()
      : this.store.pageConfig.value.components

    if (targetArray) {
      const idx = targetArray.findIndex(c => c.id === this.component.id)
      if (idx > -1) {
        targetArray.splice(idx, 1)
      }
      if (this.store.selectedComponentId.value === this.component.id) {
        this.store.selectedComponentId.value = null
      }
    }
  }

  _getParentChildren() {
    const parent = this.store.findComponentById(
      this.store.pageConfig.value.components,
      this.parentId
    )
    return parent?.children || null
  }

  serialize() {
    return {
      type: 'addComponent',
      componentId: this.component.id,
      parentId: this.parentId,
      index: this.index
    }
  }
}
