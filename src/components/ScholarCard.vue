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
            size="small" 
            :class="['follow-btn', scholar.isFollowed ? 'followed' : 'not-followed']"
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
          <span class="value">{{ scholar.stats?.hIndex || 0 }}</span>
          <span class="label">H-Index</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="value">{{ formatNumber(scholar.stats?.citations || 0) }}</span>
          <span class="label">引用</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="value">{{ scholar.stats?.papers || 0 }}</span>
          <span class="label">论文</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <el-button class="action-btn" text @click.stop="handleStartChat">
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
import { School, Right, ChatLineRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { followUser, unfollowUser } from '../api/social'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{
  scholar: any
}>()

const emit = defineEmits<{
  'follow-changed': [payload: { scholarId: string; isFollowed: boolean }]
}>()
const router = useRouter()
const authStore = useAuthStore()

const extractApiMessage = (payload: any, fallback = '操作失败') => {
  const data = payload?.response?.data ?? payload?.data ?? payload
  const message = data?.message ?? data?.msg ?? payload?.message
  if (typeof message === 'string' && message.trim()) return message.trim()
  if (typeof data === 'string' && data.trim()) return data.trim()
  return fallback
}

const goToDetail = () => {
  router.push(`/scholars/${props.scholar.id}`)
}

const handleStartChat = () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录才能发送私信')
    router.push('/profile')
    return
  }
  router.push(`/chat?userId=${props.scholar.id}&name=${encodeURIComponent(props.scholar.name || '')}&avatar=${encodeURIComponent(props.scholar.avatar || '')}`)
}

const toggleFollow = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录才能关注学者')
    return
  }
  try {
    const targetId = props.scholar.id
    const newFollowStatus = !props.scholar.isFollowed
    if (props.scholar.isFollowed) {
      const res = await unfollowUser(targetId)
      ElMessage.success(extractApiMessage(res, '已取消关注'))
    } else {
      const res = await followUser(targetId)
      ElMessage.success(extractApiMessage(res, '已关注'))
    }
    emit('follow-changed', { scholarId: targetId, isFollowed: newFollowStatus })
  } catch (error: any) {
    ElMessage.error(extractApiMessage(error))
  }
}

const formatNumber = (num: number) => {
  return num > 1000 ? (num / 1000).toFixed(1) + 'k' : num
}
</script>

<style scoped lang="scss">
.glass-card {
  background: rgba(249, 247, 236, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 3px solid rgba(184, 134, 11, 0.5);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(212, 175, 55, 0.2) inset,
    inset 0 2px 4px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(135deg, 
      rgba(212, 175, 55, 0.4) 0%, 
      transparent 25%, 
      transparent 75%, 
      rgba(212, 175, 55, 0.4) 100%);
    border-radius: 16px;
    z-index: -1;
    opacity: 0.6;
  }

  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 
      0 20px 48px rgba(0, 0, 0, 0.25),
      0 0 0 3px rgba(212, 175, 55, 0.6),
      inset 0 2px 6px rgba(255, 255, 255, 0.6),
      inset 0 -2px 6px rgba(0, 0, 0, 0.15);
    border-color: rgba(212, 175, 55, 0.8);
  }
}

