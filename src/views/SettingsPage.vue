<template>
  <div class="settings-page">
    <AppHeader />

    <!-- Vanta.js Birds 背景 -->
    <div id="vanta-birds-settings-bg" class="vanta-background"></div>

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
                <el-menu-item index="personalization">
                  <el-icon><User /></el-icon>
                  <span>个性化推荐</span>
                </el-menu-item>
                <el-menu-item index="features">
                  <el-icon><Setting /></el-icon>
                  <span>功能设置</span>
                </el-menu-item>
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
              <!-- 个性化推荐设置 -->
              <div v-if="activeSection === 'personalization'" class="settings-section">
                <h3>个性化推荐设置</h3>
                <p class="section-description">设置您的身份和研究兴趣，我们将为您推荐相关论文</p>

                <div class="setting-group">
                  <h4>身份选择</h4>
                  <div class="setting-items">
                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">您的身份</span>
                        <span class="setting-desc">选择最符合您的身份，我们将据此调整推荐内容</span>
                      </div>
                      <el-select
                        v-model="localSettings.userRole"
                        placeholder="请选择身份"
                        style="width: 200px;"
                        @change="handleSettingChange"
                      >
                        <el-option label="本科生" value="undergraduate" />
                        <el-option label="研究生" value="graduate" />
                        <el-option label="博士生" value="phd" />
                        <el-option label="博士后" value="postdoc" />
                        <el-option label="助理教授" value="assistant_professor" />
                        <el-option label="副教授" value="associate_professor" />
                        <el-option label="教授" value="professor" />
                        <el-option label="研究员" value="researcher" />
                        <el-option label="行业从业者" value="industry" />
                        <el-option label="其他" value="other" />
                      </el-select>
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">研究领域</span>
                        <span class="setting-desc">选择您感兴趣的研究领域（可多选）</span>
                      </div>
                      <el-select
                        v-model="localSettings.researchFields"
                        placeholder="请选择研究领域"
                        multiple
                        style="width: 300px;"
                        @change="handleSettingChange"
                      >
                        <el-option label="人工智能" value="ai" />
                        <el-option label="机器学习" value="ml" />
                        <el-option label="深度学习" value="dl" />
                        <el-option label="计算机视觉" value="cv" />
                        <el-option label="自然语言处理" value="nlp" />
                        <el-option label="数据挖掘" value="dm" />
                        <el-option label="数据库" value="database" />
                        <el-option label="网络安全" value="security" />
                        <el-option label="软件工程" value="se" />
                        <el-option label="分布式系统" value="distributed" />
                        <el-option label="生物信息学" value="bioinformatics" />
                        <el-option label="量子计算" value="quantum" />
                      </el-select>
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">推荐频率</span>
                        <span class="setting-desc">设置论文推荐的频率</span>
                      </div>
                      <el-select
                        v-model="localSettings.recommendationFrequency"
                        style="width: 150px;"
                        @change="handleSettingChange"
                      >
                        <el-option label="每日推荐" value="daily" />
                        <el-option label="每周推荐" value="weekly" />
                        <el-option label="每月推荐" value="monthly" />
                        <el-option label="关闭推荐" value="off" />
                      </el-select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 功能设置 -->
              <div v-if="activeSection === 'features'" class="settings-section">
                <h3>功能设置</h3>
                <p class="section-description">控制平台功能的启用状态</p>

                <div class="setting-group">
                  <h4>社区功能</h4>
                  <div class="setting-items">
                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">论坛功能</span>
                        <span class="setting-desc">启用论坛功能，参与学术讨论和交流</span>
                      </div>
                      <el-switch
                        v-model="localSettings.enableForum"
                        @change="handleSettingChange"
                      />
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">论文导读</span>
                        <span class="setting-desc">启用个性化论文导读功能</span>
                      </div>
                      <el-switch
                        v-model="localSettings.enablePaperGuide"
                        @change="handleSettingChange"
                      />
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">学术圈子</span>
                        <span class="setting-desc">加入感兴趣的学术圈子</span>
                      </div>
                      <el-switch
                        v-model="localSettings.enableCircles"
                        @change="handleSettingChange"
                      />
                    </div>
                  </div>
                </div>

                <div class="setting-group">
                  <h4>AI辅助功能</h4>
                  <div class="setting-items">
                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">智能摘要</span>
                        <span class="setting-desc">使用AI为论文生成智能摘要</span>
                      </div>
                      <el-switch
                        v-model="localSettings.enableAISummary"
                        @change="handleSettingChange"
                      />
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">相关论文推荐</span>
                        <span class="setting-desc">基于AI算法推荐相关论文</span>
                      </div>
                      <el-switch
                        v-model="localSettings.enableAIRecommendation"
                        @change="handleSettingChange"
                      />
                    </div>
                  </div>
                </div>
              </div>

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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock, Bell, User, Setting } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { useSettingsStore } from '../stores/settings'
import type { UserSettings } from '../types/chat'

declare global {
  interface Window {
    VANTA: any
  }
}

let vantaEffect: any = null

const settingsStore = useSettingsStore()
const activeSection = ref('personalization')

const localSettings = reactive<UserSettings>({
  // 隐私设置
  showFavorites: true,
  showFollowers: true,
  showFollowing: true,
  allowMessages: true,
  emailNotifications: true,
  
  // 个性化设置
  userRole: '',
  researchFields: [],
  recommendationFrequency: 'weekly',
  
  // 功能设置
  enableForum: true,
  enablePaperGuide: true,
  enableCircles: true,
  enableAISummary: true,
  enableAIRecommendation: true
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
  
  // 初始化 Vanta.js Birds 背景
  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VANTA) {
      vantaEffect = window.VANTA.BIRDS({
        el: '#vanta-birds-settings-bg',
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        backgroundColor: 0xf9f7ec,
        colorMode: "lerpGradient",
        color1: 0xff0000,
        color2: 0xd1ff,
        birdSize: 1.40,
        quantity: 4.00,
        wingSpan: 30.00,
        speedLimit: 5.00,
        separation: 20.00,
        alignment: 20.00,
        cohesion: 20.00
      })
    }
  }, 100)
})

onUnmounted(() => {
  // 清理 Vanta.js 实例
  if (vantaEffect) {
    vantaEffect.destroy()
  }
})
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  position: relative;

  .vanta-background {
    position: fixed;
    top: 64px; // 导航栏高度
    left: 0;
    width: 100%;
    height: calc(100vh - 64px);
    z-index: 0;
    pointer-events: none;
  }

  .page-content {
    position: relative;
    z-index: 1;

    .settings-menu,
    .settings-content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }
  }
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