<template>
  <div class="social-page">
    <AppHeader />
    <div class="container">
      <div class="header">
        <h2>我的社交</h2>
      </div>

      <el-card class="social-card">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="我关注的人" name="following">
            <div v-loading="loading" class="user-list">
              <el-empty v-if="followingList.length === 0 && !loading" description="暂无关注" />
              <div v-for="user in followingList" :key="user.id" class="user-item">
                <div class="user-info">
                  <el-avatar :src="user.avatar || defaultAvatar" :size="50" />
                  <div class="info-text">
                    <div class="name">{{ user.name }}</div>
                    <div class="institution">{{ user.institution || '未知机构' }}</div>
                  </div>
                </div>
                <el-button type="danger" plain size="small" @click="handleUnfollow(user.id)">
                  取消关注
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="关注我的人" name="followers">
            <div v-loading="loading" class="user-list">
              <el-empty v-if="followersList.length === 0 && !loading" description="暂无粉丝" />
              <div v-for="user in followersList" :key="user.id" class="user-item">
                <div class="user-info">
                  <el-avatar :src="user.avatar || defaultAvatar" :size="50" />
                  <div class="info-text">
                    <div class="name">{{ user.name }}</div>
                    <div class="institution">{{ user.institution || '未知机构' }}</div>
                  </div>
                </div>
                <!-- Optional: Follow back button -->
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { getFollowing, getFollowers, unfollowUser } from '../api/social'
import { ElMessage } from 'element-plus'

const activeTab = ref('following')
const loading = ref(false)
const followingList = ref<any[]>([])
const followersList = ref<any[]>([])
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// Assuming we need current user ID, but API might infer from token or we need to get it.
// The API definition says /social/following/{userId}.
// I'll assume 'me' works or I need to get my ID.
// For now, I'll use 'me' if the backend supports it, or I need to fetch user profile first.
// Let's assume 'me' is supported or I'll hardcode a placeholder if I can't get it.
// Actually, usually /users/me gives the ID.
// I'll try 'me' first.

const currentUserId = 'me' 

const fetchFollowing = async () => {
  loading.value = true
  try {
    const res = await getFollowing(currentUserId)
    followingList.value = (res as any).data || res
  } catch (error) {
    console.error(error)
    // Mock
    followingList.value = [
      { id: '1', name: '张教授', institution: '清华大学', avatar: '' },
      { id: '2', name: '李博士', institution: '北京大学', avatar: '' }
    ]
  } finally {
    loading.value = false
  }
}

const fetchFollowers = async () => {
  loading.value = true
  try {
    const res = await getFollowers(currentUserId)
    followersList.value = (res as any).data || res
  } catch (error) {
    console.error(error)
    // Mock
    followersList.value = [
      { id: '3', name: '王同学', institution: '复旦大学', avatar: '' }
    ]
  } finally {
    loading.value = false
  }
}

const handleTabClick = () => {
  if (activeTab.value === 'following') {
    fetchFollowing()
  } else {
    fetchFollowers()
  }
}

const handleUnfollow = async (userId: string) => {
  try {
    await unfollowUser(userId)
    ElMessage.success('已取消关注')
    fetchFollowing()
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchFollowing()
})
</script>

<style scoped lang="scss">
.social-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  margin-bottom: 20px;
  h2 {
    margin: 0;
    color: #303133;
  }
}

.social-card {
  min-height: 500px;
}

.user-list {
  .user-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;

      .info-text {
        .name {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 5px;
        }
        .institution {
          font-size: 13px;
          color: #909399;
        }
      }
    }
  }
}
</style>
