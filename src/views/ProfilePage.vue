<template>
  <div class="profile-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div v-if="!isLoggedIn" class="auth-section">
          <el-card class="auth-card">
            <div class="auth-tabs">
              <el-tabs v-model="authTab" class="auth-tabs-component">
                <el-tab-pane label="登录" name="login">
                  <el-form
                    ref="loginFormRef"
                    :model="loginForm"
                    :rules="loginRules"
                    label-width="80px"
                  >
                    <el-form-item label="用户名" prop="username">
                      <el-input
                        v-model="loginForm.username"
                        placeholder="请输入用户名"
                      />
                    </el-form-item>

                    <el-form-item label="密码" prop="password">
                      <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="请输入密码"
                        show-password
                      />
                    </el-form-item>

                    <el-form-item>
                      <el-button
                        type="primary"
                        @click="handleLogin"
                        :loading="loginLoading"
                        style="width: 100%;"
                      >
                        登录
                      </el-button>
                    </el-form-item>
                  </el-form>

                  <div class="demo-info">
                    <el-alert
                      title="演示账号"
                      type="info"
                      :closable="false"
                      show-icon
                    >
                      <template #default>
                        用户名: admin，密码: 123456
                      </template>
                    </el-alert>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="注册" name="register">
                  <el-form
                    ref="registerFormRef"
                    :model="registerForm"
                    :rules="registerRules"
                    label-width="80px"
                  >
                    <el-form-item label="姓名" prop="name">
                      <el-input v-model="registerForm.name" placeholder="请输入真实姓名" />
                    </el-form-item>

                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="registerForm.email" placeholder="请输入邮箱地址" />
                    </el-form-item>

                    <el-form-item label="密码" prop="password">
                      <el-input
                        v-model="registerForm.password"
                        type="password"
                        placeholder="请输入密码"
                        show-password
                      />
                    </el-form-item>

                    <el-form-item label="确认密码" prop="confirmPassword">
                      <el-input
                        v-model="registerForm.confirmPassword"
                        type="password"
                        placeholder="请再次输入密码"
                        show-password
                      />
                    </el-form-item>

                    <el-form-item>
                      <el-button
                        type="primary"
                        @click="handleRegister"
                        :loading="registerLoading"
                        style="width: 100%;"
                      >
                        注册
                      </el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-card>
        </div>

        <div v-else class="profile-content">
          <el-row :gutter="24">
            <el-col :md="8" :sm="24" :xs="24">
              <el-card class="profile-card">
                <div class="profile-header">
                  <el-avatar :src="user?.avatar" :size="80">
                    {{ user?.name?.charAt(0) }}
                  </el-avatar>
                  <h3>{{ user?.name }}</h3>
                  <p class="user-title">{{ user?.title }}</p>
                  <p class="user-institution">{{ user?.institution }}</p>
                </div>

                <div class="profile-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ user?.hIndex }}</span>
                    <span class="stat-label">H指数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ user?.citations }}</span>
                    <span class="stat-label">引用数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ user?.papers }}</span>
                    <span class="stat-label">论文数</span>
                  </div>
                </div>

                <div class="profile-actions">
                  <el-button @click="handleLogout">退出登录</el-button>
                  <el-button @click="$router.push('/settings')">个人设置</el-button>
                </div>
              </el-card>
            </el-col>

            <el-col :md="16" :sm="24" :xs="24">
              <el-card class="content-card">
                <el-tabs v-model="activeTab" class="profile-tabs">
                  <el-tab-pane label="个人信息" name="info">
                    <div class="info-content">
                      <h4>研究领域</h4>
                      <div class="research-fields">
                        <el-tag
                          v-for="field in user?.researchFields"
                          :key="field"
                          type="info"
                          effect="plain"
                        >
                          {{ field }}
                        </el-tag>
                      </div>

                      <h4>联系信息</h4>
                      <p><strong>邮箱：</strong>{{ user?.email }}</p>
                      <p><strong>机构：</strong>{{ user?.institution }}</p>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="我的论文" name="papers">
                    <div class="papers-content">
                      <div v-if="!academicStore.isVerified" class="academic-verification-prompt">
                        <el-empty description="暂无论文数据">
                          <template #default>
                            <div class="verification-info">
                              <p>完成学术认证后，系统将自动同步您在谷歌学术上的论文数据</p>
                              <el-button type="primary" @click="$router.push('/settings?section=academic')">
                                前往认证
                              </el-button>
                            </div>
                          </template>
                        </el-empty>
                      </div>
                      
                      <div v-else-if="academicStore.syncedPapers.length === 0" class="no-papers">
                        <el-empty description="暂无同步的论文数据">
                          <template #default>
                            <div class="sync-info">
                              <p>您已完成学术认证，但暂未同步到论文数据</p>
                              <el-button @click="handleSyncPapers" :loading="syncLoading">
                                立即同步
                              </el-button>
                            </div>
                          </template>
                        </el-empty>
                      </div>
                      
                      <div v-else class="papers-list">
                        <div class="papers-header">
                          <div class="papers-stats">
                            <span class="stat-item">
                              <strong>{{ academicStore.syncedPapers.length }}</strong> 篇论文
                            </span>
                            <span class="stat-item">
                              <strong>{{ academicStore.settings.totalCitations }}</strong> 总引用
                            </span>
                            <span class="stat-item">
                              <strong>{{ academicStore.settings.hIndex }}</strong> H指数
                            </span>
                          </div>
                          <div class="papers-actions">
                            <el-button size="small" @click="handleSyncPapers" :loading="syncLoading">
                              {{ academicStore.hasRecentSync ? '重新同步' : '立即同步' }}
                            </el-button>
                            <span v-if="academicStore.settings.lastSyncTime" class="last-sync">
                              最后同步：{{ formatTime(academicStore.settings.lastSyncTime) }}
                            </span>
                          </div>
                        </div>
                        
                        <div class="papers-grid">
                          <div
                            v-for="paper in academicStore.syncedPapers"
                            :key="paper.id"
                            class="paper-item"
                          >
                            <div class="paper-card">
                              <div class="paper-header">
                                <h4 class="paper-title">{{ paper.title }}</h4>
                                <div class="paper-year">{{ paper.year }}</div>
                              </div>
                              
                              <div class="paper-authors">
                                <span class="authors-label">作者：</span>
                                <span class="authors-list">{{ paper.authors.join(', ') }}</span>
                              </div>
                              
                              <div class="paper-journal">
                                <span class="journal-label">期刊：</span>
                                <span class="journal-name">{{ paper.journal }}</span>
                              </div>
                              
                              <div class="paper-meta">
                                <div class="paper-citations">
                                  <el-icon><Star /></el-icon>
                                  <span>{{ paper.citations }} 引用</span>
                                </div>
                                <div class="paper-actions">
                                  <el-button size="small" text @click="openPaperUrl(paper.url)">
                                    <el-icon><Link /></el-icon>
                                    查看详情
                                  </el-button>
                                </div>
                              </div>
                              
                              <div v-if="paper.abstract" class="paper-abstract">
                                <p>{{ paper.abstract.substring(0, 150) }}{{ paper.abstract.length > 150 ? '...' : '' }}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="收藏夹" name="favorites">
                    <div class="favorites-content">
                      <el-empty v-if="settings.showFavorites" description="暂无收藏的论文" />
                      <div v-else class="privacy-notice">
                        <el-alert
                          title="内容已隐藏"
                          description="您已在隐私设置中关闭了收藏夹的展示"
                          type="info"
                          :closable="false"
                        />
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="关注列表" name="following">
                    <div class="following-content">
                      <el-empty v-if="settings.showFollowing" description="暂无关注的学者" />
                      <div v-else class="privacy-notice">
                        <el-alert
                          title="内容已隐藏"
                          description="您已在隐私设置中关闭了关注列表的展示"
                          type="info"
                          :closable="false"
                        />
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="粉丝列表" name="followers">
                    <div class="followers-content">
                      <el-empty v-if="settings.showFollowers" description="暂无粉丝" />
                      <div v-else class="privacy-notice">
                        <el-alert
                          title="内容已隐藏"
                          description="您已在隐私设置中关闭了粉丝列表的展示"
                          type="info"
                          :closable="false"
                        />
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Star, Link } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'
import { useSettingsStore } from '../stores/settings'
import { useAcademicStore } from '../stores/academic'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const academicStore = useAcademicStore()

