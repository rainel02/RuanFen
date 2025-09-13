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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock, Bell, User } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { useSettingsStore } from '../stores/settings'
import type { UserSettings } from '../types/chat'

const settingsStore = useSettingsStore()
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
      validator: (rule: any, value: string, callback: Function) => {
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

const handleMenuSelect = (index: string) => {
  activeSection.value = index
}

const handleSettingChange = () => {
  settingsStore.saveSettings(localSettings)
  ElMessage.success('设置已保存')
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
  }
}
</style>