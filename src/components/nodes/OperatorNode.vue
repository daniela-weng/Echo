<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps({ data: Object })

const isB    = computed(() => props.data.cohort === 'b')
const bc     = computed(() => isB.value ? '#8E7BE8' : '#2563EB')
const tc     = computed(() => isB.value ? '#6D28D9' : '#1D4ED8')
const bg     = computed(() => isB.value ? '#FCFAFF' : '#F0F5FF')
</script>

<template>
  <div style="position:relative">
    <Handle type="target" :position="Position.Top" :style="{ background: bc }" />
    <div :style="`background:${bg};border:2px solid ${bc};border-radius:12px;padding:6px 16px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.06);cursor:pointer;min-width:64px`">
      <span :style="`font-size:12px;font-weight:500;color:${tc};line-height:1.3`">{{ data.op }}</span>
      <span :style="`font-size:14px;font-weight:600;color:${tc};line-height:1.3`">{{ data.n }}</span>
    </div>
    <Handle type="source" :position="Position.Bottom" :style="{ background: bc }" />
  </div>
</template>
