<template>
  <div class="profile-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div v-if="!isLoggedIn" class="not-logged-in">
          <el-card class="auth-prompt-card">
            <el-result
              icon="warning"
              title="请先登录"
              sub-title="登录后即可查看和管理您的个人中心"
            >
              <template #extra>
                <el-button type="primary" @click="$router.push('/login')">前往登录</el-button>
                <el-button @click="$router.push('/register')">注册账号</el-button>
              </template>
            </el-result>
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

                <div class="profile-quick-links">
                  <h4>快捷入口</h4>
                  <div class="links-grid">
                    <el-button 
                      link 
                      type="primary" 
                      @click="$router.push('/user/profile')"
                      class="quick-link"
                    >
                      <el-icon><User /></el-icon>
                      个人信息设置
                    </el-button>
                    <el-button 
                      link 
                      type="primary" 
                      @click="$router.push('/user/certification')"
                      class="quick-link"
                    >
                      <el-icon><CircleCheck /></el-icon>
                      学者认证
                    </el-button>
                    <el-button 
                      link 
                      type="primary" 
                      @click="$router.push('/user/appeal')"
                      class="quick-link"
                    >
                      <el-icon><Warning /></el-icon>
                      申诉
                    </el-button>
                    <el-button 
                      link 
                      type="primary" 
                      @click="$router.push('/user/achievements')"
                      class="quick-link"
                    >
                      <el-icon><Document /></el-icon>
                      成果管理
                    </el-button>
                  </div>
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

                      <div class="verification-section">
                        <h4>学术认证</h4>
                        <div class="verification-status">
                          <div v-if="verificationStatus === 'verified'" class="status-verified">
                            <el-icon class="status-icon"><CircleCheckFilled /></el-icon>
                            <span class="status-text">已认证学术专家</span>
                            <el-tag type="success" size="small">认证通过</el-tag>
                          </div>
                          <div v-else-if="verificationStatus === 'pending'" class="status-pending">
                            <el-icon class="status-icon"><Clock /></el-icon>
                            <span class="status-text">认证审核中</span>
                            <el-tag type="warning" size="small">审核中</el-tag>
                          </div>
                          <div v-else-if="verificationStatus === 'rejected'" class="status-rejected">
                            <el-icon class="status-icon"><CircleCloseFilled /></el-icon>
                            <span class="status-text">认证未通过</span>
                            <el-tag type="danger" size="small">未通过</el-tag>
                            <el-button size="small" type="primary" @click="showVerificationDialog = true">
                              重新申请
                            </el-button>
                          </div>
                          <div v-else class="status-unverified">
                            <el-icon class="status-icon"><QuestionFilled /></el-icon>
                            <span class="status-text">未认证</span>
                            <el-button size="small" type="primary" @click="showVerificationDialog = true">
                              申请认证
                            </el-button>
                          </div>
                        </div>
                        <p class="verification-desc">
                          认证后可以管理您名下的所有论文，包括编辑论文信息、回复评论等
                        </p>
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="我的论文" name="papers">
                    <div class="papers-content">
                      <el-empty v-if="settings.showFavorites" description="暂无上传的论文" />
                      <div v-else class="privacy-notice">
                        <el-alert
                          title="内容已隐藏"
                          description="您已在隐私设置中关闭了此内容的展示"
                          type="info"
                          :closable="false"
                        />
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

                  <el-tab-pane label="认证管理" name="verification" v-if="verificationStatus === 'verified'">
                    <div class="verification-management">
                      <div class="verification-header">
                        <h4>学术专家认证管理</h4>
                        <el-tag type="success">已认证</el-tag>
                      </div>

                      <el-alert
                        title="认证权限"
                        description="您已通过学术专家认证，可以管理名下的所有论文"
                        type="success"
                        :closable="false"
                        show-icon
                        style="margin-bottom: 20px;"
                      />

                      <div class="managed-papers">
                        <h5>可管理的论文</h5>
                        <div class="papers-list">
                          <div
                            v-for="paper in managedPapers"
                            :key="paper.id"
                            class="managed-paper-item"
                          >
                            <div class="paper-info">
                              <h6 class="paper-title">{{ paper.title }}</h6>
                              <p class="paper-meta">
                                {{ paper.journal }} - {{ new Date(paper.publishDate).getFullYear() }}
                              </p>
                              <div class="paper-stats">
                                <span>引用: {{ paper.citations }}</span>
                                <span>收藏: {{ paper.favorites }}</span>
                              </div>
                            </div>
                            <div class="paper-actions">
                              <el-button size="small" @click="editPaper(paper)">
                                <el-icon><Edit /></el-icon>
                                编辑
                              </el-button>
                              <el-button size="small" @click="viewPaperComments(paper)">
                                <el-icon><ChatDotSquare /></el-icon>
                                评论管理
                              </el-button>
                            </div>
                          </div>
                        </div>

                        <div v-if="managedPapers.length === 0" class="empty-papers">
                          <el-empty description="暂无可管理的论文" />
                        </div>
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

    <!-- 学术专家认证对话框 -->
    <el-dialog
      v-model="showVerificationDialog"
      title="学术专家认证申请"
      width="800px"
      @close="resetVerificationForm"
    >
      <div class="verification-form">
        <el-alert
          title="认证说明"
          description="请输入真实姓名和edu邮箱，获取验证码并完成邮箱验证。"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 20px;"
        />

        <el-form :model="verificationForm" :rules="verificationRules" ref="verificationFormRef" label-width="120px">
          <el-form-item label="真实姓名" prop="realName">
            <el-input
              v-model="verificationForm.realName"
              placeholder="请输入您的真实姓名"
            />
          </el-form-item>

          <el-form-item label="edu邮箱" prop="email">
            <el-input
              v-model="verificationForm.email"
              placeholder="请输入您的edu邮箱"
            />
          </el-form-item>

          <el-form-item label="验证码" prop="code">
            <el-row :gutter="8">
              <el-col :span="16">
                <el-input v-model="verificationForm.code" placeholder="请输入验证码" />
              </el-col>
              <el-col :span="8">
                <el-button
                  :disabled="codeSending || codeCountdown > 0 || !verificationForm.email"
                  @click="handleSendCode"
                  style="width: 100%;"
                >
                  <span v-if="codeCountdown === 0">获取验证码</span>
                  <span v-else>{{ codeCountdown }}秒后重试</span>
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showVerificationDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmitVerification"
            :loading="submittingVerification"
          >
            提交申请
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  CircleCheckFilled,
  Clock,
  CircleCloseFilled,
  QuestionFilled,
  Edit,
  ChatDotSquare,
  User,
  CircleCheck,
  Warning,
  Document
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'
import { useSettingsStore } from '../stores/settings'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const activeTab = ref('info')

