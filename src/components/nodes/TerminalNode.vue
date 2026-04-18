<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps({ data: Object })

const isB = computed(() => props.data.cohort === 'b')
const bg  = computed(() => isB.value ? 'linear-gradient(160deg,#6D28D9,#5B21B6)' : 'linear-gradient(160deg,#1E293B,#0F172A)')
const sh  = computed(() => isB.value ? '0 4px 14px rgba(109,40,217,0.4)' : '0 4px 14px rgba(15,23,42,0.35)')
const hc  = computed(() => isB.value ? '#8E7BE8' : '#2563EB')
</script>

<template>
  <div style="position:relative">
    <Handle type="target" :position="Position.Top" :style="{ background: hc }" />
    <div :style="`background:${bg};border:1px solid rgba(255,255,255,0.08);border-radius:999px;padding:10px 18px;display:flex;gap:6px;align-items:center;box-shadow:${sh};cursor:pointer`">
      <svg width="13" height="13" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="6.5" fill="#22C55E"/></svg>
      <span style="font-weight:700;font-size:14px;color:#fff;white-space:nowrap">{{ data.label }}</span>
    </div>
  </div>
</template>
