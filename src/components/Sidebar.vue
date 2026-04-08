<script setup>
import { ref } from 'vue'

const expanded = ref(false)

const TOGGLE_ICON = `data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDE0IDE0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iSWNvbiI+CjxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik01LjI1IDMuNUw4Ljc1IDdMNS4yNSAxMC41IiBzdHJva2U9InZhcigtLXN0cm9rZS0wLCAjNDc1NTY5KSIgc3Ryb2tlLXdpZHRoPSIxLjMxMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L2c+Cjwvc3ZnPgo=`

const items = [
  { icon: 'home',          label: 'Home',            active: true },
  { icon: 'monitor_heart', label: 'Hypertension',    badge: true },
  { icon: 'dataset',       label: 'Study Variables'  },
  { icon: 'group',         label: 'Cohort Builder'   },
  { icon: 'compare',       label: 'Compare'          },
  { icon: 'download',      label: 'Export'           },
]
</script>

<template>
  <div class="sidebar" :class="{ expanded }">
    <div
      v-for="item in items"
      :key="item.label"
      class="sb-item"
      :class="{ active: item.active }"
      :title="item.label"
      style="position:relative"
    >
      <span class="material-symbols-outlined">{{ item.icon }}</span>
      <span class="sb-label">{{ item.label }}</span>
      <span v-if="item.badge" class="sb-badge"></span>
    </div>

    <div class="sb-toggle" @click="expanded = !expanded" title="Expand">
      <img :src="TOGGLE_ICON" width="14" height="14" alt="" />
    </div>
  </div>
</template>
