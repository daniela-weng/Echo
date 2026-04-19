<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useCohorts } from '../../composables/useCohorts.js'

const props = defineProps({ data: Object })
const { isVisible } = useCohorts()

const BC = { a: '#2563EB', b: '#8E7BE8', c: '#D97706', d: '#0E7490', e: '#BE185D' }
const TC = { a: '#1D4ED8', b: '#6D28D9', c: '#B45309', d: '#0E7490', e: '#9D174D' }
const BG = { a: '#F0F5FF', b: '#FCFAFF', c: '#FFFBEB', d: '#ECFEFF', e: '#FDF2F8' }
const bc = computed(() => BC[props.data.cohort] || BC.a)
const tc = computed(() => TC[props.data.cohort] || TC.a)
const bg = computed(() => BG[props.data.cohort] || BG.a)

// Dim the operator node when its cohort is hidden from comparison panels,
// so every node in a parked subgraph (criteria + operators) reads together.
const cohortVisible = computed(() => isVisible(props.data.cohort))
const rootOpacity   = computed(() => (cohortVisible.value ? 1 : 0.45))
const rootFilter    = computed(() => (cohortVisible.value ? 'none' : 'saturate(0.4)'))
</script>

<template>
  <div :style="`position:relative;opacity:${rootOpacity};filter:${rootFilter};transition:opacity 150ms ease,filter 150ms ease`">
    <Handle type="target" :position="Position.Top" :style="{ background: bc }" />
    <div :style="`background:${bg};border:2px solid ${bc};border-radius:12px;padding:6px 16px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.06);cursor:pointer;min-width:64px`">
      <span :style="`font-size:12px;font-weight:500;color:${tc};line-height:1.3`">{{ data.op }}</span>
      <span :style="`font-size:14px;font-weight:600;color:${tc};line-height:1.3`">{{ data.n }}</span>
    </div>
    <Handle type="source" :position="Position.Bottom" :style="{ background: bc }" />
  </div>
</template>
