<template>
  <div class="settings-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div class="settings-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/profile' }">个人中心</el-breadcrumb-item>
            <el-breadcrumb-item>个人设置</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <el-row :gutter="24">
          <el-col :lg="6" :md="8" :sm="24" :xs="24">
            <el-card class="settings-menu">
              <el-menu
                v-model:default-active="activeSection"
                mode="vertical"
                @select="handleMenuSelect"
              >
                <el-menu-item index="privacy">
                  <el-icon><Lock /></el-icon>
                  <span>隐私设置</span>
                </el-menu-item>
                <el-menu-item index="notifications">
                  <el-icon><Bell /></el-icon>
                  <span>通知设置</span>
                </el-menu-item>
                <el-menu-item index="academic">
                  <el-icon><Trophy /></el-icon>
                  <span>学术认证</span>
                </el-menu-item>
                <el-menu-item index="account">
                  <el-icon><User /></el-icon>
                  <span>账户设置</span>
                </el-menu-item>
              </el-menu>
            </el-card>
          </el-col>

          <el-col :lg="18" :md="16" :sm="24" :xs="24">
            <el-card class="settings-content">
              <!-- 隐私设置 -->
              <div v-if="activeSection === 'privacy'" class="settings-section">
                <h3>隐私设置</h3>
                <p class="section-description">控制您的个人信息在平台上的展示方式</p>

                <div class="setting-group">
                  <h4>个人资料展示</h4>
                  <div class="setting-items">
                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">显示收藏夹</span>
                        <span class="setting-desc">其他用户可以查看您收藏的论文</span>
                      </div>
                      <el-switch
                        v-model="localSettings.showFavorites"
                        @change="handleSettingChange"
                      />
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">显示粉丝列表</span>
                        <span class="setting-desc">其他用户可以查看关注您的人</span>
                      </div>
                      <el-switch
                        v-model="localSettings.showFollowers"
                        @change="handleSettingChange"
                      />
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">显示关注列表</span>
                        <span class="setting-desc">其他用户可以查看您关注的人</span>
                      </div>
                      <el-switch
                        v-model="localSettings.showFollowing"
                        @change="handleSettingChange"
                      />
                    </div>
                  </div>
                </div>

                <div class="setting-group">
                  <h4>消息设置</h4>
                  <div class="setting-items">
                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">允许接收私信</span>
                        <span class="setting-desc">其他用户可以向您发送私信</span>
                      </div>
                      <el-switch
                        v-model="localSettings.allowMessages"
                        @change="handleSettingChange"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 通知设置 -->
              <div v-if="activeSection === 'notifications'" class="settings-section">
                <h3>通知设置</h3>
                <p class="section-description">管理您接收通知的方式和频率</p>

                <div class="setting-group">
                  <h4>邮件通知</h4>
                  <div class="setting-items">
                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">接收邮件通知</span>
                        <span class="setting-desc">当有新消息或重要更新时通过邮件通知您</span>
                      </div>
                      <el-switch
                        v-model="localSettings.emailNotifications"
                        @change="handleSettingChange"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 学术认证 -->
              <div v-if="activeSection === 'academic'" class="settings-section">
                <h3>学术认证</h3>
                <p class="section-description">绑定您的谷歌学术账号，自动同步已发表的论文</p>

                <div class="setting-group">
                  <h4>认证状态</h4>
                  <div class="academic-status">
                    <div v-if="!academicSettings.isVerified" class="status-unverified">
                      <el-icon class="status-icon" color="#faad14"><Warning /></el-icon>
                      <div class="status-info">
                        <span class="status-text">未认证</span>
                        <span class="status-desc">请绑定您的谷歌学术账号完成认证</span>
                      </div>
                    </div>
                    <div v-else class="status-verified">
                      <el-icon class="status-icon" color="#52c41a"><CircleCheck /></el-icon>
                      <div class="status-info">
                        <span class="status-text">已认证</span>
                        <span class="status-desc">谷歌学术账号已绑定，论文数据自动同步</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="setting-group" v-if="!academicSettings.isVerified">
                  <h4>绑定谷歌学术账号</h4>
                  <div class="google-scholar-bind">
                    <el-form :model="googleScholarForm" :rules="googleScholarRules" ref="googleScholarFormRef" label-width="120px">
                      <el-form-item label="学者档案URL" prop="profileUrl">
                        <el-input
                          v-model="googleScholarForm.profileUrl"
                          placeholder="请输入您的谷歌学术档案链接"
                          style="width: 400px;"
                        >
                          <template #prefix>
                            <el-icon><Link /></el-icon>
                          </template>
                        </el-input>
                        <div class="form-help">
                          <span>示例：https://scholar.google.com/citations?user=XXXXX</span>
                        </div>
                      </el-form-item>
                      
                      <el-form-item label="ORCID ID" prop="orcidId">
                        <el-input
                          v-model="googleScholarForm.orcidId"
                          placeholder="请输入您的ORCID ID（可选）"
                          style="width: 300px;"
                        >
                          <template #prefix>
                            <el-icon><Stamp /></el-icon>
                          </template>
                        </el-input>
                        <div class="form-help">
                          <span>示例：0000-0000-0000-0000</span>
                        </div>
                      </el-form-item>

                      <el-form-item>
                        <el-button 
                          type="primary" 
                          @click="handleGoogleScholarBind"
                          :loading="bindingLoading"
                        >
                          {{ bindingLoading ? '验证中...' : '开始认证' }}
                        </el-button>
                        <el-button @click="resetForm">重置</el-button>
                      </el-form-item>
                    </el-form>

                    <div class="bind-help">
                      <el-alert
                        title="认证说明"
                        type="info"
                        :closable="false"
                        show-icon
                      >
                        <p>1. 请确保您的谷歌学术档案是公开可访问的</p>
                        <p>2. 认证成功后，系统将自动同步您的论文数据</p>
                        <p>3. 同步的论文将显示在您的个人资料页面</p>
                        <p>4. 数据同步可能需要几分钟时间，请耐心等待</p>
                      </el-alert>
                    </div>
                  </div>
                </div>

                <div class="setting-group" v-if="academicSettings.isVerified">
                  <h4>已绑定账号信息</h4>
                  <div class="bound-account-info">
                    <div class="account-item">
                      <span class="account-label">学者姓名：</span>
                      <span class="account-value">{{ academicSettings.scholarName || '获取中...' }}</span>
                    </div>
                    <div class="account-item">
                      <span class="account-label">机构：</span>
                      <span class="account-value">{{ academicSettings.institution || '获取中...' }}</span>
                    </div>
                    <div class="account-item">
                      <span class="account-label">研究领域：</span>
                      <span class="account-value">{{ academicSettings.researchFields?.join('、') || '获取中...' }}</span>
                    </div>
                    <div class="account-item">
                      <span class="account-label">H指数：</span>
                      <span class="account-value">{{ academicSettings.hIndex || 0 }}</span>
                    </div>
                    <div class="account-item">
                      <span class="account-label">总引用数：</span>
                      <span class="account-value">{{ academicSettings.totalCitations || 0 }}</span>
                    </div>
                    <div class="account-item">
                      <span class="account-label">论文数量：</span>
                      <span class="account-value">{{ academicSettings.paperCount || 0 }}</span>
                    </div>
                    <div class="account-item">
                      <span class="account-label">最后同步：</span>
                      <span class="account-value">{{ formatLastSync(academicSettings.lastSyncTime) }}</span>
                    </div>
                  </div>

                  <div class="account-actions">
                    <el-button @click="handleSyncPapers" :loading="syncLoading">
                      {{ syncLoading ? '同步中...' : '立即同步论文' }}
                    </el-button>
                    <el-button @click="handleUnbindAccount" type="danger" plain>
                      解除绑定
                    </el-button>
                  </div>
                </div>

                <div class="setting-group" v-if="academicSettings.isVerified">
                  <h4>同步设置</h4>
                  <div class="setting-items">
                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">自动同步</span>
                        <span class="setting-desc">每日自动从谷歌学术同步最新论文数据</span>
                      </div>
                      <el-switch
                        v-model="academicSettings.autoSync"
                        @change="handleAcademicSettingChange"
                      />
                    </div>
                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">同步合作论文</span>
                        <span class="setting-desc">同步您作为合作者的论文</span>
                      </div>
                      <el-switch
                        v-model="academicSettings.syncCollaborations"
                        @change="handleAcademicSettingChange"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 账户设置 -->
              <div v-if="activeSection === 'account'" class="settings-section">
                <h3>账户设置</h3>
                <p class="section-description">管理您的账户信息和安全设置</p>

                <div class="setting-group">
                  <h4>密码修改</h4>
                  <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
                    <el-form-item label="当前密码" prop="currentPassword">
                      <el-input
                        v-model="passwordForm.currentPassword"
                        type="password"
                        show-password
                        style="width: 300px;"
                      />
                    </el-form-item>
                    <el-form-item label="新密码" prop="newPassword">
                      <el-input
                        v-model="passwordForm.newPassword"
                        type="password"
                        show-password
                        style="width: 300px;"
                      />
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirmPassword">
                      <el-input
                        v-model="passwordForm.confirmPassword"
                        type="password"
                        show-password
                        style="width: 300px;"
                      />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="handlePasswordChange">
                        修改密码
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, Bell, User, Trophy, Warning, CircleCheck, Link, Stamp } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { useSettingsStore } from '../stores/settings'
import { useAcademicStore } from '../stores/academic'
import type { UserSettings } from '../types/chat'

