<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Array of { name, size, color }
  cohorts: { type: Array, required: true },
  // Array of { sets: [indices into cohorts], size }. Ideally pre-sorted by size desc.
  intersections: { type: Array, required: true },
  // Layout
  width:  { type: Number, default: 244 },
  height: { type: Number, default: 134 },
})

// ---- Layout constants tuned to the right-panel design system ----
// Designed for natural-size rendering inside an accordion body of 244px inner width,
// so SVG pixels == CSS pixels and text renders at its declared font-size.
const NAME_X   = 0           // cohort name starts at left edge
const NAME_W   = 56          // "Cohort A" at 11px weight 500 fits in 56px
const COUNT_X  = NAME_W + 36 // right-edge of the count number (right-aligned)
const BAR_X0   = COUNT_X + 5 // bar track starts
const BAR_W    = 38          // max set-size bar width
const BAR_X1   = BAR_X0 + BAR_W   // bar track ends (bars are right-justified toward matrix)
const MATRIX_X0 = BAR_X1 + 12     // matrix columns begin (leaves air before the dots)

const INTER_TOP = 12         // top padding for the intersection count labels
const LABEL_H   = 14         // count label line height (12px font + small baseline room)
const BAR_AREA_H = 42        // vertical room reserved for intersection bars themselves
const MATRIX_Y0 = INTER_TOP + LABEL_H + BAR_AREA_H + 10  // where matrix rows start
const ROW_H     = 28
const DOT_R     = 5          // 10px diameter, slightly larger to match bumped text

const DOT_OFF_FILL   = '#E5E7EB'
const DOT_OFF_STROKE = '#CBD5E1'
const CONNECT_STROKE = '#475569'
const INTER_BAR_FILL = '#64748B'
const BAR_TRACK_FILL = '#F1F5F9'

// Minimum horizontal distance between intersection-column centers. 28px gives
// the widest 12px count label (≈24px for "1,850") a 4px breathing gap and
// leaves 18px of clear space between 10px-diameter dots.
const MIN_COL_STEP = 28
const COL_EDGE_RIGHT = 22
const COL_EDGE_LEFT  = 16

const layout = computed(() => {
  const { cohorts, intersections, width } = props

  const N = Math.max(1, intersections.length)
  // Widen the SVG if the caller-provided width can't fit N columns at
  // MIN_COL_STEP — the accordion body enables horizontal scroll when this
  // exceeds the panel's inner width (scales cleanly to any N).
  const minContentW = MATRIX_X0 + COL_EDGE_LEFT + (N - 1) * MIN_COL_STEP + COL_EDGE_RIGHT
  const svgW = Math.max(width, minContentW)
  const firstX = MATRIX_X0 + COL_EDGE_LEFT
  const lastX  = svgW - COL_EDGE_RIGHT
  const step   = N > 1 ? (lastX - firstX) / (N - 1) : 0

  const maxSize  = Math.max(1, ...cohorts.map(c => c.size))
  const maxInter = Math.max(1, ...intersections.map(i => i.size))

  const rows = cohorts.map((c, i) => {
    const y = MATRIX_Y0 + ROW_H * i + ROW_H / 2
    const w = (c.size / maxSize) * BAR_W
    return {
      ...c,
      idx: i,
      y,
      barW: w,
      barX: BAR_X1 - w,    // right-justified toward matrix
    }
  })

  const cols = intersections.map((inter, j) => {
    const x = N > 1 ? firstX + step * j : (firstX + lastX) / 2
    const h = (inter.size / maxInter) * BAR_AREA_H
    const barY = INTER_TOP + LABEL_H + (BAR_AREA_H - h)
    return { ...inter, idx: j, x, h, barY }
  })

  return { rows, cols, svgW }
})

const fmt = n => n.toLocaleString()
</script>

<template>
  <svg
    :viewBox="`0 0 ${layout.svgW} ${height}`"
    :width="layout.svgW"
    :height="height"
    :style="{ display: 'block', overflow: 'visible' }"
    role="img"
    aria-label="UpSet plot of cohort overlap"
  >
    <!-- =============== Intersection-size bars (top) =============== -->
    <g v-for="col in layout.cols" :key="`ibar-${col.idx}`">
      <text
        :x="col.x"
        :y="INTER_TOP + 10"
        text-anchor="middle"
        font-size="12"
        font-weight="600"
        fill="#334155"
      >{{ fmt(col.size) }}</text>
      <rect
        :x="col.x - 5"
        :y="col.barY"
        width="10"
        :height="col.h"
        :fill="INTER_BAR_FILL"
        rx="1.5"
      />
    </g>

    <!-- =============== Divider between top bars and matrix =============== -->
    <line
      :x1="NAME_X"
      :y1="MATRIX_Y0 - 6"
      :x2="layout.svgW"
      :y2="MATRIX_Y0 - 6"
      stroke="#E5E7EB"
      stroke-width="1"
    />

    <!-- =============== Cohort rows (name + count + set-size bar + dots) =============== -->
    <g v-for="row in layout.rows" :key="`row-${row.idx}`">
      <!-- Cohort name: matches .cp-table .m (metric label style "Avg Age", "% Male") -->
      <text
        :x="NAME_X"
        :y="row.y + 4"
        font-size="11"
        font-weight="500"
        fill="#1F2937"
      >{{ row.name }}</text>

      <!-- Count: matches .cp-table .a/.b (12px, bold, cohort-colored) -->
      <text
        :x="COUNT_X"
        :y="row.y + 4"
        text-anchor="end"
        font-size="12"
        font-weight="700"
        :fill="row.color"
      >{{ fmt(row.size) }}</text>

      <!-- Set-size bar track (subtle, shows scale context) -->
      <rect
        :x="BAR_X0"
        :y="row.y - 4"
        :width="BAR_W"
        height="8"
        :fill="BAR_TRACK_FILL"
        rx="1.5"
      />
      <!-- Set-size bar (right-justified toward matrix, classic UpSet convention) -->
      <rect
        :x="row.barX"
        :y="row.y - 4"
        :width="row.barW"
        height="8"
        :fill="row.color"
        fill-opacity="0.9"
        rx="1.5"
      />
    </g>

    <!-- =============== Matrix: connector lines + dots =============== -->
    <g v-for="col in layout.cols" :key="`mtx-${col.idx}`">
      <line
        v-if="col.sets.length > 1"
        :x1="col.x"
        :y1="layout.rows[Math.min(...col.sets)].y"
        :x2="col.x"
        :y2="layout.rows[Math.max(...col.sets)].y"
        :stroke="CONNECT_STROKE"
        stroke-width="1.6"
        stroke-linecap="round"
      />
      <circle
        v-for="row in layout.rows"
        :key="`d-${col.idx}-${row.idx}`"
        :cx="col.x"
        :cy="row.y"
        :r="DOT_R"
        :fill="col.sets.includes(row.idx) ? row.color : DOT_OFF_FILL"
        :stroke="col.sets.includes(row.idx) ? row.color : DOT_OFF_STROKE"
        stroke-width="1"
      />
    </g>
  </svg>
</template>
