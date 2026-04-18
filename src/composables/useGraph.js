import { ref } from 'vue'

export function useGraph() {
  const nodes = ref([
    { id: 'db',      type: 'database',  position: { x: 130, y: 10  }, data: { name: 'mimic_iv', count: '12,345' } },
    { id: 'age50',   type: 'criterion', position: { x: 10,  y: 160 }, data: { cohort: 'a', type: 'inclusion', label: 'Age ≥ 50',   concept: 'person.YOB',       domain: 'Person',             n: '8,200',  change: '↓ 34%',            changeColor: '#DC2626' } },
    { id: 'htnA',    type: 'criterion', position: { x: 205, y: 160 }, data: { cohort: 'a', type: 'inclusion', label: 'Hypertension', concept: 'SNOMED: 38341003', domain: 'Condition',          n: '9,100',  change: 'in population',    changeColor: '#94A3B8', warning: 'Largest drop' } },
    { id: 'andA',    type: 'operator',  position: { x: 140, y: 340 }, data: { cohort: 'a', op: 'AND', n: '3,100' } },
    { id: 'exclIcu', type: 'criterion', position: { x: 65,  y: 420 }, data: { cohort: 'a', type: 'exclusion', label: 'Excl. ICU Stay', concept: 'OMOP: 4149943', domain: 'Visit Detail',        n: '1,240',  change: '↓ 60%',            changeColor: '#DC2626' } },
    { id: 'cohortA', type: 'terminal',  position: { x: 75,  y: 580 }, data: { cohort: 'a', label: 'Cohort A: 1,240' } },
    { id: 'age45',   type: 'criterion', position: { x: 490, y: 130 }, data: { cohort: 'b', type: 'inclusion', badge: 'modified', label: 'Age ≥ 45', concept: 'person.YOB', domain: 'Person',   n: '9,800',  change: '+1,600 vs Cohort A', changeColor: '#059669' } },
    { id: 'htnB',    type: 'criterion', position: { x: 375, y: 330 }, data: { cohort: 'b', type: 'inclusion', label: 'Hypertension', concept: 'SNOMED: 38341003', domain: 'Condition',          n: '9,100',  change: 'in population',    changeColor: '#94A3B8' } },
    { id: 'sbp140',  type: 'criterion', position: { x: 575, y: 330 }, data: { cohort: 'b', type: 'inclusion', badge: 'new',      label: 'SBP > 140',  concept: 'SNOMED: 38341003', domain: 'Condition', n: '5,200', change: 'in population', changeColor: '#94A3B8' } },
    { id: 'andB',    type: 'operator',  position: { x: 475, y: 510 }, data: { cohort: 'b', op: 'AND', n: '4,200' } },
    { id: 'exclB',   type: 'criterion', position: { x: 450, y: 595 }, data: { cohort: 'b', type: 'exclusion', label: 'Insufficient Observation Window', concept: 'OMOP: 4214956', domain: 'Observation Period', n: '2,800', change: '↓ 1,400', changeColor: '#DC2626' } },
    { id: 'cohortB', type: 'terminal',  position: { x: 430, y: 755 }, data: { cohort: 'b', label: 'Cohort B: 2,800' } },
  ])

  const edges = ref([
    { id: 'e-db-age50',   source: 'db',      target: 'age50',   sourceHandle: 'src-a', type: 'smoothstep', style: { stroke: '#93C5FD', strokeWidth: 1.6, strokeDasharray: '5 4' } },
    { id: 'e-db-htnA',    source: 'db',      target: 'htnA',    sourceHandle: 'src-a', type: 'smoothstep', style: { stroke: '#93C5FD', strokeWidth: 1.6, strokeDasharray: '5 4' } },
    { id: 'e-age50-andA', source: 'age50',   target: 'andA',    type: 'smoothstep', style: { stroke: '#93C5FD', strokeWidth: 1.6, strokeDasharray: '5 4' } },
    { id: 'e-htnA-andA',  source: 'htnA',    target: 'andA',    type: 'smoothstep', style: { stroke: '#93C5FD', strokeWidth: 1.6, strokeDasharray: '5 4' } },
    { id: 'e-andA-excl',  source: 'andA',    target: 'exclIcu', type: 'smoothstep', style: { stroke: '#93C5FD', strokeWidth: 1.6, strokeDasharray: '5 4' } },
    { id: 'e-excl-cohA',  source: 'exclIcu', target: 'cohortA', type: 'smoothstep', style: { stroke: '#93C5FD', strokeWidth: 1.6, strokeDasharray: '5 4' } },
    { id: 'e-db-age45',   source: 'db',      target: 'age45',   sourceHandle: 'src-b', type: 'bezier',     style: { stroke: '#A78BFA', strokeWidth: 1.6, strokeDasharray: '8 4' } },
    { id: 'e-age45-htnB', source: 'age45',   target: 'htnB',    type: 'smoothstep', style: { stroke: '#A78BFA', strokeWidth: 1.6, strokeDasharray: '5 4' } },
    { id: 'e-age45-sbp',  source: 'age45',   target: 'sbp140',  type: 'smoothstep', style: { stroke: '#A78BFA', strokeWidth: 1.6, strokeDasharray: '5 4' } },
    { id: 'e-htnB-andB',  source: 'htnB',    target: 'andB',    type: 'smoothstep', style: { stroke: '#A78BFA', strokeWidth: 1.6, strokeDasharray: '5 4' } },
    { id: 'e-sbp-andB',   source: 'sbp140',  target: 'andB',    type: 'smoothstep', style: { stroke: '#A78BFA', strokeWidth: 1.6, strokeDasharray: '5 4' } },
    { id: 'e-andB-exclB', source: 'andB',    target: 'exclB',   type: 'smoothstep', style: { stroke: '#A78BFA', strokeWidth: 1.6, strokeDasharray: '5 4' } },
    { id: 'e-exclB-cohB', source: 'exclB',   target: 'cohortB', type: 'smoothstep', style: { stroke: '#C4B5FD', strokeWidth: 1.6, strokeDasharray: '4 4' } },
  ])

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

  return { nodes, edges, applyExecutionResults }
}