// 认证相关变量
const verificationStatus = ref('unverified') // 'unverified' | 'pending' | 'verified' | 'rejected'
const showVerificationDialog = ref(false)
const submittingVerification = ref(false)
const verificationFormRef = ref()

const verificationForm = ref({
  realName: '',
  email: '',
  code: ''
})

const codeSending = ref(false)
const codeCountdown = ref(0)
let codeTimer: any = null
const sentCode = ref('')


const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)
const settings = computed(() => settingsStore.settings)


// 认证表单验证规则
const verificationRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入edu邮箱', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (!value) return callback(new Error('请输入edu邮箱'))
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.edu(\.[A-Za-z]{2,})?$/.test(value)) {
          callback(new Error('请输入有效的edu邮箱'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}


const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
}

// 认证相关方法
const handleSendCode = async () => {
  const email = verificationForm.value.email
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.edu(\.[A-Za-z]{2,})?$/.test(email)) {
    ElMessage.error('请输入有效的edu邮箱')
    return
  }
  codeSending.value = true
  // 模拟发送验证码
  sentCode.value = (Math.floor(100000 + Math.random() * 900000)).toString()
  ElMessage.success(`验证码已发送到邮箱（模拟：${sentCode.value}）`)
  codeCountdown.value = 60
  codeTimer && clearInterval(codeTimer)
  codeTimer = setInterval(() => {
    codeCountdown.value--
    if (codeCountdown.value <= 0) {
      clearInterval(codeTimer)
      codeCountdown.value = 0
    }
  }, 1000)
  codeSending.value = false
}

