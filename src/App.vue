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
import { useCohorts } from './composables/useCohorts.js'
import { executeGraph } from './api/index.js'

const { nodes, edges, displayEdges, applyExecutionResults } = useGraph()
const { messages, sendMessage, pipelineSteps, statusText, logLines } = useAgent(nodes)
const { groups, addGroup, deleteGroup, addMetric, deleteMetric } = useMetrics()
const { activeCount } = useCohorts()

const mobilePanelsOpen = ref(false)

async function onExecute() {
  const results = await executeGraph({ nodes: nodes.value, edges: edges.value })
  applyExecutionResults(results)
}

// Edges are presented through a dimming wrapper (displayEdges) but any
// structural updates from the canvas still need to land on the source array.
function onEdgesUpdate(next) { edges.value = next }
</script>

<template>
  <TopBar
    project-name="Hypertension Patient Screening"
    point-counter="3,210 / 12,345 pts"
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
        :edges="displayEdges"
        @update:edges="onEdgesUpdate"
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

  <BottomBar :active-cohorts="activeCount" points-used="3,125 / 9 pts" />
</template>
