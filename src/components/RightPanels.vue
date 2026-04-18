<script setup>
import { ref, computed, nextTick } from 'vue'
import MetricEditorModal from './MetricEditorModal.vue'
import UpSetPlot from './UpSetPlot.vue'
import { useCohorts } from '../composables/useCohorts.js'

// ── Shared cohort registry (single source of truth for every panel below) ──
const { cohorts, intersections } = useCohorts()

// UpSetPlot wants {name, size, color}. cohorts already carries name/size/color.
const overlapCohorts = cohorts
const overlapIntersections = computed(() =>
  [...intersections.value].sort((a, b) => b.size - a.size)
)

// ── N-cohort layout tokens ──
// Four-card columns are too wide for 3+ cohorts at 244px panel width, so we let
// the profile grid be 1-column when N ≥ 3 (stacking the cohort cards) and
// 2-column otherwise. The metric table grid is sized dynamically from N.
const cohortGridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: cohorts.value.length >= 3 ? '1fr' : `repeat(${cohorts.value.length}, 1fr)`,
  gap: '7px',
  paddingBottom: '10px',
}))

// cp-table has fixed 80px metric-label + N value cells + 58px summary column.
const cpTableStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `80px repeat(${cohorts.value.length}, 1fr) 58px`,
  gap: '4px 6px',
  alignItems: 'center',
}))

// Header label for the summary column: "Δ" for pairwise, "Range" for ≥3.
const summaryHeader = computed(() => cohorts.value.length === 2 ? 'Δ' : 'Range')

// Compute a range-strip descriptor for a numeric metric when N ≥ 3.
// Returns { min, max, label, frac } where frac maps the [min..max] window into
// the summary cell as a thin bar (consistent with cp-delta-mag affordance).
function rangeOf(m) {
  if (!m.nums || m.nums.length < 2) return null
  const min = Math.min(...m.nums)
  const max = Math.max(...m.nums)
  const span = Math.max(1e-6, Math.max(...m.nums.map(Math.abs)))
  const frac = Math.min(100, Math.round(((max - min) / span) * 100))
  const unit = m.unit || ''
  const isPct = unit === '%'
  const fmt = v => (isPct ? `${Math.round(v)}` : (Number.isInteger(v) ? `${v}` : v.toFixed(1)))
  return { min, max, label: `${fmt(min)}–${fmt(max)}${unit}`, frac }
}

const props = defineProps({
  pipelineSteps: Array,
  statusText:    String,
  logLines:      Array,
  metricGroups:  Array,
  mobileOpen:    Boolean,
  chatMessages:  Array,
})
const emit = defineEmits([
  'addGroup', 'deleteGroup', 'addMetric', 'deleteMetric', 'chatSend',
  'sqlGenerate', 'sqlSave', 'sqlExecute',
])

// Accordion open state
const open = ref({ console: true, cohortDef: true, compare: false, detail: false, insights: false, chat: true })
function toggle(key) { open.value[key] = !open.value[key] }

// Console — Cohort Definition form state
const cohortShortName = ref('ICU patients with major depressive disorder (MDD)')
const cohortDefinition = ref('ICU patients with major depressive disorder (MDD)')

// Console — SQL text (kept as a plain string for simple editing / syntax rendering)
const sqlText = ref(
`SELECT DISTINCT
  p.person_id
FROM
  omop.person p
WHERE
  p.person_id IN (
    SELECT
      person_id
    FROM
      omop.visit_occurrence
    WHERE
      visit_concept_id = 32037
      -- Intensive Care (OMOP)
  );`
)

// SQL generation status (shown above the code editor)
// tone: 'green' (ready) | 'blue' (running/pulsing) | 'gray' (idle)
const sqlStatus = ref({ tone: 'green', text: 'Generated · SELECT validated against omop.person' })

// Lightweight tokenizer for SQL display (keywords / numbers / comments / strings)
const SQL_KEYWORDS = /\b(SELECT|DISTINCT|FROM|WHERE|IN|AND|OR|NOT|AS|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|LIMIT|HAVING|UNION|INSERT|UPDATE|DELETE|VALUES|INTO|CASE|WHEN|THEN|ELSE|END|IS|NULL|EXISTS|BETWEEN|LIKE)\b/g
function highlightSql(line) {
  // escape first
  let s = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // comments take priority (rest of line)
  s = s.replace(/(--.*)$/g, '<span class="sql-comment">$1</span>')
  // strings
  s = s.replace(/'([^']*)'/g, `<span class="sql-str">'$1'</span>`)
  // numbers
  s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="sql-num">$1</span>')
  // keywords
  s = s.replace(SQL_KEYWORDS, '<span class="sql-kw">$1</span>')
  return s || '&nbsp;'
}

