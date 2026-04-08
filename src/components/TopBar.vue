<script setup>
defineProps({ projectName: String, pointCounter: String })
defineEmits(['logout'])
</script>

<template>
  <div class="topbar">
    <div class="logo">
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" style="flex-shrink:0">
        <circle cx="4" cy="9" r="2" fill="#2563EB"/>
        <path d="M 4,4.5 A 4.5,4.5 0 0,1 4,13.5" stroke="#2563EB" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        <path d="M 4,1.5 A 7.5,7.5 0 0,1 4,16.5" stroke="#2563EB" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.45"/>
      </svg>
      Echo
    </div>
    <div class="topbar-divider"></div>
    <span class="project-name">{{ projectName }}</span>

    <div class="point-counter" style="margin-left:auto">{{ pointCounter }}</div>

    <div class="topbar-user">
      <div class="avatar">AA</div>
      <span>Admin</span>
      <button class="btn" style="padding:4px 9px" @click="$emit('logout')">Logout</button>
    </div>
  </div>
</template>
