<template>
  <div class="scholar-card glass-card">
    <div class="card-header">
      <div class="avatar-wrapper">
        <el-avatar :src="scholar.avatar" :size="70" class="scholar-avatar">
          {{ scholar.name.charAt(0) }}
        </el-avatar>
        <div class="status-indicator" :class="{ online: Math.random() > 0.5 }"></div>
      </div>
      <div class="header-info">
        <div class="name-row">
          <h3 class="scholar-name" @click="goToDetail">{{ scholar.name }}</h3>
          <el-button 
            :type="scholar.isFollowed ? 'success' : 'primary'" 
            size="small" 
            round
            :plain="scholar.isFollowed"
            class="follow-btn"
            @click.stop="toggleFollow"
          >
            {{ scholar.isFollowed ? '已关注' : '关注' }}
          </el-button>
        </div>
        <p class="scholar-title">{{ scholar.title }}</p>
        <p class="scholar-institution"><el-icon><School /></el-icon> {{ scholar.institution }}</p>
      </div>
    </div>

    <div class="card-body">
      <div class="tags-container">
        <el-tag
          v-for="field in scholar.fields.slice(0, 3)"
          :key="field"
          size="small"
          effect="light"
          class="field-tag"
        >
          {{ field }}
        </el-tag>
        <el-tag v-if="scholar.fields.length > 3" size="small" effect="plain" class="more-tag">
          +{{ scholar.fields.length - 3 }}
        </el-tag>
      </div>

      <div class="stats-row">
        <div class="stat-item">
          <span class="value">{{ scholar.stats.hIndex }}</span>
          <span class="label">H-Index</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="value">{{ formatNumber(scholar.stats.citations) }}</span>
          <span class="label">引用</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="value">{{ scholar.stats.papers }}</span>
          <span class="label">论文</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <el-button class="action-btn" text @click.stop="$emit('start-chat', scholar.id)">
        <el-icon><ChatLineRound /></el-icon> 私信
      </el-button>
      <div class="divider"></div>
      <el-button class="action-btn" text @click="goToDetail">
        <el-icon><Right /></el-icon> 详情
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { School, ChatLineRound, Right } from '@element-plus/icons-vue'

const props = defineProps<{
  scholar: any
}>()

const emit = defineEmits(['start-chat'])
const router = useRouter()

const goToDetail = () => {
  router.push(`/scholar/${props.scholar.id}`)
}

const toggleFollow = () => {
  // Toggle logic would go here
  props.scholar.isFollowed = !props.scholar.isFollowed
}

const formatNumber = (num: number) => {
  return num > 1000 ? (num / 1000).toFixed(1) + 'k' : num
}
</script>

<style scoped lang="scss">
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
    border-color: rgba(64, 158, 255, 0.3);
  }
}

.card-header {
  padding: 20px;
  display: flex;
  gap: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);

  .avatar-wrapper {
    position: relative;
    .scholar-avatar {
      border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .status-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #909399;
      border: 2px solid #fff;
      &.online { background-color: #67c23a; }
    }
  }

  .header-info {
    flex: 1;
    min-width: 0;

    .name-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;

      .scholar-name {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        &:hover { color: #409eff; }
      }
    }

    .scholar-title {
      margin: 0 0 4px 0;
      font-size: 13px;
      color: #606266;
    }

    .scholar-institution {
      margin: 0;
      font-size: 12px;
      color: #909399;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.card-body {
  padding: 15px 20px;
  flex: 1;

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 20px;
    height: 28px; 
    overflow: hidden;
  }

  .stats-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: rgba(245, 247, 250, 0.5);
    padding: 10px;
    border-radius: 8px;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .value {
        font-size: 16px;
        font-weight: 700;
        color: #303133;
      }
      .label {
        font-size: 12px;
        color: #909399;
        margin-top: 2px;
      }
    }

    .stat-divider {
      width: 1px;
      height: 20px;
      background-color: #dcdfe6;
    }
  }
}

.card-footer {
  display: flex;
  border-top: 1px solid rgba(0, 0, 0, 0.03);
  
  .action-btn {
    flex: 1;
    border-radius: 0;
    height: 40px;
    margin: 0;
    
    &:hover {
      background-color: rgba(64, 158, 255, 0.05);
      color: #409eff;
    }
  }

  .divider {
    width: 1px;
    background-color: rgba(0, 0, 0, 0.03);
  }
}
</style>
