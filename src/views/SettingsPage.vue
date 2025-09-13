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
                  <div class="academic-platforms">
                    <!-- 谷歌学术状态 -->
                    <div class="platform-status">
                      <div class="platform-header">
                        <div class="platform-info">
                          <el-icon class="platform-icon"><Trophy /></el-icon>
                          <span class="platform-name">谷歌学术</span>
                        </div>
                        <div v-if="!academicSettings.googleScholar.isVerified" class="status-unverified">
                          <el-icon class="status-icon" color="#faad14"><Warning /></el-icon>
                          <span class="status-text">未认证</span>
                        </div>
                        <div v-else class="status-verified">
                          <el-icon class="status-icon" color="#52c41a"><CircleCheck /></el-icon>
                          <span class="status-text">已认证</span>
                        </div>
                      </div>
                      <div v-if="academicSettings.googleScholar.isVerified" class="platform-details">
                        <span class="sync-time">最后同步：{{ formatLastSync(academicSettings.googleScholar.lastSyncTime) }}</span>
                      </div>
                    </div>

                    <!-- 知网状态 -->
                    <div class="platform-status">
                      <div class="platform-header">
                        <div class="platform-info">
                          <el-icon class="platform-icon"><Document /></el-icon>
                          <span class="platform-name">中国知网</span>
                        </div>
                        <div v-if="!academicSettings.cnki.isVerified" class="status-unverified">
                          <el-icon class="status-icon" color="#faad14"><Warning /></el-icon>
                          <span class="status-text">未认证</span>
                        </div>
                        <div v-else class="status-verified">
                          <el-icon class="status-icon" color="#52c41a"><CircleCheck /></el-icon>
                          <span class="status-text">已认证</span>
                        </div>
                      </div>
                      <div v-if="academicSettings.cnki.isVerified" class="platform-details">
                        <span class="sync-time">最后同步：{{ formatLastSync(academicSettings.cnki.lastSyncTime) }}</span>
                      </div>
                    </div>

                    <!-- 总体状态 -->
                    <div class="overall-status" v-if="academicSettings.googleScholar.isVerified || academicSettings.cnki.isVerified">
                      <div class="status-summary">
                        <span class="summary-text">
                          {{ getOverallStatusText() }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 平台绑定选项卡 -->
                <div class="setting-group">
                  <h4>账号绑定</h4>
                  <el-tabs v-model="activeBindTab" class="bind-tabs">
                    <!-- 谷歌学术绑定 -->
                    <el-tab-pane label="谷歌学术" name="google-scholar">
                      <div v-if="!academicSettings.googleScholar.isVerified" class="bind-content">
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
                              :loading="googleScholarBinding"
                            >
                              {{ googleScholarBinding ? '验证中...' : '开始认证' }}
                            </el-button>
                            <el-button @click="resetGoogleScholarForm">重置</el-button>
                          </el-form-item>
                        </el-form>
                      </div>
                      
                      <div v-else class="bound-content">
                        <div class="bound-info">
                          <el-descriptions :column="2" border>
                            <el-descriptions-item label="认证状态">
                              <el-tag type="success">已认证</el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="档案链接">
                              <el-link :href="academicSettings.googleScholar.profileUrl" target="_blank">
                                查看档案
                              </el-link>
                            </el-descriptions-item>
                            <el-descriptions-item label="ORCID ID">
                              {{ academicSettings.googleScholar.orcidId || '未设置' }}
                            </el-descriptions-item>
                            <el-descriptions-item label="自动同步">
                              <el-switch
                                v-model="academicSettings.googleScholar.autoSync"
                                @change="handleAcademicSettingChange"
                              />
                            </el-descriptions-item>
                          </el-descriptions>
                        </div>
                        
                        <div class="bound-actions">
                          <el-button @click="handleSyncGoogleScholar" :loading="googleScholarSyncing">
                            {{ googleScholarSyncing ? '同步中...' : '立即同步' }}
                          </el-button>
                          <el-button @click="handleUnbindGoogleScholar" type="danger" plain>
                            解除绑定
                          </el-button>
                        </div>
                      </div>
                    </el-tab-pane>

                    <!-- 知网绑定 -->
                    <el-tab-pane label="中国知网" name="cnki">
                      <div v-if="!academicSettings.cnki.isVerified" class="bind-content">
                        <el-form :model="cnkiForm" :rules="cnkiRules" ref="cnkiFormRef" label-width="120px">
                          <el-form-item label="知网用户名" prop="username">
                            <el-input
                              v-model="cnkiForm.username"
                              placeholder="请输入您的知网用户名"
                              style="width: 300px;"
                            >
                              <template #prefix>
                                <el-icon><User /></el-icon>
                              </template>
                            </el-input>
                            <div class="form-help">
                              <span>请使用您在知网注册的用户名</span>
                            </div>
                          </el-form-item>
                          
                          <el-form-item label="作者标识码" prop="authorId">
                            <el-input
                              v-model="cnkiForm.authorId"
                              placeholder="请输入您的知网作者标识码"
                              style="width: 300px;"
                            >
                              <template #prefix>
                                <el-icon><Stamp /></el-icon>
                              </template>
                            </el-input>
                            <div class="form-help">
                              <span>可在知网个人主页找到作者标识码</span>
                            </div>
                          </el-form-item>

                          <el-form-item>
                            <el-button 
                              type="primary" 
                              @click="handleCnkiBind"
                              :loading="cnkiBinding"
                            >
                              {{ cnkiBinding ? '验证中...' : '开始认证' }}
                            </el-button>
                            <el-button @click="resetCnkiForm">重置</el-button>
                          </el-form-item>
                        </el-form>
                      </div>
                      
                      <div v-else class="bound-content">
                        <div class="bound-info">
                          <el-descriptions :column="2" border>
                            <el-descriptions-item label="认证状态">
                              <el-tag type="success">已认证</el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="用户名">
                              {{ academicSettings.cnki.username }}
                            </el-descriptions-item>
                            <el-descriptions-item label="作者标识码">
                              {{ academicSettings.cnki.authorId }}
                            </el-descriptions-item>
                            <el-descriptions-item label="自动同步">
                              <el-switch
                                v-model="academicSettings.cnki.autoSync"
                                @change="handleAcademicSettingChange"
                              />
                            </el-descriptions-item>
                          </el-descriptions>
                        </div>
                        
                        <div class="bound-actions">
                          <el-button @click="handleSyncCnki" :loading="cnkiSyncing">
                            {{ cnkiSyncing ? '同步中...' : '立即同步' }}
                          </el-button>
                          <el-button @click="handleUnbindCnki" type="danger" plain>
                            解除绑定
                          </el-button>
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>

                  <div class="bind-help">
                    <el-alert
                      title="多平台认证说明"
                      type="info"
                      :closable="false"
                      show-icon
                    >
                      <p>1. 支持同时绑定谷歌学术和知网账号</p>
                      <p>2. 系统会自动检测并合并重复的论文</p>
                      <p>3. 对于相同论文，以谷歌学术数据为准</p>
                      <p>4. 知网独有的论文会被保留并合并到列表中</p>
                    </el-alert>
                  </div>
                </div>

                <!-- 合并设置 -->
                <div class="setting-group" v-if="academicSettings.googleScholar.isVerified || academicSettings.cnki.isVerified">
                  <h4>数据合并设置</h4>
                  <div class="setting-items">
                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">合并策略</span>
                        <span class="setting-desc">当发现重复论文时的处理方式</span>
                      </div>
                      <el-select v-model="academicSettings.mergeStrategy" @change="handleAcademicSettingChange">
                        <el-option label="谷歌学术优先" value="google-first" />
                        <el-option label="知网优先" value="cnki-first" />
                        <el-option label="手动处理" value="manual" />
                      </el-select>
                    </div>
                    
                    <div class="setting-item">
                      <div class="setting-info">
                        <span class="setting-label">同步合作论文</span>
                        <span class="setting-desc">包含您作为合作者的论文</span>
                      </div>
                      <el-switch
                        v-model="academicSettings.syncCollaborations"
                        @change="handleAcademicSettingChange"
                      />
                    </div>
                  </div>
                </div>

                <!-- 统计信息 -->
                <div class="setting-group" v-if="academicSettings.googleScholar.isVerified || academicSettings.cnki.isVerified">
                  <h4>学术统计</h4>
                  <div class="academic-stats">
                    <div class="stats-grid">
                      <div class="stat-card">
                        <div class="stat-value">{{ academicSettings.paperCount }}</div>
                        <div class="stat-label">总论文数</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-value">{{ academicSettings.totalCitations }}</div>
                        <div class="stat-label">总引用数</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-value">{{ academicSettings.hIndex }}</div>
                        <div class="stat-label">H指数</div>
                      </div>
                    </div>
                    
                    <div class="stats-details">
                      <div class="detail-item">
                        <span class="detail-label">学者姓名：</span>
                        <span class="detail-value">{{ academicSettings.scholarName || '获取中...' }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">所属机构：</span>
                        <span class="detail-value">{{ academicSettings.institution || '获取中...' }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">研究领域：</span>
                        <span class="detail-value">{{ academicSettings.researchFields?.join('、') || '获取中...' }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">最后更新：</span>
                        <span class="detail-value">{{ formatLastSync(academicSettings.lastSyncTime) }}</span>
                      </div>
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
import { Lock, Bell, User, Trophy, Warning, CircleCheck, Link, Stamp, Document } from '@element-plus/icons-vue'
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

const cnkiForm = reactive({
  username: '',
  authorId: ''
})

const googleScholarFormRef = ref()
const cnkiFormRef = ref()

// 界面状态
const activeBindTab = ref('google-scholar')
const googleScholarBinding = ref(false)
const googleScholarSyncing = ref(false)
const cnkiBinding = ref(false)
const cnkiSyncing = ref(false)

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

// 知网表单验证规则
const cnkiRules = {
  username: [
    { required: true, message: '请输入知网用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度应为2-50个字符', trigger: 'blur' }
  ],
  authorId: [
    { required: true, message: '请输入作者标识码', trigger: 'blur' },
    { pattern: /^[0-9A-Za-z-]+$/, message: '作者标识码格式不正确', trigger: 'blur' }
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

const getOverallStatusText = () => {
  const googleVerified = academicSettings.value.googleScholar.isVerified
  const cnkiVerified = academicSettings.value.cnki.isVerified
  
  if (googleVerified && cnkiVerified) {
    return `已绑定谷歌学术和知网账号，共同步 ${academicSettings.value.paperCount} 篇论文`
  } else if (googleVerified) {
    return `已绑定谷歌学术账号，已同步 ${academicSettings.value.paperCount} 篇论文`
  } else if (cnkiVerified) {
    return `已绑定知网账号，已同步 ${academicSettings.value.paperCount} 篇论文`
  }
  return ''
}

// 谷歌学术绑定处理
const handleGoogleScholarBind = async () => {
  if (!googleScholarFormRef.value) return
  
  try {
    await googleScholarFormRef.value.validate()
    googleScholarBinding.value = true
    
    const result = await academicStore.bindGoogleScholar({
      profileUrl: googleScholarForm.profileUrl,
      orcidId: googleScholarForm.orcidId
    })
    
    if (result.success) {
      ElMessage.success('谷歌学术账号绑定成功！')
      resetGoogleScholarForm()
      // 自动同步论文
      handleSyncGoogleScholar()
    } else {
      ElMessage.error(result.message || '绑定失败，请检查输入信息')
    }
  } catch (error) {
    ElMessage.error('绑定失败，请检查输入信息')
  } finally {
    googleScholarBinding.value = false
  }
}

const resetGoogleScholarForm = () => {
  googleScholarForm.profileUrl = ''
  googleScholarForm.orcidId = ''
  googleScholarFormRef.value?.clearValidate()
}

const handleSyncGoogleScholar = async () => {
  try {
    googleScholarSyncing.value = true
    const result = await academicStore.syncGoogleScholarPapers()
    if (result.success) {
      ElMessage.success('谷歌学术论文同步成功！')
    } else {
      ElMessage.error(result.message || '论文同步失败')
    }
  } catch (error) {
    ElMessage.error('论文同步失败')
  } finally {
    googleScholarSyncing.value = false
  }
}

const handleUnbindGoogleScholar = async () => {
  try {
    await ElMessageBox.confirm(
      '解除绑定后，已同步的谷歌学术论文数据将被清除，确认解除绑定吗？',
      '确认解除绑定',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await academicStore.unbindGoogleScholar()
    ElMessage.success('已解除谷歌学术账号绑定')
  } catch (error) {
    // 用户取消操作
  }
}

// 知网绑定处理
const handleCnkiBind = async () => {
  if (!cnkiFormRef.value) return
  
  try {
    await cnkiFormRef.value.validate()
    cnkiBinding.value = true
    
    const result = await academicStore.bindCnki({
      username: cnkiForm.username,
      authorId: cnkiForm.authorId
    })
    
    if (result.success) {
      ElMessage.success('知网账号绑定成功！')
      resetCnkiForm()
      // 自动同步论文
      handleSyncCnki()
    } else {
      ElMessage.error(result.message || '绑定失败，请检查输入信息')
    }
  } catch (error) {
    ElMessage.error('绑定失败，请检查输入信息')
  } finally {
    cnkiBinding.value = false
  }
}

const resetCnkiForm = () => {
  cnkiForm.username = ''
  cnkiForm.authorId = ''
  cnkiFormRef.value?.clearValidate()
}

const handleSyncCnki = async () => {
  try {
    cnkiSyncing.value = true
    const result = await academicStore.syncCnkiPapers()
    if (result.success) {
      ElMessage.success('知网论文同步成功！')
    } else {
      ElMessage.error(result.message || '论文同步失败')
    }
  } catch (error) {
    ElMessage.error('论文同步失败')
  } finally {
    cnkiSyncing.value = false
  }
}

const handleUnbindCnki = async () => {
  try {
    await ElMessageBox.confirm(
      '解除绑定后，已同步的知网论文数据将被清除，确认解除绑定吗？',
      '确认解除绑定',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await academicStore.unbindCnki()
    ElMessage.success('已解除知网账号绑定')
  } catch (error) {
    // 用户取消操作
  }
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

    // 多平台认证状态
    .academic-platforms {
      .platform-status {
        background: #f8f9fa;
        border: 1px solid #e8e8e8;
        border-radius: var(--border-radius);
        padding: 16px;
        margin-bottom: 12px;

        .platform-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .platform-info {
            display: flex;
            align-items: center;
            gap: 8px;

            .platform-icon {
              font-size: 18px;
              color: var(--primary-color);
            }

            .platform-name {
              font-weight: 500;
              font-size: 14px;
            }
          }

          .status-verified, .status-unverified {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;

            .status-icon {
              font-size: 14px;
            }
          }
        }

        .platform-details {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #e8e8e8;

          .sync-time {
            font-size: 12px;
            color: var(--text-light);
          }
        }
      }

      .overall-status {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px;
        border-radius: var(--border-radius);
        text-align: center;

        .status-summary {
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    // 绑定选项卡
    .bind-tabs {
      margin-top: 16px;

      .bind-content {
        padding: 20px 0;

        .form-help {
          margin-top: 4px;
          font-size: 12px;
          color: var(--text-light);
        }
      }

      .bound-content {
        padding: 20px 0;

        .bound-info {
          margin-bottom: 20px;
        }

        .bound-actions {
          display: flex;
          gap: 12px;
        }
      }
    }

    .bind-help {
      margin-top: 20px;
    }

    // 统计信息
    .academic-stats {
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 20px;

        .stat-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: var(--border-radius);
          text-align: center;
          border: 1px solid #e8e8e8;

          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 12px;
            color: var(--text-light);
          }
        }
      }

      .stats-details {
        background: #f8f9fa;
        padding: 16px;
        border-radius: var(--border-radius);
        border: 1px solid #e8e8e8;

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #e8e8e8;

          &:last-child {
            border-bottom: none;
          }

          .detail-label {
            font-weight: 500;
            font-size: 14px;
          }

          .detail-value {
            color: var(--text-light);
            font-size: 14px;
          }
        }
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