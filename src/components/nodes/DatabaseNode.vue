<script setup>
import { Handle, Position } from '@vue-flow/core'
defineProps({ data: Object })
</script>

<template>
  <div style="position:relative">
    <div style="position:absolute;top:-11px;left:10px;background:#E0F2FE;border:1px solid #BAE6FD;border-radius:10px;padding:3px 6px;display:flex;gap:2px;align-items:center;z-index:2;pointer-events:none;white-space:nowrap">
      <span class="material-symbols-outlined" style="font-size:14px;color:#0369A1;line-height:1;flex-shrink:0">database</span>
      <span style="font-weight:600;font-size:12px;color:#0369A1">Database</span>
    </div>

    <div style="background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:16px 12px;box-shadow:0 2px 6px rgba(0,0,0,0.05)">
      <div style="display:flex;gap:6px;align-items:flex-end">
        <div style="display:flex;flex-direction:column;gap:2px;width:125px">
          <div style="display:flex;gap:4px;align-items:center">
            <span style="font-weight:700;font-size:18px;color:#0F172A;letter-spacing:-0.18px;white-space:nowrap">{{ data.name }}</span>
          </div>
          <span style="font-size:14px;color:#64748B">Records ({{ data.count }})</span>
        </div>
        <div style="background:#EEF2FF;border:1px solid #CBD5F5;border-radius:10px;padding:3px 8px">
          <span style="font-weight:700;font-size:11px;color:#4F46E5">OMOP CDM</span>
        </div>
      </div>
    </div>

    <!-- One source handle per active cohort slot; kept static for N=3 demo,
         parametrize by prop when wiring a dynamic cohort list. -->
    <Handle type="source" :position="Position.Bottom" id="src-a" style="left:22%;background:#93C5FD;border-color:#2563EB;width:8px;height:8px" />
    <Handle type="source" :position="Position.Bottom" id="src-b" style="left:55%;background:#C4B5FD;border-color:#7C3AED;width:8px;height:8px" />
    <Handle type="source" :position="Position.Bottom" id="src-c" style="left:85%;background:#FCD34D;border-color:#D97706;width:8px;height:8px" />
  </div>
</template>