const handleSubmitVerification = () => {
  submittingVerification.value = true
  const formRef = verificationFormRef.value
  formRef.validate((valid: boolean) => {
    if (!valid) {
      submittingVerification.value = false
      return
    }
    if (verificationForm.value.code !== sentCode.value) {
      ElMessage.error('验证码错误')
      submittingVerification.value = false
      return
    }
    setTimeout(() => {
      verificationStatus.value = 'verified' // 认证通过，直接变成已认证学术专家
      showVerificationDialog.value = false
      submittingVerification.value = false
      ElMessage.success('认证成功，您已成为学术专家')
      resetVerificationForm()
    }, 1000)
  })
}

const resetVerificationForm = () => {
  verificationForm.value = {
    realName: '',
    email: '',
    code: ''
  }
  sentCode.value = ''
  codeCountdown.value = 0
  codeTimer && clearInterval(codeTimer)
}

// 论文管理方法
const editPaper = (paper: any) => {
  ElMessage.info(`编辑论文: ${paper.title}`)
  // 这里可以跳转到论文编辑页面
}

const viewPaperComments = (paper: any) => {
  ElMessage.info(`查看论文评论: ${paper.title}`)
  // 这里可以跳转到评论管理页面
}

// 新增：声明 managedPapers，模拟数据或空数组
const managedPapers = ref<any[]>([])

onMounted(() => {
  authStore.initAuth()
  settingsStore.loadSettings()

  // 设置用户认证状态为未认证，可以测试认证申请流程
  if (authStore.isLoggedIn) {
    verificationStatus.value = 'unverified' // 未认证状态，可以申请认证
  }
})
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
}

.not-logged-in {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;

  .auth-prompt-card {
    width: 100%;
    max-width: 600px;
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
      margin-bottom: 24px;
    }

    .profile-quick-links {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-color);
        margin: 0 0 12px 0;
      }

      .links-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .quick-link {
          justify-content: flex-start;
          width: 100%;
          padding: 8px 0;

          .el-icon {
            margin-right: 8px;
          }
        }
      }
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
      display: flex;
      align-items: center;
      justify-content: center;

      .privacy-notice {
        width: 100%;
      }
    }

    // 认证相关样式
    .verification-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin-bottom: 16px;
      }

      .verification-status {
        margin-bottom: 12px;

        .status-verified,
        .status-pending,
        .status-rejected,
        .status-unverified {
          display: flex;
          align-items: center;
          gap: 8px;

          .status-icon {
            font-size: 18px;
          }

          .status-text {
            font-weight: 500;
          }
        }

        .status-verified .status-icon {
          color: var(--el-color-success);
        }

        .status-pending .status-icon {
          color: var(--el-color-warning);
        }

        .status-rejected .status-icon {
          color: var(--el-color-danger);
        }

        .status-unverified .status-icon {
          color: var(--el-color-info);
        }
      }

      .verification-desc {
        font-size: 12px;
        color: #666;
        margin: 8px 0 0 0;
      }
    }

    // 认证管理样式
    .verification-management {
      .verification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h4 {
          margin: 0;
        }
      }

      .managed-papers {
        h5 {
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: 500;
        }

        .papers-list {
          .managed-paper-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            border: 1px solid #f0f0f0;
            border-radius: 8px;
            margin-bottom: 12px;

            .paper-info {
              flex: 1;

              .paper-title {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 500;
              }

              .paper-meta {
                margin: 4px 0;
                font-size: 14px;
                color: #666;
              }

              .paper-stats {
                display: flex;
                gap: 16px;
                font-size: 12px;
                color: #999;
                margin-top: 8px;
              }
            }

            .paper-actions {
              display: flex;
              gap: 8px;
            }
          }
        }

        .empty-papers {
          text-align: center;
          padding: 40px 0;
        }
      }
    }
  }

  // 认证对话框样式
  .verification-form {
    .upload-section {
      .el-upload__tip {
        color: #666;
        font-size: 12px;
        line-height: 1.4;
        margin-top: 8px;
      }
    }
  }
}

@media (max-width: 768px) {
  .profile-page {
    .profile-content {
      .managed-papers .papers-list .managed-paper-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .paper-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>
