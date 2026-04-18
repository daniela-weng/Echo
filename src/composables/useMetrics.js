import { ref } from 'vue'
import { fetchMetrics } from '../api/index.js'

/**
 * Metric shape (N-cohort generalizable):
 *   {
 *     label:  String,
 *     sql:    String,
 *     kind:   'numeric' | 'flag',
 *     values: [String, ...N],   // display per cohort ('63.2', '55%', 'incl', 'n/a', ...)
 *     nums:   [Number, ...N]?,  // numeric values for range computation (numeric only)
 *     // Summary column (last grid column):
 *     delta:  String,           // shown when N === 2: e.g. '−3.4 yrs'
 *     dc:     'd-neg' | 'd-pos' | 'd-nil',  // delta color class (N === 2 only)
 *     // Range strip is derived at render time for N ≥ 3 from nums[].
 *   }
 */
const DEFAULT_GROUPS = [
  {
    name: 'Demographics',
    metrics: [
      { label: 'Avg Age',    sql: "AVG(EXTRACT(year FROM CURRENT_DATE) - year_of_birth)",                                                                        kind: 'numeric', values: ['63.2', '59.8', '66.1'],    nums: [63.2, 59.8, 66.1], unit: ' yrs', delta: '−3.4 yrs', dc: 'd-neg' },
      { label: '% Male',     sql: "100.0 * SUM(CASE WHEN gender_concept_id=8507 THEN 1 ELSE 0 END) / COUNT(*)",                                                  kind: 'numeric', values: ['55%',  '52%',  '58%'],     nums: [55,   52,   58],   unit: '%',    delta: '−3%',      dc: 'd-neg' },
      { label: 'ICU Excl.',  sql: "SUM(CASE WHEN visit_concept_id IN (32037,32036) THEN 1 ELSE 0 END)",                                                           kind: 'flag',    values: ['incl', 'n/a',  'n/a'] },
      { label: 'SBP filter', sql: "SUM(CASE WHEN measurement_concept_id=3004249 AND value_as_number>140 THEN 1 ELSE 0 END)",                                     kind: 'flag',    values: ['n/a',  'incl', 'incl'] },
    ],
  },
  {
    name: 'Comorbidities',
    metrics: [
      { label: 'Diabetes', sql: "100.0 * COUNT(DISTINCT CASE WHEN condition_concept_id IN (201826,4193704) THEN person_id END) / COUNT(DISTINCT person_id)",     kind: 'numeric', values: ['45%', '41%', '0%'],  nums: [45, 41, 0],  unit: '%', delta: '−4%', dc: 'd-neg' },
      { label: 'CKD',      sql: "100.0 * COUNT(DISTINCT CASE WHEN condition_concept_id IN (46271022,4030518) THEN person_id END) / COUNT(DISTINCT person_id)",   kind: 'numeric', values: ['32%', '24%', '29%'], nums: [32, 24, 29], unit: '%', delta: '−8%', dc: 'd-neg' },
      { label: 'HF',       sql: "100.0 * COUNT(DISTINCT CASE WHEN condition_concept_id IN (316139,4229440) THEN person_id END) / COUNT(DISTINCT person_id)",     kind: 'numeric', values: ['18%', '22%', '20%'], nums: [18, 22, 20], unit: '%', delta: '+4%', dc: 'd-pos' },
    ],
  },
]

export function useMetrics() {
  const groups = ref(DEFAULT_GROUPS.map(g => ({
    ...g, metrics: g.metrics.map(m => ({ ...m, values: [...(m.values || [])], nums: m.nums ? [...m.nums] : undefined }))
  })))

  async function loadMetrics(cohortIds) {
    const remote = await fetchMetrics(cohortIds)
    if (remote) groups.value = remote.groups
  }

  // New metric template must carry enough slots to match current cohort count;
  // the editor pads values[] if the user later adds a cohort slot.
  function makeEmptyMetric(n = 2) {
    return {
      label: 'New Metric', sql: 'SELECT ...', kind: 'numeric',
      values: Array(n).fill('—'), nums: Array(n).fill(0), unit: '',
      delta: '—', dc: 'd-nil',
    }
  }

  function addGroup(n = 2) {
    groups.value.push({ name: 'New Group', metrics: [makeEmptyMetric(n)] })
  }
  function deleteGroup(gi) {
    if (groups.value.length > 1) groups.value.splice(gi, 1)
  }
  function addMetric(gi, n = 2) {
    groups.value[gi].metrics.push(makeEmptyMetric(n))
  }
  function deleteMetric(gi, mi) {
    groups.value[gi].metrics.splice(mi, 1)
  }

  return { groups, loadMetrics, addGroup, deleteGroup, addMetric, deleteMetric }
}
