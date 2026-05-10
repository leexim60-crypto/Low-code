<template>
  <div class="editor-container">
    <Toolbar />
    <div class="editor-main">
      <LeftPanel />
      <Canvas />
      <RightPanel />
    </div>
  </div>
</template>

<script setup>
import Toolbar from '../components/layout/Toolbar.vue'
import LeftPanel from '../components/layout/LeftPanel.vue'
import Canvas from '../components/layout/Canvas.vue'
import RightPanel from '../components/layout/RightPanel.vue'
</script>

<style scoped>
.editor-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f2f5;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
