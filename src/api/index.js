/**
 * API layer for Echo dashboard.
 *
 * All functions here call the backend. During development, Vite proxies
 * /api/* requests to http://localhost:8000 (see vite.config.js).
 *
 * Replace the TODO stubs with real fetch/axios calls as the backend becomes available.
 */

// ── Graph Execution ──────────────────────────────────────────────────────────

/**
 * Execute the cohort graph and return updated patient counts per node.
 *
 * @param {{ nodes: object[], edges: object[] }} graphData - current Vue Flow graph
 * @returns {Promise<{ nodeId: string, count: number }[]>}
 *
 * TODO: POST /api/execute
 */
export async function executeGraph(graphData) {
  // TODO: implement
  // const res = await fetch('/api/execute', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(graphData),
  // })
  // if (!res.ok) throw new Error('Execute failed')
  // return res.json()
  console.log('[API stub] executeGraph called', graphData)
  return []
}

// ── SQL Console ──────────────────────────────────────────────────────────────

/**
 * Fetch the generated SQL for a given branch.
 *
 * @param {'A' | 'B'} branch
 * @returns {Promise<{ sql: string, generatedAt: string }>}
 *
 * TODO: GET /api/sql?branch=A
 */
export async function fetchSQL(branch) {
  // TODO: implement
  // const res = await fetch(`/api/sql?branch=${branch}`)
  // if (!res.ok) throw new Error('fetchSQL failed')
  // return res.json()
  console.log('[API stub] fetchSQL called', branch)
  return { sql: '-- SQL not yet connected', generatedAt: null }
}

// ── Agent Pipeline Status ────────────────────────────────────────────────────

/**
 * Fetch the current agent pipeline status.
 *
 * @returns {Promise<{
 *   steps: { id: string, label: string, status: 'done' | 'running' | 'idle' }[],
 *   statusText: string,
 *   logLines: string[]
 * }>}
 *
 * TODO: GET /api/agent/status   (or connect a WebSocket for real-time updates)
 */
export async function fetchAgentStatus() {
  // TODO: implement
  // const res = await fetch('/api/agent/status')
  // if (!res.ok) throw new Error('fetchAgentStatus failed')
  // return res.json()
  console.log('[API stub] fetchAgentStatus called')
  return {
    steps: [
      { id: 'orchestrator', label: 'Orchestrator', status: 'done' },
      { id: 'criteria',     label: 'Criteria',     status: 'done' },
      { id: 'sql',          label: 'SQL',           status: 'running' },
      { id: 'omop',         label: 'OMOP',          status: 'idle' },
    ],
    statusText: 'Processing node 2 of 3 in Branch A…',
    logLines: [
      'Criteria Agent: parsing node 2 (AND)',
      'SQL Agent: generating SQL for current node',
    ],
  }
}

// ── Chat / Criteria Agent ────────────────────────────────────────────────────

/**
 * Send a chat message to the Criteria Agent and get a response.
 *
 * @param {string} message
 * @param {{ nodes: object[], edges: object[] }} graphContext - current graph for context
 * @returns {Promise<{ agent: string, text: string }>}
 *
 * TODO: POST /api/chat
 */
export async function sendChatMessage(message, graphContext) {
  // TODO: implement
  // const res = await fetch('/api/chat', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message, graph: graphContext }),
  // })
  // if (!res.ok) throw new Error('sendChatMessage failed')
  // return res.json()
  console.log('[API stub] sendChatMessage called', message)
  const fallbacks = [
    "Branch A is small because the NOT:ICU exclusion removed 60% of patients after applying the Hypertension criterion (SNOMED 38341003).",
    "Branch B uses Age ≥ 45, gaining ~1,600 extra patients. The added SBP > 140 criterion ensures all included patients have documented hypertension severity.",
    "To add SBP criterion: press 'Add Criteria', type 'SBP > 140', and connect with an AND operator node after the Hypertension node.",
    "OMOP mapping for Hypertension: SNOMED concept 38341003 maps to condition_occurrence.",
    "Suggestion: try an OR node instead of AND between Hypertension and SBP > 140 for ~4,800 patients.",
  ]
  return { agent: 'Criteria Agent', text: fallbacks[Math.floor(Math.random() * fallbacks.length)] }
}

// ── Cohort Metrics ───────────────────────────────────────────────────────────

/**
 * Fetch computed metric values for both cohorts.
 *
 * @param {{ branchA: string, branchB: string }} cohortIds - identifiers for the two cohorts
 * @returns {Promise<{ groups: { name: string, metrics: object[] }[] }>}
 *
 * TODO: GET /api/metrics?branchA=...&branchB=...
 */
export async function fetchMetrics(cohortIds) {
  // TODO: implement
  // const params = new URLSearchParams(cohortIds)
  // const res = await fetch(`/api/metrics?${params}`)
  // if (!res.ok) throw new Error('fetchMetrics failed')
  // return res.json()
  console.log('[API stub] fetchMetrics called', cohortIds)
  return null  // null = use local state
}
