<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps({ data: Object })

const isB         = computed(() => props.data.cohort === 'b')
const borderColor = computed(() => isB.value ? '#8E7BE8' : '#2563EB')
const shadowColor = computed(() => isB.value ? 'rgba(109,40,217,0.08)' : 'rgba(37,99,235,0.08)')
</script>

<template>
  <div style="position:relative">
    <!-- Inclusion / Exclusion badge -->
    <div v-if="data.type === 'inclusion'" style="position:absolute;top:-11px;left:0;background:#DCFCE7;border:1.05px solid #AFE7C3;border-radius:10px;padding:2px 6px;display:flex;gap:4px;align-items:center;white-space:nowrap;z-index:2;pointer-events:none">
      <svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#15803D"/></svg>
      <span style="font-weight:600;font-size:11px;color:#15803D">Inclusion</span>
    </div>
    <div v-else style="position:absolute;top:-11px;left:0;background:#FEE2E2;border:1.05px solid #FCA5A5;border-radius:10px;padding:2px 6px;display:flex;gap:4px;align-items:center;white-space:nowrap;z-index:2;pointer-events:none">
      <svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#DC2626"/></svg>
      <span style="font-weight:600;font-size:11px;color:#DC2626">Exclusion</span>
    </div>

    <!-- Modified / New badge -->
    <div v-if="data.badge === 'modified'" style="position:absolute;top:-11px;right:0;background:#FFF7ED;border:1.05px solid #FDBA74;border-radius:10px;padding:2px 7px;white-space:nowrap;z-index:2;pointer-events:none">
      <span style="font-weight:600;font-size:11px;color:#EA580C">Modified</span>
    </div>
    <div v-else-if="data.badge === 'new'" style="position:absolute;top:-11px;right:0;background:#FFF7ED;border:1.05px solid #FDBA74;border-radius:10px;padding:2px 7px;white-space:nowrap;z-index:2;pointer-events:none">
      <span style="font-weight:600;font-size:10.5px;color:#EA580C">+ new</span>
    </div>

    <Handle type="target" :position="Position.Top" :style="{ background: borderColor, borderColor }" />

    <div :style="`background:#fff;border:2px solid ${borderColor};border-radius:12px;padding:14px 10px;box-shadow:0 1px 4px ${shadowColor};cursor:pointer`">
      <div style="display:flex;flex-direction:column;gap:7px">
        <div style="display:flex;flex-direction:column;gap:3px">
          <span style="font-weight:700;font-size:16px;color:#0F172A;white-space:nowrap">{{ data.label }}</span>
          <span style="font-size:11.5px;white-space:nowrap">
            <span style="color:#2563EB">{{ data.concept }}</span>
            <span style="color:#CBD5E1"> · </span>
            <span style="color:#64748B">{{ data.domain }}</span>
          </span>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <span style="font-weight:600;font-size:14px;color:#1E3A8A">N = {{ data.n }}</span>
          <span :style="`font-weight:700;font-size:14px;color:${data.changeColor}`">{{ data.change }}</span>
          <div v-if="data.warning" style="margin-top:6px;background:#FEF2F2;border:1px solid #FECACA;border-radius:6px;padding:4px 8px;display:flex;gap:5px;align-items:center">
            <span style="font-size:11px;color:#DC2626">⚠</span>
            <span style="font-weight:600;font-size:11px;color:#991B1B">{{ data.warning }}</span>
          </div>
        </div>
      </div>
    </div>

    <Handle type="source" :position="Position.Bottom" :style="{ background: borderColor, borderColor }" />
  </div>
</template>
