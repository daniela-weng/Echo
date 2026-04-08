import { ref } from 'vue'
import { fetchMetrics } from '../api/index.js'

const DEFAULT_GROUPS = [
  {
    name: 'Demographics',
    metrics: [
      { label: 'Avg Age',    sql: "AVG(EXTRACT(year FROM CURRENT_DATE) - year_of_birth)",                                                                       valA: '63.2', valB: '59.8', numA: 63.2, numB: 59.8, delta: '−3.4 yrs', dc: 'd-neg', deltaMag: 0, bar: true  },
      { label: '% Male',     sql: "100.0 * SUM(CASE WHEN gender_concept_id=8507 THEN 1 ELSE 0 END) / COUNT(*)",                                                 valA: '55%',  valB: '52%',  numA: 55,   numB: 52,   delta: '−3%',     dc: 'd-neg', deltaMag: 0, bar: true  },
      { label: 'ICU Excl.',  sql: "SUM(CASE WHEN visit_concept_id IN (32037,32036) THEN 1 ELSE 0 END)",                                                          valA: 'incl', valB: 'n/a',  delta: '—', dc: 'd-nil', deltaMag: 0, bar: false },
      { label: 'SBP filter', sql: "SUM(CASE WHEN measurement_concept_id=3004249 AND value_as_number>140 THEN 1 ELSE 0 END)",                                    valA: 'n/a',  valB: 'incl', delta: '—', dc: 'd-nil', deltaMag: 0, bar: false },
    ],
  },
  {
    name: 'Comorbidities',
    metrics: [
      { label: 'Diabetes', sql: "100.0 * COUNT(DISTINCT CASE WHEN condition_concept_id IN (201826,4193704) THEN person_id END) / COUNT(DISTINCT person_id)",    valA: '45%', valB: '41%', delta: '−4%', dc: 'd-neg', deltaMag: 40, bar: false },
      { label: 'CKD',      sql: "100.0 * COUNT(DISTINCT CASE WHEN condition_concept_id IN (46271022,4030518) THEN person_id END) / COUNT(DISTINCT person_id)",  valA: '32%', valB: '24%', delta: '−8%', dc: 'd-neg', deltaMag: 80, bar: false },
      { label: 'HF',       sql: "100.0 * COUNT(DISTINCT CASE WHEN condition_concept_id IN (316139,4229440) THEN person_id END) / COUNT(DISTINCT person_id)",    valA: '18%', valB: '22%', delta: '+4%', dc: 'd-pos', deltaMag: 40, bar: false },
    ],
  },
]

export function useMetrics() {
  const groups = ref(DEFAULT_GROUPS.map(g => ({
    ...g, metrics: g.metrics.map(m => ({ ...m }))
  })))

  async function loadMetrics(cohortIds) {
    const remote = await fetchMetrics(cohortIds)
    if (remote) groups.value = remote.groups
  }

  function addGroup() {
    groups.value.push({
      name: 'New Group',
      metrics: [{ label: 'New Metric', sql: 'SELECT ...', valA: '—', valB: '—', delta: '—', dc: 'd-nil', bar: false }],
    })
  }

  function deleteGroup(gi) {
    if (groups.value.length > 1) groups.value.splice(gi, 1)
  }

  function addMetric(gi) {
    groups.value[gi].metrics.push({ label: 'New Metric', sql: 'SELECT ...', valA: '—', valB: '—', delta: '—', dc: 'd-nil', bar: false })
  }

  function deleteMetric(gi, mi) {
    groups.value[gi].metrics.splice(mi, 1)
  }

  return { groups, loadMetrics, addGroup, deleteGroup, addMetric, deleteMetric }
}