const settingsStore = useSettingsStore()
const academicStore = useAcademicStore()
const activeSection = ref('privacy')

const localSettings = reactive<UserSettings>({
  showFavorites: true,
  showFollowers: true,
  showFollowing: true,
  allowMessages: true,
  emailNotifications: true
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 学术认证相关数据 - 使用 store
const academicSettings = computed(() => academicStore.settings)
const syncedPapers = computed(() => academicStore.syncedPapers)

const googleScholarForm = reactive({
  profileUrl: '',
  orcidId: ''
})

const bindingLoading = ref(false)
const syncLoading = ref(false)
const googleScholarFormRef = ref()

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 谷歌学术表单验证规则
const googleScholarRules = {
  profileUrl: [
    { required: true, message: '请输入谷歌学术档案链接', trigger: 'blur' },
    { 
      pattern: /^https:\/\/scholar\.google\.com\/citations\?user=/, 
      message: '请输入有效的谷歌学术档案链接', 
      trigger: 'blur' 
    }
  ],
  orcidId: [
    { 
      pattern: /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, 
      message: '请输入有效的ORCID ID格式（0000-0000-0000-0000）', 
      trigger: 'blur' 
    }
  ]
}

const handleMenuSelect = (index: string) => {
  activeSection.value = index
}

const handleSettingChange = () => {
  settingsStore.saveSettings(localSettings)
  ElMessage.success('设置已保存')
}

const handleAcademicSettingChange = () => {
  // 保存学术认证设置
  academicStore.saveSettings()
  ElMessage.success('学术认证设置已保存')
}

const formatLastSync = (timestamp: string) => {
  if (!timestamp) return '从未同步'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString('zh-CN')
}

const handleGoogleScholarBind = async () => {
  if (!googleScholarFormRef.value) return
  
  try {
    await googleScholarFormRef.value.validate()
    bindingLoading.value = true
    
    const result = await academicStore.verifyGoogleScholar(
      googleScholarForm.profileUrl,
      googleScholarForm.orcidId
    )
    
    bindingLoading.value = false
    
    if (result.success) {
      ElMessage.success('学术认证成功！论文数据正在同步中...')
      academicStore.saveSettings()
      
      // 清空表单
      resetForm()
      
      setTimeout(() => {
        ElMessage.success('论文数据同步完成，请前往个人资料页面查看')
      }, 3000)
    } else {
      ElMessage.error(result.message || '认证失败，请检查链接是否正确')
    }
    
  } catch (error) {
    bindingLoading.value = false
    console.error('表单验证失败:', error)
  }
}

const handleSyncPapers = async () => {
  syncLoading.value = true
  
  const result = await academicStore.syncPapers()
  syncLoading.value = false
  
  if (result.success) {
    ElMessage.success(result.message)
    academicStore.saveSettings()
  } else {
    ElMessage.error(result.message)
  }
}

const handleUnbindAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '解除绑定后，已同步的论文数据将保留，但不会再自动同步新数据。确定要解除绑定吗？',
      '确认解除绑定',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    academicStore.unbindAccount()
    academicStore.saveSettings()
    ElMessage.success('已解除谷歌学术账号绑定')
    
  } catch (error) {
    // 用户取消操作
  }
}

