<script setup>
import { ref } from 'vue'
import TopBar      from './components/TopBar.vue'
import Sidebar     from './components/Sidebar.vue'
import CanvasArea  from './components/CanvasArea.vue'
import RightPanels from './components/RightPanels.vue'
import BottomBar   from './components/BottomBar.vue'
import { useGraph }   from './composables/useGraph.js'
import { useAgent }   from './composables/useAgent.js'
import { useMetrics } from './composables/useMetrics.js'
import { executeGraph } from './api/index.js'

const { nodes, edges, applyExecutionResults } = useGraph()
const { messages, sendMessage, pipelineSteps, statusText, logLines } = useAgent(nodes)
const { groups, addGroup, deleteGroup, addMetric, deleteMetric } = useMetrics()

const mobilePanelsOpen = ref(false)

async function onExecute() {
  const results = await executeGraph({ nodes: nodes.value, edges: edges.value })
  applyExecutionResults(results)
}
</script>

<template>
  <TopBar
    project-name="Hypertension Patient Screening"
    point-counter="3,753 / 12,345 pts"
    @logout="console.log('logout')"
  />

  <div
    class="rp-backdrop"
    :style="{ display: mobilePanelsOpen ? 'block' : 'none' }"
    @click="mobilePanelsOpen = false"
  ></div>

  <div class="main-row">
    <Sidebar />

    <div class="workspace">
      <CanvasArea
        v-model:nodes="nodes"
        v-model:edges="edges"
        @execute="onExecute"
        @toggle-mobile-panels="mobilePanelsOpen = !mobilePanelsOpen"
      />

      <RightPanels
        :pipeline-steps="pipelineSteps"
        :status-text="statusText"
        :log-lines="logLines"
        :metric-groups="groups"
        :mobile-open="mobilePanelsOpen"
        :chat-messages="messages"
        @add-group="addGroup"
        @delete-group="deleteGroup"
        @add-metric="addMetric"
        @delete-metric="deleteMetric"
        @chat-send="sendMessage"
      />
    </div>
  </div>

  <BottomBar :active-branches="2" points-used="3,125 / 9 pts" />
</template>