// Chat
const chatInput = ref('')
const chatMsgsEl = ref(null)

async function sendChat() {
  const text = chatInput.value.trim()
  if (!text) return
  emit('chatSend', text)
  chatInput.value = ''
  await nextTick()
  if (chatMsgsEl.value) chatMsgsEl.value.scrollTop = chatMsgsEl.value.scrollHeight
}

const metricEditorOpen = ref(false)
</script>

<template>
  <div class="right-panels" :class="{ 'mobile-open': mobileOpen }">

    <!-- Scrollable accordion stack -->
    <div class="right-panels-scroll">

    <!-- Section 0: Console (Cohort Definition + SQL) -->
    <div class="accordion-item" :class="{ open: open.console }">
      <button class="accordion-header" @click="toggle('console')">
        <span class="material-symbols-outlined acc-icon">terminal</span>
        Console
        <span class="material-symbols-outlined accordion-chevron">chevron_right</span>
      </button>
      <div class="accordion-content">
        <div class="accordion-body">

          <!-- Sub-section: Cohort Definition -->
          <div class="sub-accordion-item" :class="{ open: open.cohortDef }">
            <button class="sub-accordion-header" @click="toggle('cohortDef')">
              <span class="material-symbols-outlined sub-acc-icon">edit</span>
              Cohort Definition
              <span class="material-symbols-outlined sub-accordion-chevron">expand_more</span>
            </button>
            <div class="sub-accordion-content">
              <div class="sub-accordion-body">
                <label class="console-field">
                  <span class="console-field-label">Short Name:</span>
                  <input
                    class="console-field-input"
                    type="text"
                    v-model="cohortShortName"
                    placeholder="Enter a short name…"
                  />
                </label>
                <label class="console-field">
                  <span class="console-field-label">Definition:</span>
                  <textarea
                    class="console-field-textarea"
                    v-model="cohortDefinition"
                    rows="3"
                    placeholder="Describe the cohort…"
                  ></textarea>
                </label>
              </div>
            </div>
          </div>

          <div class="console-divider"></div>

          <!-- Sub-section: SQL -->
          <div class="sub-accordion-item open">
            <div class="sub-accordion-header" style="cursor:default">
              <span class="material-symbols-outlined sub-acc-icon">code</span>
              SQL
              <button class="btn" @click.stop="$emit('sqlGenerate')" style="margin-left:auto" title="Generate SQL">
                <span class="material-symbols-outlined" style="font-size:12px">bolt</span>
                Generate
              </button>
            </div>
            <div class="sub-accordion-content">
              <div class="sub-accordion-body">

                <!-- Generating status -->
                <div class="sql-status">
                  <div class="status-dot" :class="sqlStatus.tone"></div>
                  <span>{{ sqlStatus.text }}</span>
                </div>

                <!-- Code editor -->
                <div class="sql-editor">
                  <ol class="sql-code">
                    <li
                      v-for="(line, i) in sqlText.split('\n')"
                      :key="i"
                      v-html="highlightSql(line)"
                    ></li>
                  </ol>
                </div>

                <!-- Actions -->
                <div class="sql-actions">
                  <button class="btn" @click="$emit('sqlSave')">
                    <span class="material-symbols-outlined" style="font-size:12px">save</span>
                    Save
                  </button>
                  <button class="btn primary" @click="$emit('sqlExecute')">
                    <span class="material-symbols-outlined" style="font-size:12px">play_arrow</span>
                    Execute SQL
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Section 2: Cohort Overlap -->
    <div class="accordion-item" :class="{ open: open.compare }">
      <button class="accordion-header" @click="toggle('compare')">
        <span class="material-symbols-outlined acc-icon">join_inner</span>
        Cohort Overlap
        <span class="material-symbols-outlined accordion-chevron">chevron_right</span>
      </button>
      <div class="accordion-content">
        <!-- Horizontal scroll kicks in only when UpSet needs more width than
             the panel (e.g., N ≥ 3 cohorts with 7 intersection columns). For
             the N = 2 case the SVG fits at 244px and no scroll bar appears. -->
        <div class="accordion-body" style="overflow-x:auto">
          <UpSetPlot
            :cohorts="overlapCohorts"
            :intersections="overlapIntersections"
            :width="244"
            :height="cohorts.length >= 3 ? 176 : 134"
          />
        </div>
      </div>
    </div>

    <!-- Section 3: Cohort Profile -->
    <div class="accordion-item" :class="{ open: open.detail }">
      <button class="accordion-header" @click="toggle('detail')">
        <span class="material-symbols-outlined acc-icon">query_stats</span>
        Cohort Profile
        <span class="material-symbols-outlined accordion-chevron">chevron_right</span>
      </button>
      <div class="accordion-content">
        <div class="accordion-body">
          <!-- Cohort summary cards — N-scalable via cohorts registry -->
          <div class="cp-cohorts" :style="cohortGridStyle">
            <div
              v-for="cohort in cohorts"
              :key="cohort.letter"
              class="cp-cohort"
              :style="{
                background: `${cohort.color}0D`,
                borderColor: `${cohort.color}80`,
                boxShadow: `0 2px 5px ${cohort.color}1F`,
              }"
            >
              <div class="cp-cohort-tag" :style="{ color: cohort.color }">
                {{ cohort.name }} · {{ cohort.tag }}
              </div>
              <div class="cp-cohort-n" :style="{ color: cohort.color }">
                {{ cohort.size.toLocaleString() }}
              </div>
              <div class="cp-cohort-sub">{{ cohort.criteria.length }} criteria</div>
              <ul class="cp-cohort-criteria">
                <li v-for="(crit, ci) in cohort.criteria" :key="ci">
                  <template v-if="crit.endsWith('[NEW]')">
                    {{ crit.replace(' [NEW]', '') }}
                    <span :style="{ background: `${cohort.color}1F`, color: cohort.color, fontSize: '11px', fontWeight: 700, padding: '1px 4px', borderRadius: '3px' }">[NEW]</span>
                  </template>
                  <template v-else>{{ crit }}</template>
                </li>
              </ul>
            </div>
          </div>

          <!-- Metrics table header -->
          <div style="display:flex;align-items:center;padding-bottom:7px;border-bottom:1px solid #F3F4F6;margin-bottom:8px;margin-top:6px">
            <div :style="{ ...cpTableStyle, flex: 1 }">
              <span style="font-size:11px;font-weight:500;color:#9CA3AF;letter-spacing:0.6px;text-transform:uppercase">Metric</span>
              <span
                v-for="cohort in cohorts"
                :key="`hd-${cohort.letter}`"
                :style="{ fontSize: '11px', fontWeight: 700, color: cohort.color, textAlign: 'center', letterSpacing: '0.5px', textTransform: 'uppercase' }"
              >{{ cohort.letter }}</span>
              <span style="font-size:12px;font-weight:600;color:#475569;text-align:right;letter-spacing:0.5px;text-transform:uppercase">{{ summaryHeader }}</span>
            </div>
            <button class="me-edit-btn" @click="metricEditorOpen = true" title="Edit metrics">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5l2 2-6 6H2.5v-2l6-6z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/>
                <path d="M7 3l2 2" stroke="currentColor" stroke-width="1.1"/>
              </svg>
            </button>
          </div>

          <!-- Metrics rows -->
          <template v-for="group in metricGroups" :key="group.name">
            <div class="cp-sec-lbl">{{ group.name }}</div>
            <template v-for="m in group.metrics" :key="m.label">

              <!-- Boolean flag row — chips align under cohort header cells -->
              <div
                v-if="m.kind === 'flag' || m.values?.[0] === 'incl' || m.values?.[0] === 'n/a'"
                :style="{ ...cpTableStyle, marginBottom: '7px' }"
              >
                <span class="m">{{ m.label }}</span>
                <span
                  v-for="(v, vi) in m.values"
                  :key="`f-${vi}`"
                  :class="['cp-flag', v === 'incl' ? 'cp-flag-on' : 'cp-flag-off']"
                  :style="v === 'incl' ? { justifySelf: 'center', background: `${cohorts[vi].color}1F`, color: cohorts[vi].color } : { justifySelf: 'center' }"
                >{{ v === 'incl' ? '✓' : '—' }}</span>
                <span></span>
              </div>

              <!-- Numeric row — per-cohort values in the color of each cohort -->
              <template v-else>
                <div :style="{ ...cpTableStyle, marginBottom: '3px', alignItems: 'start' }">
                  <span class="m" style="padding-top:1px">{{ m.label }}</span>
                  <span
                    v-for="(v, vi) in m.values"
                    :key="`v-${vi}`"
                    :style="{ fontSize: '12px', fontWeight: 700, color: cohorts[vi].color, textAlign: 'center' }"
                  >{{ v }}</span>
                  <div class="cp-delta-cell">
                    <!-- N=2: classic delta badge + magnitude bar -->
                    <template v-if="cohorts.length === 2">
                      <span class="d" :class="m.dc">{{ m.delta }}</span>
                      <div v-if="m.deltaMag" class="cp-delta-mag" :class="m.dc" :style="{ width: m.deltaMag + '%' }"></div>
                    </template>
                    <!-- N≥3: range label + min–max strip (Δ collapses to a spread indicator) -->
                    <template v-else-if="rangeOf(m)">
                      <span class="d d-nil" style="font-size:10px">{{ rangeOf(m).label }}</span>
                      <div class="cp-range-strip" :style="{ width: rangeOf(m).frac + '%' }"></div>
                    </template>
                    <template v-else>
                      <span class="d d-nil">—</span>
                    </template>
                  </div>
                </div>
                <div style="margin-bottom:6px"></div>
              </template>

            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- Section 4: Insights -->
    <div class="accordion-item" :class="{ open: open.insights }">
      <button class="accordion-header" @click="toggle('insights')">
        <span class="material-symbols-outlined acc-icon">lightbulb</span>
        Insights
        <span class="material-symbols-outlined accordion-chevron">chevron_right</span>
      </button>
      <div class="accordion-content">
        <div class="accordion-body">
          <div class="insight-item">
            <div class="insight-icon ii-ok" style="font-weight:700">✓</div>
            <div class="insight-text"><em>Cohort B</em> yields <em>2.3× more patients</em>, sufficient power for age 45–50 subgroup analysis</div>
          </div>
          <div class="insight-item">
            <div class="insight-icon ii-ok" style="font-weight:700">✓</div>
            <div class="insight-text"><em>900 shared patients</em> (~73% of A) support paired sensitivity analysis across cohorts</div>
          </div>
          <div class="insight-item">
            <div class="insight-icon ii-warn">⚠</div>
            <div class="insight-text"><em>SBP&gt;140</em> improves phenotype precision but narrows HTN-stage heterogeneity; verify endpoint homogeneity</div>
          </div>
          <div class="insight-item">
            <div class="insight-icon ii-warn">⚠</div>
            <div class="insight-text">Age relaxation <em>50→45</em> introduces younger patients with lower event rates; watch for effect size dilution</div>
          </div>
          <div class="insight-item">
            <div class="insight-icon ii-tip" style="font-size:12px">➜</div>
            <div class="insight-text"><em>Cohort B</em> criteria align more closely with real-world HTN prevalence (45+), strengthening external validity</div>
          </div>
        </div>
      </div>
    </div>

    </div><!-- /right-panels-scroll -->

    <!-- Criteria Agent — sticky to bottom, always visible -->
    <div class="panel-chat-dock">
      <button class="panel-chat-dock-header" @click="toggle('chat')">
        <span class="material-symbols-outlined acc-icon">smart_toy</span>
        Criteria Agent
        <span class="material-symbols-outlined accordion-chevron" style="margin-left:auto">{{ open.chat ? 'expand_more' : 'expand_less' }}</span>
      </button>
      <div v-show="open.chat" class="panel-chat-msgs" ref="chatMsgsEl">
        <template v-for="(msg, i) in chatMessages" :key="i">
          <div v-if="msg.type === 'agent'" class="msg-agent" style="padding:0 2px">{{ msg.text }}</div>
          <div v-else :class="['msg', msg.type]">{{ msg.text }}</div>
        </template>
      </div>
      <div class="panel-chat-inp">
        <input
          type="text"
          v-model="chatInput"
          placeholder="Ask the criteria agent…"
          @keydown.enter="sendChat"
        />
        <button @click="sendChat">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M12 7H2M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

  </div>

  <!-- Metric Editor Modal -->
  <MetricEditorModal
    v-if="metricEditorOpen"
    :groups="metricGroups"
    @close="metricEditorOpen = false"
    @add-group="$emit('addGroup')"
    @delete-group="gi => $emit('deleteGroup', gi)"
    @add-metric="gi => $emit('addMetric', gi)"
    @delete-metric="(gi, mi) => $emit('deleteMetric', gi, mi)"
  />
</template>
