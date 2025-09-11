<template>
  <div class="scholar-card">
    <div class="scholar-header">
      <el-avatar
        :src="scholar.avatar"
        :size="60"
        class="scholar-avatar"
      >
        {{ scholar.name.charAt(0) }}
      </el-avatar>
      <div class="scholar-info">
        <h3 class="scholar-name">
          <router-link
            :to="`/scholar/${scholar.id}`"
            class="name-link"
          >
            {{ scholar.name }}
          </router-link>
        </h3>
        <p class="scholar-title">{{ scholar.title }}</p>
        <p class="scholar-institution">{{ scholar.institution }}</p>
      </div>
      <el-button
        :type="scholar.isFollowed ? 'primary' : 'default'"
        size="small"
        @click="toggleFollow"
      >
        {{ scholar.isFollowed ? '已关注' : '关注' }}
      </el-button>
    </div>

    <div class="scholar-fields">
      <el-tag
        v-for="field in scholar.fields"
        :key="field"
        size="small"
        effect="plain"
      >
        {{ field }}
      </el-tag>
    </div>

    <div class="scholar-stats">
      <div class="stat-item">
        <span class="stat-label">H指数</span>
        <span class="stat-value">{{ scholar.hIndex }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">引用数</span>
        <span class="stat-value">{{ scholar.citations }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">论文数</span>
        <span class="stat-value">{{ scholar.papers }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Scholar } from '../types/scholar'

interface Props {
  scholar: Scholar
}

const props = defineProps<Props>()

const toggleFollow = () => {
  props.scholar.isFollowed = !props.scholar.isFollowed
}
</script>

<style scoped lang="scss">
.scholar-card {
  .scholar-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;

    .scholar-avatar {
      flex-shrink: 0;
    }

    .scholar-info {
      flex: 1;

      .scholar-name {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;

        .name-link {
          text-decoration: none;
          color: var(--text-color);

          &:hover {
            color: var(--primary-color);
          }
        }
      }

      .scholar-title, .scholar-institution {
        margin: 2px 0;
        font-size: 13px;
        color: var(--text-light);
      }
    }
  }

  .scholar-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }

  .scholar-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    .stat-item {
      text-align: center;

      .stat-label {
        display: block;
        font-size: 12px;
        color: var(--text-light);
        margin-bottom: 2px;
      }

      .stat-value {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-color);
      }
    }
  }
}
</style>
