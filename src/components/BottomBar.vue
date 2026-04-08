<script setup>
defineProps({
  activeBranches: { type: Number, default: 2 },
  pointsUsed: { type: String, default: '3,125 / 9 pts' },
})
</script>

<template>
  <div class="bottom-bar">
    <span>Version 1.0.0</span>
    <div class="bb-sep"></div>
    <span>OMOP CDM · PostgreSQL</span>
    <div class="bb-sep"></div>
    <span style="color:#22C55E">● {{ activeBranches }} branches active</span>
    <div class="bb-sep"></div>
    <span style="margin-left:auto">{{ pointsUsed }}</span>
    <div class="bb-sep"></div>
    <span>GitHub</span>
  </div>
</template>
