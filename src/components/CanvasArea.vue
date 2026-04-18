<script setup>
import { ref } from 'vue'
import { VueFlow, Panel } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import DatabaseNode  from './nodes/DatabaseNode.vue'
import CriterionNode from './nodes/CriterionNode.vue'
import OperatorNode  from './nodes/OperatorNode.vue'
import TerminalNode  from './nodes/TerminalNode.vue'

const props = defineProps({
  nodes: Array,
  edges: Array,
})
const emit = defineEmits(['update:nodes', 'update:edges', 'execute'])

const nodeTypes = {
  database:  DatabaseNode,
  criterion: CriterionNode,
  operator:  OperatorNode,
  terminal:  TerminalNode,
}

const sqlOpen         = ref(false)
const sqlActiveCohort = ref('A')
const toolbarDropdown = ref(false)
const mobilePanelsOpen = ref(false)

function toggleSQL()            { sqlOpen.value = !sqlOpen.value }
function toggleToolbarDropdown() { toolbarDropdown.value = !toolbarDropdown.value }

emit('expose', { toggleMobilePanels: () => { mobilePanelsOpen.value = !mobilePanelsOpen.value } })
</script>

<template>
  <div class="canvas-area">
    <!-- Toolbar -->
    <div class="canvas-toolbar">
      <span class="canvas-title">Eligibility Graph Canvas</span>
      <span class="toolbar-sep"></span>

      <!-- Mobile panels button -->
      <button class="btn mobile-panels-btn" @click="$emit('toggleMobilePanels')">
        <span class="material-symbols-outlined">dock_to_right</span>Panels
      </button>

      <!-- Secondary actions (large screens) -->
      <div class="toolbar-secondary">
        <button class="btn"><span class="material-symbols-outlined">refresh</span>Refresh</button>
        <button class="btn"><span class="material-symbols-outlined">create_new_folder</span>Add Criteria</button>
        <button class="btn"><span class="material-symbols-outlined">add</span>AND</button>
        <button class="btn"><span class="material-symbols-outlined">arrow_or_edge</span>OR</button>
        <button class="btn"><span class="material-symbols-outlined">filter_alt</span>At Least</button>
        <button class="btn"><span class="material-symbols-outlined">content_copy</span>Dup.Cohort</button>
      </div>

      <!-- Overflow dropdown (small screens) -->
      <div class="toolbar-more" style="position:relative">
        <button class="btn" @click.stop="toggleToolbarDropdown">
          <span class="material-symbols-outlined">more_horiz</span>
        </button>
        <div class="toolbar-dropdown" :class="{ open: toolbarDropdown }">
          <button class="btn"><span class="material-symbols-outlined">refresh</span>Refresh</button>
          <button class="btn"><span class="material-symbols-outlined">create_new_folder</span>Add Criteria</button>
          <button class="btn"><span class="material-symbols-outlined">add</span>AND</button>
          <button class="btn"><span class="material-symbols-outlined">arrow_or_edge</span>OR</button>
          <button class="btn"><span class="material-symbols-outlined">filter_alt</span>At Least</button>
          <button class="btn"><span class="material-symbols-outlined">content_copy</span>Dup.Cohort</button>
        </div>
      </div>

      <button class="btn" @click="toggleSQL">
        <span class="material-symbols-outlined">terminal</span>SQL
      </button>
      <button class="btn primary" @click="$emit('execute')">
        <span class="material-symbols-outlined">check_circle</span>Execute
      </button>
    </div>

    <!-- Canvas + SQL Drawer -->
    <div class="canvas-sql-wrap">
      <div class="canvas-main">
        <VueFlow
          :nodes="nodes"
          :edges="edges"
          :node-types="nodeTypes"
          :fit-view-on-init="true"
          :min-zoom="0.25"
          :max-zoom="2.5"
          style="width:100%;height:100%;background:#F8FAFC"
          @update:nodes="$emit('update:nodes', $event)"
          @update:edges="$emit('update:edges', $event)"
        >
          <Background variant="dots" :gap="24" :size="1.2" color="#CBD5E1" bg-color="#F8FAFC" />

          <!-- Legend -->
          <Panel position="bottom-right" style="margin:0 10px 10px 0;pointer-events:none">
            <div style="background:rgba(255,255,255,0.96);border:1px solid #DDE2E8;border-radius:12px;padding:10px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);min-width:205px">
              <div style="font-weight:700;font-size:11px;color:#64748B;letter-spacing:0.3px;margin-bottom:7px">LEGEND</div>
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:5px">
                <div style="width:22px;border-top:2px dashed #93C5FD;flex-shrink:0"></div>
                <span style="font-size:11.5px;font-weight:600;color:#1D4ED8">Cohort A</span>
              </div>
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
                <div style="width:22px;border-top:2px dashed #A78BFA;flex-shrink:0"></div>
                <span style="font-size:11.5px;font-weight:600;color:#7C3AED">Cohort B</span>
              </div>
              <div style="border-top:1px solid #F1F5F9;padding-top:6px;display:flex;flex-direction:column;gap:5px">
                <div style="display:flex;gap:8px;align-items:center">
                  <div style="width:11px;height:11px;background:#DCFCE7;border:1.5px solid #AFE7C3;border-radius:2px;flex-shrink:0"></div>
                  <span style="font-size:11.5px;color:#64748B">Inclusion node</span>
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                  <div style="width:11px;height:11px;background:#FEE2E2;border:1.5px solid #FCA5A5;border-radius:2px;flex-shrink:0"></div>
                  <span style="font-size:11.5px;color:#64748B">Exclusion node</span>
                </div>
              </div>
            </div>
          </Panel>
        </VueFlow>
      </div>

      <!-- SQL Console Drawer -->
      <div class="sql-drawer" :class="{ open: sqlOpen }">
        <div class="sql-drawer-header">
          <div class="sql-drawer-title">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l3 2-3 2" stroke="#60A5FA" stroke-width="1.3" stroke-linecap="round"/>
              <path d="M7 8h3" stroke="#60A5FA" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            SQL Console
            <span style="font-size:11px;background:#22C55E;color:#fff;padding:1px 5px;border-radius:8px">Generated</span>
          </div>
          <div class="sql-tabs">
            <button
              class="sql-tab"
              :class="{ active: sqlActiveCohort === 'A' }"
              @click="sqlActiveCohort = 'A'"
            >Cohort A</button>
            <button
              class="sql-tab"
              :class="{ active: sqlActiveCohort === 'B' }"
              @click="sqlActiveCohort = 'B'"
            >Cohort B</button>
            <button class="sql-tab">Logs</button>
          </div>
          <button class="sql-close" @click="toggleSQL">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.3"/>
            </svg>
          </button>
        </div>
        <div class="sql-body">
          <!-- TODO: replace with dynamic SQL from fetchSQL(sqlActiveCohort) -->
          <pre class="sql-code"><span class="sql-cmt">-- Cohort {{ sqlActiveCohort }}: Hypertension Cohort</span>
<span class="sql-kw">SELECT</span> p.person_id, p.gender_concept_id, p.year_of_birth
<span class="sql-kw">FROM</span>   omop.person p
<span class="sql-kw">JOIN</span>   omop.condition_occurrence co
       <span class="sql-kw">ON</span> p.person_id = co.person_id
      <span class="sql-kw">AND</span> co.condition_concept_id = <span class="sql-val">38341003</span>  <span class="sql-cmt">-- Hypertension (SNOMED)</span>
<span class="sql-kw">WHERE</span>  (YEAR(co.condition_start_date) - p.year_of_birth) &gt;= <span class="sql-val">50</span>
<span class="sql-cmt">-- Generated by SQL Agent · OMOP Agent</span></pre>
        </div>
      </div>
    </div>
  </div>
</template>
