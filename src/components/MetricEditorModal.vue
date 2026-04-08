<script setup>
import { ref } from 'vue'

const props = defineProps({ groups: Array })
const emit  = defineEmits(['close', 'addGroup', 'deleteGroup', 'addMetric', 'deleteMetric'])

const expandedSql = ref({}) // key: `${gi}-${mi}`

function toggleSql(gi, mi) {
  const key = `${gi}-${mi}`
  expandedSql.value[key] = !expandedSql.value[key]
}
</script>

<template>
  <div class="me-overlay open" @click.self="$emit('close')">
    <div class="me-modal">
      <div class="me-header">
        <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
          <path d="M8.5 1.5l2 2-6 6H2.5v-2l6-6z" stroke="#2563EB" stroke-width="1.1" stroke-linejoin="round"/>
          <path d="M7 3l2 2" stroke="#2563EB" stroke-width="1.1"/>
        </svg>
        <span class="me-title">Edit Cohort Metrics</span>
        <button class="me-close" @click="$emit('close')">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="me-body">
        <div v-for="(group, gi) in groups" :key="gi" class="me-group">
          <div class="me-group-hd">
            <input
              class="me-group-name"
              :value="group.name"
              @change="group.name = $event.target.value"
            />
            <button class="me-group-del" @click="$emit('deleteGroup', gi)" title="Delete group">×</button>
          </div>

          <div v-for="(m, mi) in group.metrics" :key="mi" class="me-metric-row">
            <input
              class="me-label-inp"
              :value="m.label"
              placeholder="Label"
              @change="m.label = $event.target.value"
            />
            <div class="me-sql-wrap">
              <div v-if="!expandedSql[`${gi}-${mi}`]" class="me-sql-badge" @click="toggleSql(gi, mi)">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4l-2 2 2 2M9 4l2 2-2 2M7 2l-2 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
                <code>{{ m.sql.length > 42 ? m.sql.slice(0, 42) + '…' : m.sql }}</code>
              </div>
              <textarea
                v-else
                class="me-sql-textarea open"
                :value="m.sql"
                rows="3"
                @change="m.sql = $event.target.value"
                @blur="toggleSql(gi, mi)"
              ></textarea>
            </div>
            <button class="me-metric-del" @click="$emit('deleteMetric', gi, mi)" title="Remove">×</button>
          </div>

          <button class="me-add-metric" @click="$emit('addMetric', gi)">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            Add metric
          </button>
        </div>
      </div>

      <div class="me-footer">
        <button class="me-add-group" @click="$emit('addGroup')">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          Add group
        </button>
        <button class="me-save" @click="$emit('close')">Save</button>
      </div>
    </div>
  </div>
</template>
