<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useCohorts } from '../../composables/useCohorts.js'

const props = defineProps({ data: Object })
const { toggleVisibility, isVisible } = useCohorts()

const BG = {
  a: 'linear-gradient(160deg,#1E293B,#0F172A)',
  b: 'linear-gradient(160deg,#6D28D9,#5B21B6)',
  c: 'linear-gradient(160deg,#B45309,#92400E)',
  d: 'linear-gradient(160deg,#0E7490,#155E75)',
  e: 'linear-gradient(160deg,#9D174D,#831843)',
}
const SH = {
  a: '0 4px 14px rgba(15,23,42,0.35)',
  b: '0 4px 14px rgba(109,40,217,0.4)',
  c: '0 4px 14px rgba(180,83,9,0.4)',
  d: '0 4px 14px rgba(14,116,144,0.4)',
  e: '0 4px 14px rgba(157,23,77,0.4)',
}
const HC = { a: '#2563EB', b: '#8E7BE8', c: '#D97706', d: '#0E7490', e: '#BE185D' }
const bg = computed(() => BG[props.data.cohort] || BG.a)
const sh = computed(() => SH[props.data.cohort] || SH.a)
const hc = computed(() => HC[props.data.cohort] || HC.a)

// Visibility state — when hidden, the pill dims and the dot turns grey.
const visible = computed(() => isVisible(props.data.cohort))
const pillOpacity   = computed(() => (visible.value ? 1    : 0.45))
const pillFilter    = computed(() => (visible.value ? 'none' : 'saturate(0.35)'))
const dotFill       = computed(() => (visible.value ? '#22C55E' : '#94A3B8'))
const titleSuffix   = computed(() => (visible.value
  ? 'Click to hide from comparison panels'
  : 'Hidden from comparison — click to show'))

function onClick() { toggleVisibility(props.data.cohort) }
</script>

<template>
  <div style="position:relative">
    <Handle type="target" :position="Position.Top" :style="{ background: hc }" />
    <div
      :style="`background:${bg};border:1px solid rgba(255,255,255,0.08);border-radius:999px;padding:10px 18px;display:flex;gap:6px;align-items:center;box-shadow:${sh};cursor:pointer;opacity:${pillOpacity};filter:${pillFilter};transition:opacity 150ms ease,filter 150ms ease`"
      :title="titleSuffix"
      role="button"
      tabindex="0"
      @click="onClick"
      @keydown.enter.prevent="onClick"
      @keydown.space.prevent="onClick"
    >
      <svg width="13" height="13" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="6.5" :fill="dotFill"/></svg>
      <span style="font-weight:700;font-size:14px;color:#fff;white-space:nowrap">{{ data.label }}</span>
    </div>
  </div>
</template>
