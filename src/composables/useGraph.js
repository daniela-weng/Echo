import { ref, computed } from 'vue'
import { useCohorts } from './useCohorts.js'

export function useGraph() {
  const { isVisible } = useCohorts()
  const nodes = ref([
    { id: 'db',      type: 'database',  position: { x: 130, y: 10  }, data: { name: 'mimic_iv', count: '12,345' } },

    // ── Cohort A subgraph (blue) ──
    { id: 'age50',   type: 'criterion', position: { x: 10,  y: 160 }, data: { cohort: 'a', type: 'inclusion', label: 'Age ≥ 50',      concept: 'person.YOB',       domain: 'Person',             n: '8,200', change: '↓ 34%',             changeColor: '#DC2626' } },
    { id: 'htnA',    type: 'criterion', position: { x: 205, y: 160 }, data: { cohort: 'a', type: 'inclusion', label: 'Hypertension',  concept: 'SNOMED: 38341003', domain: 'Condition',          n: '9,100', change: 'in population',     changeColor: '#94A3B8', warning: 'Largest drop' } },
    { id: 'andA',    type: 'operator',  position: { x: 140, y: 340 }, data: { cohort: 'a', op: 'AND', n: '3,100' } },
    { id: 'exclIcu', type: 'criterion', position: { x: 65,  y: 420 }, data: { cohort: 'a', type: 'exclusion', label: 'Excl. ICU Stay', concept: 'OMOP: 4149943', domain: 'Visit Detail',        n: '1,240', change: '↓ 60%',             changeColor: '#DC2626' } },
    { id: 'cohortA', type: 'terminal',  position: { x: 75,  y: 580 }, data: { cohort: 'a', label: 'Cohort A: 1,240' } },

    // ── Cohort B subgraph (purple) ──
    { id: 'age45',   type: 'criterion', position: { x: 490, y: 130 }, data: { cohort: 'b', type: 'inclusion', badge: 'modified', label: 'Age ≥ 45',   concept: 'person.YOB',       domain: 'Person',   n: '9,800', change: '+1,600 vs Cohort A', changeColor: '#059669' } },
    { id: 'htnB',    type: 'criterion', position: { x: 375, y: 330 }, data: { cohort: 'b', type: 'inclusion',                    label: 'Hypertension', concept: 'SNOMED: 38341003', domain: 'Condition', n: '9,100', change: 'in population',      changeColor: '#94A3B8' } },
    { id: 'sbp140',  type: 'criterion', position: { x: 575, y: 330 }, data: { cohort: 'b', type: 'inclusion', badge: 'new',      label: 'SBP > 140',  concept: 'SNOMED: 38341003', domain: 'Condition', n: '5,200', change: 'in population',      changeColor: '#94A3B8' } },
    { id: 'andB',    type: 'operator',  position: { x: 475, y: 510 }, data: { cohort: 'b', op: 'AND', n: '4,200' } },
    { id: 'exclB',   type: 'criterion', position: { x: 450, y: 595 }, data: { cohort: 'b', type: 'exclusion', label: 'Insufficient Observation Window', concept: 'OMOP: 4214956', domain: 'Observation Period', n: '2,800', change: '↓ 1,400', changeColor: '#DC2626' } },
    { id: 'cohortB', type: 'terminal',  position: { x: 430, y: 755 }, data: { cohort: 'b', label: 'Cohort B: 2,800' } },

    // ── Cohort C subgraph (amber) — cloned from A with a tighter SBP constraint and T2D exclusion ──
    { id: 'age50C',  type: 'criterion', position: { x: 870,  y: 130 }, data: { cohort: 'c', type: 'inclusion',                    label: 'Age ≥ 50',   concept: 'person.YOB',       domain: 'Person',    n: '8,200', change: 'reused from A',      changeColor: '#94A3B8' } },
    { id: 'htnC',    type: 'criterion', position: { x: 760,  y: 330 }, data: { cohort: 'c', type: 'inclusion',                    label: 'Hypertension', concept: 'SNOMED: 38341003', domain: 'Condition', n: '9,100', change: 'in population',     changeColor: '#94A3B8' } },
    { id: 'sbpC',    type: 'criterion', position: { x: 955,  y: 330 }, data: { cohort: 'c', type: 'inclusion', badge: 'modified', label: 'SBP > 140',  concept: 'SNOMED: 38341003', domain: 'Condition', n: '5,200', change: 'reused from B',      changeColor: '#94A3B8' } },
    { id: 'andC',    type: 'operator',  position: { x: 860,  y: 510 }, data: { cohort: 'c', op: 'AND', n: '1,950' } },
    { id: 'exclT2D', type: 'criterion', position: { x: 835,  y: 595 }, data: { cohort: 'c', type: 'exclusion', badge: 'new',      label: 'Excl. Type 2 Diabetes', concept: 'SNOMED: 44054006', domain: 'Condition', n: '620', change: '↓ 68%', changeColor: '#DC2626' } },
    { id: 'cohortC', type: 'terminal',  position: { x: 810,  y: 755 }, data: { cohort: 'c', label: 'Cohort C: 620' } },
  ])

  // Edge stroke tokens mirror the cohort accent palette defined in useCohorts.js.
  const EDGE_A = { stroke: '#93C5FD', strokeWidth: 1.6, strokeDasharray: '5 4' }
  const EDGE_B = { stroke: '#A78BFA', strokeWidth: 1.6, strokeDasharray: '5 4' }
  const EDGE_C = { stroke: '#F59E0B', strokeWidth: 1.6, strokeDasharray: '5 4' }

  // Tag each edge with its cohort letter so we can dim edges whose cohort is
  // hidden from comparison panels (parallel to how nodes dim themselves).
  const edges = ref([
    // Cohort A
    { id: 'e-db-age50',   source: 'db',      target: 'age50',   sourceHandle: 'src-a', type: 'smoothstep', style: EDGE_A, data: { cohort: 'a' } },
    { id: 'e-db-htnA',    source: 'db',      target: 'htnA',    sourceHandle: 'src-a', type: 'smoothstep', style: EDGE_A, data: { cohort: 'a' } },
    { id: 'e-age50-andA', source: 'age50',   target: 'andA',    type: 'smoothstep', style: EDGE_A, data: { cohort: 'a' } },
    { id: 'e-htnA-andA',  source: 'htnA',    target: 'andA',    type: 'smoothstep', style: EDGE_A, data: { cohort: 'a' } },
    { id: 'e-andA-excl',  source: 'andA',    target: 'exclIcu', type: 'smoothstep', style: EDGE_A, data: { cohort: 'a' } },
    { id: 'e-excl-cohA',  source: 'exclIcu', target: 'cohortA', type: 'smoothstep', style: EDGE_A, data: { cohort: 'a' } },
    // Cohort B
    { id: 'e-db-age45',   source: 'db',      target: 'age45',   sourceHandle: 'src-b', type: 'bezier',     style: { ...EDGE_B, strokeDasharray: '8 4' }, data: { cohort: 'b' } },
    { id: 'e-age45-htnB', source: 'age45',   target: 'htnB',    type: 'smoothstep', style: EDGE_B, data: { cohort: 'b' } },
    { id: 'e-age45-sbp',  source: 'age45',   target: 'sbp140',  type: 'smoothstep', style: EDGE_B, data: { cohort: 'b' } },
    { id: 'e-htnB-andB',  source: 'htnB',    target: 'andB',    type: 'smoothstep', style: EDGE_B, data: { cohort: 'b' } },
    { id: 'e-sbp-andB',   source: 'sbp140',  target: 'andB',    type: 'smoothstep', style: EDGE_B, data: { cohort: 'b' } },
    { id: 'e-andB-exclB', source: 'andB',    target: 'exclB',   type: 'smoothstep', style: EDGE_B, data: { cohort: 'b' } },
    { id: 'e-exclB-cohB', source: 'exclB',   target: 'cohortB', type: 'smoothstep', style: { ...EDGE_B, stroke: '#C4B5FD', strokeDasharray: '4 4' }, data: { cohort: 'b' } },
    // Cohort C — reuses Age ≥ 50 (from A side) and SBP > 140 (from B side), plus new T2D exclusion.
    // Lineage hint: age50 and sbp140 feed both their parent cohorts and Cohort C's AND gate.
    { id: 'e-db-age50C',  source: 'db',      target: 'age50C',  sourceHandle: 'src-c', type: 'bezier',     style: EDGE_C, data: { cohort: 'c' } },
    { id: 'e-db-htnC',    source: 'db',      target: 'htnC',    sourceHandle: 'src-c', type: 'smoothstep', style: EDGE_C, data: { cohort: 'c' } },
    { id: 'e-age50C-andC', source: 'age50C', target: 'andC',    type: 'smoothstep', style: EDGE_C, data: { cohort: 'c' } },
    { id: 'e-htnC-andC',  source: 'htnC',    target: 'andC',    type: 'smoothstep', style: EDGE_C, data: { cohort: 'c' } },
    { id: 'e-sbpC-andC',  source: 'sbpC',    target: 'andC',    type: 'smoothstep', style: EDGE_C, data: { cohort: 'c' } },
    { id: 'e-db-sbpC',    source: 'db',      target: 'sbpC',    sourceHandle: 'src-c', type: 'smoothstep', style: EDGE_C, data: { cohort: 'c' } },
    { id: 'e-andC-exclT2D', source: 'andC',  target: 'exclT2D', type: 'smoothstep', style: EDGE_C, data: { cohort: 'c' } },
    { id: 'e-exclT2D-cohC', source: 'exclT2D', target: 'cohortC', type: 'smoothstep', style: EDGE_C, data: { cohort: 'c' } },
  ])

  // Edges as rendered — hidden cohorts' edges dim so the parked subgraph reads
  // as a coherent, deemphasized unit alongside its dimmed nodes.
  const displayEdges = computed(() =>
    edges.value.map(e => {
      const visible = isVisible(e.data?.cohort)
      return visible ? e : { ...e, style: { ...e.style, opacity: 0.35 } }
    })
  )

  /**
   * Update patient counts after backend execution response.
   * @param {{ nodeId: string, count: number }[]} results
   */
  function applyExecutionResults(results) {
    results.forEach(({ nodeId, count }) => {
      const node = nodes.value.find(n => n.id === nodeId)
      if (node) node.data = { ...node.data, n: count.toLocaleString() }
    })
  }

  return { nodes, edges, displayEdges, applyExecutionResults }
}