const authTab = ref('login')
const activeTab = ref('info')
const loginLoading = ref(false)
const registerLoading = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)
const settings = computed(() => settingsStore.settings)

// 学术认证相关
const syncLoading = ref(false)

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const registerRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleLogin = async () => {
  loginLoading.value = true
  try {
    const result = await authStore.login(loginForm.value.username, loginForm.value.password)
    if (result.success) {
      ElMessage.success('登录成功')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    ElMessage.error('登录失败')
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  registerLoading.value = true
  // Mock register
  setTimeout(() => {
    ElMessage.success('注册成功，请登录')
    authTab.value = 'login'
    registerLoading.value = false
  }, 1000)
}

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
}

// 学术认证相关方法
const handleSyncPapers = async () => {
  syncLoading.value = true
  
  const result = await academicStore.syncPapers()
  syncLoading.value = false
  
  if (result.success) {
    ElMessage.success(result.message)
  } else {
    ElMessage.error(result.message)
  }
}

const formatTime = (timestamp: string) => {
  if (!timestamp) return '未知'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString('zh-CN')
}

const openPaperUrl = (url: string) => {
  window.open(url, '_blank')
}

onMounted(() => {
  authStore.initAuth()
  settingsStore.loadSettings()
  academicStore.loadSettings()
})
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
}

