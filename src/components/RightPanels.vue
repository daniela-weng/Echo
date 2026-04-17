<script setup>
import { ref, nextTick } from 'vue'
import MetricEditorModal from './MetricEditorModal.vue'

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
        <div class="accordion-body">
          <!-- Branch counts -->
          <div class="cmp-row">
            <div style="display:flex;align-items:center">
              <div class="cmp-dot" style="background:#2563EB;border-radius:4.5px"></div>
              <span class="cmp-label">Branch A (Baseline)</span>
            </div>
            <span class="cmp-val" style="color:#2563EB">1,240</span>
          </div>
          <div class="cmp-row">
            <div style="display:flex;align-items:center">
              <div class="cmp-dot" style="background:#7C3AED;border-radius:4.5px"></div>
              <span class="cmp-label">Branch B (Alternative)</span>
            </div>
            <span class="cmp-val" style="color:#7C3AED">2,800</span>
          </div>

          <!-- Venn diagram -->
          <div style="margin-top:8px">
            <svg viewBox="0 0 232 105" width="100%" style="display:block;overflow:visible">
              <circle cx="84"  cy="52" r="44" fill="#3B82F6" fill-opacity="0.85"/>
              <circle cx="148" cy="52" r="44" fill="#7C3AED" fill-opacity="0.85"/>
              <text x="60"  y="46" text-anchor="middle" font-family="inherit" font-size="10" fill="rgba(255,255,255,0.88)">A only</text>
              <text x="65"  y="59" text-anchor="middle" font-family="inherit" font-size="10" font-weight="700" fill="#fff">N = 340</text>
              <text x="116" y="45" text-anchor="middle" font-family="inherit" font-size="10" fill="rgba(255,255,255,0.88)">Shared</text>
              <text x="116" y="59" text-anchor="middle" font-family="inherit" font-size="10" font-weight="700" fill="#fff">N = 900</text>
              <text x="172" y="45" text-anchor="middle" font-family="inherit" font-size="10" fill="rgba(255,255,255,0.88)">B only</text>
              <text x="166" y="59" text-anchor="middle" font-family="inherit" font-size="10" font-weight="700" fill="#fff">N = 1,900</text>
            </svg>
          </div>

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
          <!-- Branch summary cards -->
          <div class="cp-branches">
            <div class="cp-branch a">
              <div class="cp-branch-tag">Branch A · Baseline</div>
              <div class="cp-branch-n">1,240</div>
              <div class="cp-branch-sub">3 criteria</div>
              <ul class="cp-branch-criteria">
                <li>Age ≥ 50</li>
                <li>Hypertension</li>
                <li>NOT ICU Stay</li>
              </ul>
            </div>
            <div class="cp-branch b">
              <div class="cp-branch-tag">Branch B · Alternative</div>
              <div class="cp-branch-n">2,800</div>
              <div class="cp-branch-sub">4 criteria</div>
              <ul class="cp-branch-criteria">
                <li>Age ≥ 45 <span style="background:#EDE9FE;color:#6D28D9;font-size:11px;font-weight:700;padding:1px 4px;border-radius:3px">[NEW]</span></li>
                <li>Hypertension</li>
                <li>SBP &gt; 140 <span style="background:#EDE9FE;color:#6D28D9;font-size:11px;font-weight:700;padding:1px 4px;border-radius:3px">[NEW]</span></li>
              </ul>
            </div>
          </div>

          <!-- Metrics table header -->
          <div style="display:flex;align-items:center;padding-bottom:7px;border-bottom:1px solid #F3F4F6;margin-bottom:8px;margin-top:6px">
            <div class="cp-table" style="flex:1">
              <span style="font-size:11px;font-weight:500;color:#9CA3AF;letter-spacing:0.6px;text-transform:uppercase">Metric</span>
              <span style="font-size:11px;font-weight:700;color:#2563EB;text-align:center;letter-spacing:0.5px;text-transform:uppercase">A</span>
              <span style="font-size:11px;font-weight:700;color:#7C3AED;text-align:center;letter-spacing:0.5px;text-transform:uppercase">B</span>
              <span style="font-size:12px;font-weight:600;color:#475569;text-align:right;letter-spacing:0.5px;text-transform:uppercase">Δ</span>
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

              <!-- Boolean flag row — uses same grid so chips align under A/B headers -->
              <div v-if="m.valA === 'incl' || m.valA === 'n/a'" class="cp-table" style="margin-bottom:7px">
                <span class="m">{{ m.label }}</span>
                <span :class="['cp-flag', m.valA === 'incl' ? 'cp-flag-a' : 'cp-flag-off']" style="justify-self:center">{{ m.valA === 'incl' ? '✓' : '—' }}</span>
                <span :class="['cp-flag', m.valB === 'incl' ? 'cp-flag-b' : 'cp-flag-off']" style="justify-self:center">{{ m.valB === 'incl' ? '✓' : '—' }}</span>
                <span></span>
              </div>

              <!-- Numeric row -->
              <template v-else>
                <div class="cp-table" style="margin-bottom:3px;align-items:start">
                  <span class="m" style="padding-top:1px">{{ m.label }}</span>
                  <span class="a">{{ m.valA }}</span>
                  <span class="b">{{ m.valB }}</span>
                  <div class="cp-delta-cell">
                    <span class="d" :class="m.dc">{{ m.delta }}</span>
                    <div v-if="m.deltaMag" class="cp-delta-mag" :class="m.dc" :style="{ width: m.deltaMag + '%' }"></div>
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
            <div class="insight-text"><em>Branch B</em> yields <em>2.3× more patients</em>, sufficient power for age 45–50 subgroup analysis</div>
          </div>
          <div class="insight-item">
            <div class="insight-icon ii-ok" style="font-weight:700">✓</div>
            <div class="insight-text"><em>900 shared patients</em> (~73% of A) support paired sensitivity analysis across branches</div>
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
            <div class="insight-text"><em>Branch B</em> criteria align more closely with real-world HTN prevalence (45+), strengthening external validity</div>
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
