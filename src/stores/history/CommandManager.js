/**
 * 命令管理器 - 实现 Command Pattern 替代全量快照
 * 每个操作记录为一个命令对象，只存储变更差量
 */
export class CommandManager {
  constructor(maxSize = 100) {
    this.undoStack = []
    this.redoStack = []
    this.maxSize = maxSize
  }

  /**
   * 执行命令并推入撤销栈
   * 如果新命令与栈顶命令可合并，则合并而非新增
   */
  execute(command) {
    command.execute()

    // 尝试与栈顶命令合并
    if (this.undoStack.length > 0) {
      const top = this.undoStack[this.undoStack.length - 1]
      if (top.merge && top.merge(command)) {
        // 合并成功，不推入新命令
        this.redoStack = []
        return
      }
    }

    this.undoStack.push(command)
    this.redoStack = []

    // 超出上限时裁剪头部
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift()
    }
  }

  /**
   * 撤销：从撤销栈弹出，执行undo，推入重做栈
   */
  undo() {
    if (this.undoStack.length === 0) return false
    const command = this.undoStack.pop()
    command.undo()
    this.redoStack.push(command)
    return true
  }

  /**
   * 重做：从重做栈弹出，执行execute，推入撤销栈
   */
  redo() {
    if (this.redoStack.length === 0) return false
    const command = this.redoStack.pop()
    command.execute()
    this.undoStack.push(command)
    return true
  }

  canUndo() {
    return this.undoStack.length > 0
  }

  canRedo() {
    return this.redoStack.length > 0
  }

  clear() {
    this.undoStack = []
    this.redoStack = []
  }

  /**
   * 开始批量操作：返回一个 BatchCommand，
   * 后续通过 commit() 将多个命令合并为一个撤销步骤
   */
  beginBatch() {
    return new BatchCommand()
  }
}

/**
 * 批量命令 - 将多个命令包装为一个撤销步骤
 */
export class BatchCommand {
  constructor() {
    this.commands = []
  }

  add(command) {
    this.commands.push(command)
  }

  execute() {
    for (const cmd of this.commands) {
      cmd.execute()
    }
  }

  undo() {
    // 逆序撤销
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo()
    }
  }

  serialize() {
    return {
      type: 'batch',
      commands: this.commands.map(c => c.serialize())
    }
  }
}