.auth-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;

  .auth-card {
    width: 100%;
    max-width: 400px;

    .demo-info {
      margin-top: 16px;
    }
  }
}

.profile-content {
  .profile-card {
    .profile-header {
      text-align: center;
      margin-bottom: 24px;

      h3 {
        margin: 12px 0 4px 0;
        font-size: 20px;
        font-weight: 600;
      }

      .user-title, .user-institution {
        margin: 4px 0;
        color: var(--text-light);
        font-size: 14px;
      }
    }

    .profile-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      .stat-item {
        text-align: center;

        .stat-value {
          display: block;
          font-size: 20px;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 4px;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: var(--text-light);
        }
      }
    }

    .profile-actions {
      text-align: center;
    }
  }

  .content-card {
    .info-content {
      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .research-fields {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 20px;
      }

      p {
        margin: 8px 0;
        color: var(--text-color);
      }
    }

    .papers-content,
    .favorites-content,
    .following-content,
    .followers-content {
      min-height: 300px;

      .privacy-notice {
        width: 100%;
      }

      // 学术认证提示样式
      .academic-verification-prompt,
      .no-papers {
        .verification-info,
        .sync-info {
          text-align: center;
          
          p {
            margin-bottom: 16px;
            color: var(--text-light);
          }
        }
      }

      // 论文列表样式
      .papers-list {
        .papers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: var(--border-radius);

          .papers-stats {
            display: flex;
            gap: 24px;

            .stat-item {
              color: var(--text-color);
              
              strong {
                color: var(--primary-color);
                font-size: 18px;
              }
            }
          }

          .papers-actions {
            display: flex;
            align-items: center;
            gap: 12px;

            .last-sync {
              font-size: 12px;
              color: var(--text-light);
            }
          }
        }

        .papers-grid {
          display: grid;
          gap: 16px;

          .paper-item {
            .paper-card {
              border: 1px solid var(--border-color);
              border-radius: var(--border-radius);
              padding: 20px;
              background: white;
              transition: all 0.2s;

              &:hover {
                box-shadow: var(--shadow-medium);
                border-color: var(--primary-color);
              }

              .paper-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;

                .paper-title {
                  flex: 1;
                  margin: 0;
                  font-size: 16px;
                  font-weight: 600;
                  color: var(--text-color);
                  line-height: 1.4;
                  margin-right: 12px;
                }

                .paper-year {
                  background: var(--primary-color);
                  color: white;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: 500;
                }
              }

              .paper-authors,
              .paper-journal {
                margin-bottom: 8px;
                font-size: 14px;
                
                .authors-label,
                .journal-label {
                  color: var(--text-light);
                  margin-right: 4px;
                }

                .authors-list,
                .journal-name {
                  color: var(--text-color);
                }
              }

              .paper-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 16px 0;

                .paper-citations {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  color: var(--text-light);
                  font-size: 14px;

                  .el-icon {
                    color: #faad14;
                  }
                }

                .paper-actions {
                  .el-button {
                    padding: 4px 8px;
                  }
                }
              }

              .paper-abstract {
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid var(--border-color);

                p {
                  margin: 0;
                  font-size: 13px;
                  color: var(--text-light);
                  line-height: 1.5;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
