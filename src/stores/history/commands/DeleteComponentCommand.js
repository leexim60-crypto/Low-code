/**
 * 删除组件命令
 */
export class DeleteComponentCommand {
  constructor(store, componentId) {
    this.store = store
    this.componentId = componentId
    this.removedComponent = null
    this.parentArray = null
    this.removedIndex = -1
  }

  execute() {
    // 记录删除前的位置信息
    const found = this.store.findParentArray(
      this.store.pageConfig.value.components,
      this.componentId
    )
    if (!found) return

    this.parentArray = found.parent
    this.removedIndex = found.index
    this.removedComponent = found.parent[found.index]

    found.parent.splice(found.index, 1)

    if (this.store.selectedComponentId.value === this.componentId) {
      this.store.selectedComponentId.value = null
    }
  }

  undo() {
    if (this.removedComponent && this.parentArray) {
      this.parentArray.splice(this.removedIndex, 0, this.removedComponent)
    }
  }

  serialize() {
    return {
      type: 'deleteComponent',
      componentId: this.componentId
    }
  }
}
