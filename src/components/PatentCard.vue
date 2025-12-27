<template>
  <div class="patent-card">
    <div class="patent-header">
      <h3 class="patent-title">
        <router-link
          :to="`/patent/${patent.id}`"
          class="title-link"
        >
          {{ patent.title }}
        </router-link>
      </h3>
      <div class="patent-type-badge">{{ patent.type }}</div>
    </div>

    <div class="patent-info-row">
      <span class="info-label">申请人：</span>
      <span class="info-value">{{ patent.applicant }}</span>
    </div>

    <div class="patent-info-row">
      <span class="info-label">发明人：</span>
      <span class="info-value">{{ patent.inventors.join(', ') }}</span>
    </div>

    <div class="patent-abstract">
      <span class="abstract-label">摘要：</span>
      <p>{{ patent.abstract }}</p>
    </div>

    <div class="patent-meta">
      <div class="meta-item">
        <span class="meta-label">申请号：</span>
        <span class="meta-value">{{ patent.applicationNumber }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">公开年份：</span>
        <span class="meta-value">{{ patent.publicationYear }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Patent } from '../types/patent'

defineProps<{
  patent: Patent
}>()
</script>

<style scoped lang="scss">
.patent-card {
  background: #fffcf5;
  border: 1px solid rgba(184, 137, 58, 0.2);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 4px 12px rgba(46, 42, 37, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(184, 137, 58, 0.15);
    border-color: rgba(184, 137, 58, 0.4);
  }
}

.patent-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.patent-title {
  margin: 0;
  font-family: "Noto Serif", serif;
  font-size: 18px;
  line-height: 1.4;
  font-weight: 700;
  flex: 1;
  padding-right: 16px;
}

.title-link {
  color: #2e2a25;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #b8893a;
  }
}

.patent-type-badge {
  background: rgba(184, 137, 58, 0.1);
  color: #8B4513;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid rgba(184, 137, 58, 0.2);
}

.patent-info-row {
  font-size: 14px;
  line-height: 1.5;
  color: #555;
}

.info-label {
  color: #7a6f63;
  font-weight: 600;
}

.info-value {
  color: #2e2a25;
}

.patent-abstract {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #4a4a4a;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  .abstract-label {
    font-weight: 600;
    color: #7a6f63;
  }
  
  p {
    display: inline;
    margin: 0;
  }
}

.patent-meta {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(184, 137, 58, 0.2);
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #7a6f63;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-label {
  font-weight: 600;
}

.status-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  
  &.status-valid {
    background: rgba(76, 175, 80, 0.1);
    color: #2e7d32;
    border: 1px solid rgba(76, 175, 80, 0.2);
  }
  
  &.status-invalid {
    background: rgba(211, 47, 47, 0.1);
    color: #c62828;
    border: 1px solid rgba(211, 47, 47, 0.2);
  }
}
</style>