.card-header {
  padding: 24px;
  display: flex;
  gap: 18px;
  border-bottom: 3px solid rgba(184, 134, 11, 0.25);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.4) 0%, 
    rgba(249, 247, 236, 0.6) 50%,
    rgba(255, 255, 255, 0.3) 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(212, 175, 55, 0.5) 50%, 
      transparent 100%);
  }

  .avatar-wrapper {
    position: relative;
    .scholar-avatar {
      border: 4px solid #D4AF37;
      box-shadow: 
        0 4px 12px rgba(0,0,0,0.25),
        0 0 0 2px rgba(184, 134, 11, 0.3),
        inset 0 2px 4px rgba(255, 255, 255, 0.4);
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
        border-color: #B8860B;
        box-shadow: 
          0 6px 16px rgba(0,0,0,0.3),
          0 0 0 3px rgba(212, 175, 55, 0.4),
          inset 0 2px 4px rgba(255, 255, 255, 0.5);
      }
    }
    .status-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: #909399;
      border: 3px solid #f9f7ec;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      &.online { 
        background-color: #B8860B;
        box-shadow: 0 0 6px rgba(184, 134, 11, 0.8);
      }
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
      
      .follow-btn {
        border-radius: 16px !important;
        font-weight: 700 !important;
        font-family: 'Georgia', 'Times New Roman', serif !important;
        padding: 6px 16px !important;
        border: 2px solid !important;
        transition: all 0.3s ease !important;
        
        &.not-followed {
          background: #D4AF37 !important;
          border-color: #B8860B !important;
          color: #fff !important;
          
          &:hover {
            background: #B8860B !important;
            border-color: #8B4513 !important;
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(184, 134, 11, 0.4);
          }
        }
        
        &.followed {
          background: rgba(212, 175, 55, 0.1) !important;
          border-color: #D4AF37 !important;
          color: #654321 !important;
          
          &:hover {
            background: rgba(212, 175, 55, 0.2) !important;
            border-color: #B8860B !important;
          }
        }
      }

      .scholar-name {
        margin: 0;
        font-size: 20px;
        font-weight: 900;
        color: #654321;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif;
        letter-spacing: 0.3px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        
        &:hover { 
          color: #D4AF37;
          text-shadow: 1px 1px 3px rgba(212, 175, 55, 0.5);
        }
      }
    }

    .scholar-title {
      margin: 0 0 6px 0;
      font-size: 14px;
      color: #8B4513;
      font-style: italic;
      font-family: 'Georgia', 'Times New Roman', serif;
    }

    .scholar-institution {
      margin: 0;
      font-size: 13px;
      color: #B8860B;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      font-family: 'Georgia', 'Times New Roman', serif;
      
      :deep(.el-icon) {
        color: #D4AF37;
      }
    }
  }
}

.card-body {
  padding: 15px 20px;
  flex: 1;

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
    height: 28px; 
    overflow: hidden;
    
    :deep(.field-tag) {
      background: rgba(212, 175, 55, 0.15) !important;
      border: 1px solid rgba(184, 134, 11, 0.4) !important;
      color: #654321 !important;
      font-weight: 600 !important;
      font-family: 'Georgia', 'Times New Roman', serif !important;
      border-radius: 6px !important;
      
      &:hover {
        background: rgba(212, 175, 55, 0.25) !important;
        border-color: #D4AF37 !important;
      }
    }
    
    :deep(.more-tag) {
      background: rgba(139, 69, 19, 0.1) !important;
      border: 1px solid rgba(139, 69, 19, 0.3) !important;
      color: #8B4513 !important;
      font-weight: 700 !important;
    }
  }

  .stats-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: linear-gradient(135deg, 
      rgba(212, 175, 55, 0.1) 0%, 
      rgba(184, 134, 11, 0.15) 100%);
    padding: 12px;
    border-radius: 8px;
    border: 1px solid rgba(184, 134, 11, 0.3);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .value {
        font-size: 18px;
        font-weight: 900;
        color: #654321;
        font-family: 'Georgia', 'Times New Roman', serif;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
      }
      .label {
        font-size: 11px;
        color: #8B4513;
        margin-top: 4px;
        font-weight: 600;
        font-family: 'Georgia', 'Times New Roman', serif;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .stat-divider {
      width: 2px;
      height: 24px;
      background: linear-gradient(to bottom, 
        transparent 0%, 
        rgba(184, 134, 11, 0.5) 50%, 
        transparent 100%);
    }
  }
}

.card-footer {
  display: flex;
  border-top: 2px solid rgba(184, 134, 11, 0.2);
  background: linear-gradient(135deg, 
    rgba(249, 247, 236, 0.5) 0%, 
    rgba(255, 255, 255, 0.3) 100%);
  
  .action-btn {
    flex: 1;
    border-radius: 0;
    height: 44px;
    margin: 0;
    font-weight: 700;
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #654321;
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, 
        rgba(212, 175, 55, 0.2) 0%, 
        rgba(184, 134, 11, 0.15) 100%);
      color: #D4AF37;
      text-shadow: 0 1px 2px rgba(212, 175, 55, 0.3);
    }
    
    :deep(.el-icon) {
      color: #B8860B;
      transition: color 0.3s ease;
    }
    
    &:hover :deep(.el-icon) {
      color: #D4AF37;
    }
  }

  .divider {
    width: 2px;
    background: linear-gradient(to bottom, 
      transparent 0%, 
      rgba(184, 134, 11, 0.4) 50%, 
      transparent 100%);
  }
}
</style>