const resetForm = () => {
  googleScholarForm.profileUrl = ''
  googleScholarForm.orcidId = ''
  googleScholarFormRef.value?.clearValidate()
}

const handlePasswordChange = () => {
  // Mock password change
  ElMessage.success('密码修改成功')
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

onMounted(() => {
  settingsStore.loadSettings()
  academicStore.loadSettings()
  Object.assign(localSettings, settingsStore.settings)
})
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-menu {
  .el-menu {
    border: none;

    .el-menu-item {
      border-radius: var(--border-radius);
      margin-bottom: 4px;

      &.is-active {
        background-color: var(--primary-color);
        color: white;
      }
    }
  }
}

.settings-content {
  .settings-section {
    h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
    }

    .section-description {
      margin: 0 0 24px 0;
      color: var(--text-light);
      font-size: 14px;
    }

    .setting-group {
      margin-bottom: 32px;

      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--text-color);
      }

      .setting-items {
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--border-color);

          &:last-child {
            border-bottom: none;
          }

          .setting-info {
            flex: 1;

            .setting-label {
              display: block;
              font-weight: 500;
              margin-bottom: 4px;
            }

            .setting-desc {
              display: block;
              font-size: 13px;
              color: var(--text-light);
            }
          }
        }
      }
    }

    // 学术认证相关样式
    .academic-status {
      padding: 20px;
      background: #f8f9fa;
      border-radius: var(--border-radius);
      margin-bottom: 16px;

      .status-unverified,
      .status-verified {
        display: flex;
        align-items: center;
        gap: 12px;

        .status-icon {
          font-size: 24px;
        }

        .status-info {
          .status-text {
            display: block;
            font-weight: 500;
            font-size: 16px;
            margin-bottom: 4px;
          }

          .status-desc {
            display: block;
            font-size: 14px;
            color: var(--text-light);
          }
        }
      }
    }

    .google-scholar-bind {
      .form-help {
        margin-top: 4px;
        font-size: 12px;
        color: var(--text-light);
      }

      .bind-help {
        margin-top: 24px;
      }
    }

    .bound-account-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: var(--border-radius);
      margin-bottom: 16px;

      .account-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #e8e8e8;

        &:last-child {
          border-bottom: none;
        }

        .account-label {
          font-weight: 500;
          color: var(--text-color);
          min-width: 100px;
        }

        .account-value {
          color: var(--text-light);
          text-align: right;
        }
      }
    }

    .account-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
  }
}
</style>