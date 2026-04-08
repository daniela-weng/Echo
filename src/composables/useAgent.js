import { ref } from 'vue'
import { sendChatMessage, fetchAgentStatus } from '../api/index.js'

export function useAgent(graphRef) {
  // ── Chat ──────────────────────────────────────────────────────────────────

  const messages = ref([
    { type: 'agent', text: 'Criteria Agent' },
    { type: 'bot',   text: 'Hi! I can help you build criteria, explain OMOP mappings, or compare branches.' },
    { type: 'bot',   text: 'Try: "Why is Branch A small?" or "Add SBP criterion"' },
  ])

  async function sendMessage(text) {
    if (!text.trim()) return
    messages.value.push({ type: 'user', text })
    const graph = graphRef?.value ?? { nodes: [], edges: [] }
    const { agent, text: reply } = await sendChatMessage(text, graph)
    messages.value.push({ type: 'agent', text: agent })
    messages.value.push({ type: 'bot', text: reply })
  }

  // ── Pipeline status ───────────────────────────────────────────────────────

  const pipelineSteps = ref([
    { id: 'orchestrator', label: 'Orchestrator', status: 'done' },
    { id: 'criteria',     label: 'Criteria',     status: 'done' },
    { id: 'sql',          label: 'SQL',           status: 'running' },
    { id: 'omop',         label: 'OMOP',          status: 'idle' },
  ])
  const statusText = ref('Processing node 2 of 3 in Branch A…')
  const logLines   = ref([
    'Criteria Agent: parsing node 2 (AND)',
    'SQL Agent: generating SQL for current node',
  ])

  async function refreshStatus() {
    const data = await fetchAgentStatus()
    pipelineSteps.value = data.steps
    statusText.value    = data.statusText
    logLines.value      = data.logLines
  }

  return { messages, sendMessage, pipelineSteps, statusText, logLines, refreshStatus }
}
