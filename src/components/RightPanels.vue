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
])

// Accordion open state
const open = ref({ cohort: true, compare: false, detail: false, insights: false, chat: true })
function toggle(key) { open.value[key] = !open.value[key] }

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

    <!-- Section 1: Cohort Analysis -->
    <div class="accordion-item" :class="{ open: open.cohort }">
      <button class="accordion-header" @click="toggle('cohort')">
        <span class="material-symbols-outlined acc-icon">account_tree</span>
        Cohort Analysis
        <span class="material-symbols-outlined accordion-chevron">chevron_right</span>
      </button>
      <div class="accordion-content">
        <div class="accordion-body">
          <div class="agent-pipeline">
            <template v-for="(step, i) in pipelineSteps" :key="step.id">
              <div class="agent-node">
                <div class="agent-circle" :class="step.status">{{ step.label[0] }}</div>
                <div class="agent-label">{{ step.label }}</div>
              </div>
              <div v-if="i < pipelineSteps.length - 1" class="agent-arrow">→</div>
            </template>
          </div>
          <div class="agent-status-bar">
            <div class="status-dot blue"></div>
            {{ statusText }}
          </div>
          <div class="agent-log">{{ logLines.join('\n') }}</div>
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

          <!-- Sankey Branch A -->
          <div class="cp-sec-lbl">Criteria Flow</div>
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
            <div style="width:9px;height:9px;border-radius:50%;background:#2563EB;flex-shrink:0"></div>
            <span style="font-size:11px;color:#475569;font-weight:500">Branch A</span>
          </div>
          <svg viewBox="0 0 210 145" width="100%" style="display:block;overflow:visible" font-family="inherit">
            <defs>
              <linearGradient id="sk-a-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stop-color="#93C5FD" stop-opacity="0.55"/>
                <stop offset="100%" stop-color="#BFDBFE" stop-opacity="0.4"/>
              </linearGradient>
            </defs>
            <path d="M 13,28 C 56,28 56,28 99,28 L 99,51 C 56,51 56,51 13,51 Z" fill="url(#sk-a-blue)"/>
            <path d="M 13,51 C 56,51 56,59 99,59 L 99,126 C 56,126 56,118 13,118 Z" fill="#E2E8F0" opacity="0.8"/>
            <path d="M 107,28 C 150,28 150,28 193,28 L 193,37 C 150,37 150,37 107,37 Z" fill="url(#sk-a-blue)"/>
            <path d="M 107,37 C 150,37 150,43 193,43 L 193,57 C 150,57 150,51 107,51 Z" fill="#E2E8F0" opacity="0.8"/>
            <rect x="5"   y="28" width="8" height="90" fill="#2563EB" rx="1.5"/>
            <rect x="99"  y="28" width="8" height="23" fill="#2563EB" rx="1.5"/>
            <rect x="99"  y="59" width="8" height="67" fill="#CBD5E1" rx="1.5"/>
            <rect x="193" y="28" width="8" height="9"  fill="#2563EB" rx="1.5"/>
            <rect x="193" y="43" width="8" height="14" fill="#CBD5E1" rx="1.5"/>
            <text x="9"   text-anchor="middle" y="20"  font-size="11" fill="#6B7280">Base</text>
            <text x="103" text-anchor="middle" y="15"  font-size="10" fill="#6B7280">Age ≥50</text>
            <text x="103" text-anchor="middle" y="27"  font-size="10" fill="#6B7280">&amp; HTN</text>
            <text x="197" text-anchor="middle" y="20"  font-size="11" fill="#6B7280">Final</text>
            <text x="9"   text-anchor="middle" y="133" font-size="10" fill="#6B7280">12,345</text>
            <text x="111" y="43"  font-size="10" font-weight="700" fill="#2563EB" stroke="#fff" stroke-width="2.5" paint-order="stroke fill">3,100</text>
            <text x="56"  text-anchor="middle" y="93"  font-size="10" fill="#94A3B8">9,245 excl.</text>
            <text x="207" text-anchor="end"    y="36"  font-size="11" font-weight="700" fill="#2563EB" stroke="#fff" stroke-width="2.5" paint-order="stroke fill">1,240</text>
            <text x="207" text-anchor="end"    y="52"  font-size="10" font-weight="600" fill="#64748B">Excl. ICU Stay</text>
            <text x="207" text-anchor="end"    y="63"  font-size="9.5" fill="#94A3B8">1,860</text>
          </svg>

          <!-- Sankey Branch B -->
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;margin-top:10px">
            <div style="width:9px;height:9px;border-radius:50%;background:#7C3AED;flex-shrink:0"></div>
            <span style="font-size:11px;color:#475569;font-weight:500">Branch B</span>
          </div>
          <svg viewBox="0 0 210 145" width="100%" style="display:block;overflow:visible" font-family="inherit">
            <defs>
              <linearGradient id="sk-b-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stop-color="#A78BFA" stop-opacity="0.55"/>
                <stop offset="100%" stop-color="#DDD6FE" stop-opacity="0.4"/>
              </linearGradient>
            </defs>
            <path d="M 13,28 C 56,28 56,28 99,28 L 99,59 C 56,59 56,59 13,59 Z" fill="url(#sk-b-purple)"/>
            <path d="M 13,59 C 56,59 56,67 99,67 L 99,126 C 56,126 56,118 13,118 Z" fill="#E2E8F0" opacity="0.8"/>
            <path d="M 107,28 C 150,28 150,28 193,28 L 193,48 C 150,48 150,48 107,48 Z" fill="url(#sk-b-purple)"/>
            <path d="M 107,48 C 150,48 150,54 193,54 L 193,65 C 150,65 150,59 107,59 Z" fill="#E2E8F0" opacity="0.8"/>
            <rect x="5"   y="28" width="8" height="90" fill="#7C3AED" rx="1.5"/>
            <rect x="99"  y="28" width="8" height="31" fill="#7C3AED" rx="1.5"/>
            <rect x="99"  y="67" width="8" height="59" fill="#CBD5E1" rx="1.5"/>
            <rect x="193" y="28" width="8" height="20" fill="#7C3AED" rx="1.5"/>
            <rect x="193" y="54" width="8" height="11" fill="#CBD5E1" rx="1.5"/>
            <text x="9"   text-anchor="middle" y="20"  font-size="11" fill="#6B7280">Base</text>
            <text x="103" text-anchor="middle" y="15"  font-size="10" fill="#6B7280">Age ≥45</text>
            <text x="103" text-anchor="middle" y="27"  font-size="10" fill="#6B7280">&amp; SBP&gt;140</text>
            <text x="197" text-anchor="middle" y="20"  font-size="11" fill="#6B7280">Final</text>
            <text x="9"   text-anchor="middle" y="133" font-size="10" fill="#6B7280">12,345</text>
            <text x="111" y="47"  font-size="10" font-weight="700" fill="#7C3AED" stroke="#fff" stroke-width="2.5" paint-order="stroke fill">4,200</text>
            <text x="56"  text-anchor="middle" y="97"  font-size="10" fill="#94A3B8">8,145 excl.</text>
            <text x="207" text-anchor="end"    y="41"  font-size="11" font-weight="700" fill="#7C3AED" stroke="#fff" stroke-width="2.5" paint-order="stroke fill">2,800</text>
            <text x="207" text-anchor="end"    y="61"  font-size="10" font-weight="600" fill="#64748B">Insuf. Obs. Window</text>
            <text x="207" text-anchor="end"    y="72"  font-size="9.5" fill="#94A3B8">1,400</text>
          </svg>
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
