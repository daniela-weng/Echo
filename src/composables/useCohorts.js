import { ref, computed } from 'vue'

/**
 * Shared active-cohorts registry. This is the single source of truth for which
 * cohort slots are currently live in the workspace — every downstream panel
 * (Cohort Overlap, Cohort Profile, UpSet plot, bottom bar counter) reads from
 * here so adding or removing a cohort card propagates to every linked view.
 *
 * Each slot carries: { letter, name, color, size, criteria, visible }.
 * `visible` controls whether the cohort participates in the comparison views —
 * hidden cohorts still render on the canvas (dimmed) but are filtered out of
 * Cohort Overlap, Cohort Profile, and Insights. This lets researchers park a
 * cohort without losing it, so they can focus comparisons on any subset of
 * what is on the canvas.
 *
 * Colors come from the Okabe–Ito accessible palette so the design scales to
 * ≥5 cohorts without the accent colors colliding.
 */
const COLOR_SLOTS = [
  '#2563EB', // A — blue
  '#7C3AED', // B — purple
  '#D97706', // C — amber (Okabe–Ito)
  '#0E7490', // D — teal
  '#BE185D', // E — magenta
]

const DEFAULT_COHORTS = [
  {
    letter: 'A',
    name: 'Cohort A',
    tag: 'Baseline',
    color: COLOR_SLOTS[0],
    size: 1240,
    criteria: ['Age ≥ 50', 'Hypertension', 'NOT ICU Stay'],
    visible: true,
  },
  {
    letter: 'B',
    name: 'Cohort B',
    tag: 'Alternative',
    color: COLOR_SLOTS[1],
    size: 2800,
    criteria: ['Age ≥ 45 [NEW]', 'Hypertension', 'SBP > 140 [NEW]'],
    visible: true,
  },
  {
    letter: 'C',
    name: 'Cohort C',
    tag: 'Strict',
    color: COLOR_SLOTS[2],
    size: 620,
    criteria: ['Age ≥ 50', 'Hypertension', 'SBP > 140', 'NOT T2D [NEW]'],
    visible: true,
  },
]

// Exhaustive intersection counts for the three demo cohorts. For general N, a
// backend execute() would return this structure; here we pre-compute the seven
// non-empty regions so the UpSet panel can render without a server round-trip.
// Constraints: sizes sum to cohort totals (see comments).
//   A = 190 + 550 + 150 + 350 = 1,240 ✓
//   B = 1850 + 550 + 50 + 350 = 2,800 ✓
//   C = 70 + 150 + 50 + 350 =   620 ✓
const DEFAULT_INTERSECTIONS_3 = [
  { sets: [1],       size: 1850 },  // B only
  { sets: [0, 1],    size:  550 },  // A ∩ B (no C)
  { sets: [0, 1, 2], size:  350 },  // A ∩ B ∩ C
  { sets: [0],       size:  190 },  // A only
  { sets: [0, 2],    size:  150 },  // A ∩ C (no B)
  { sets: [2],       size:   70 },  // C only
  { sets: [1, 2],    size:   50 },  // B ∩ C (no A)
]

const cohorts = ref(DEFAULT_COHORTS.map(c => ({ ...c })))
const intersections = ref(DEFAULT_INTERSECTIONS_3.map(i => ({ ...i })))

// Toggle a cohort's visibility by letter (case-insensitive). Hidden cohorts
// are dimmed on the canvas and filtered out of the comparison panels.
function toggleVisibility(letter) {
  const target = String(letter).toUpperCase()
  const c = cohorts.value.find(x => x.letter === target)
  if (c) c.visible = !c.visible
}

// Is a cohort visible? Used by graph nodes to decide whether to dim themselves.
function isVisible(letter) {
  const target = String(letter).toUpperCase()
  const c = cohorts.value.find(x => x.letter === target)
  return c ? c.visible !== false : true
}

export function useCohorts() {
  // Visible cohorts (for comparison panels). Defaults to all cohorts when
  // `visible` has not been explicitly set false.
  const visibleCohorts = computed(() =>
    cohorts.value.filter(c => c.visible !== false)
  )
  // Indices of visible cohorts in the original cohorts array — needed so the
  // precomputed UpSet `intersections.sets` indices can be remapped when some
  // cohorts are hidden.
  const visibleIndices = computed(() =>
    cohorts.value
      .map((c, i) => (c.visible !== false ? i : -1))
      .filter(i => i >= 0)
  )
  // Intersections filtered + remapped for the currently visible subset. When
  // a cohort is hidden, its contribution to every intersection is removed by
  // projecting each original intersection onto the visible indices and
  // collapsing equivalent projections.
  const visibleIntersections = computed(() => {
    const vi = visibleIndices.value
    const newIdx = new Map(vi.map((origIdx, newI) => [origIdx, newI]))
    const acc = new Map()
    for (const row of intersections.value) {
      const projected = row.sets.filter(s => newIdx.has(s)).map(s => newIdx.get(s))
      if (projected.length === 0) continue
      const key = projected.slice().sort((a, b) => a - b).join(',')
      acc.set(key, (acc.get(key) || 0) + row.size)
    }
    return [...acc.entries()].map(([key, size]) => ({
      sets: key.split(',').map(Number),
      size,
    }))
  })

  const activeLetters = computed(() => cohorts.value.map(c => c.letter))
  const activeCount   = computed(() => cohorts.value.length)
  const visibleCount  = computed(() => visibleCohorts.value.length)

  return {
    cohorts,
    intersections,
    visibleCohorts,
    visibleIntersections,
    visibleIndices,
    activeLetters,
    activeCount,
    visibleCount,
    toggleVisibility,
    isVisible,
  }
}
