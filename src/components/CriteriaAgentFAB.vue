<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({ messages: Array })
const emit  = defineEmits(['send'])

const open     = ref(false)
const input    = ref('')
const msgsEl   = ref(null)

async function send() {
  const text = input.value.trim()
  if (!text) return
  emit('send', text)
  input.value = ''
  await nextTick()
  if (msgsEl.value) msgsEl.value.scrollTop = msgsEl.value.scrollHeight
}

function onKey(e) { if (e.key === 'Enter') send() }
</script>

<template>
  <div class="chatbot-fab">
    <div class="chatbot-window" :class="{ open }">
      <div class="chatbot-header">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style="flex-shrink:0">
          <path d="M2 3h10a1 1 0 011 1v6a1 1 0 01-1 1H4l-3 2V4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3"/>
        </svg>
        Criteria Agent
        <span class="chatbot-agent-tag">context-aware</span>
        <div class="chatbot-dot"></div>
      </div>

      <div class="chatbot-messages" ref="msgsEl">
        <template v-for="(msg, i) in messages" :key="i">
          <div v-if="msg.type === 'agent'" class="msg-agent">{{ msg.text }}</div>
          <div v-else :class="['msg', msg.type]">{{ msg.text }}</div>
        </template>
      </div>

      <div class="chatbot-input">
        <input
          type="text"
          v-model="input"
          placeholder="Ask the criteria agent…"
          @keydown="onKey"
        />
        <button @click="send">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M12 7H2M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <button class="chatbot-btn" @click="open = !open" title="Criteria Agent">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H6l-4 3V5a1 1 0 011-1z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>
