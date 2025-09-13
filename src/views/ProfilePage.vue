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
          description="请提供相关证明材料以验证您的学术专家身份。审核通过后，您将能够管理名下的所有论文。"
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

          <el-form-item label="学术机构" prop="institution">
            <el-input
              v-model="verificationForm.institution"
              placeholder="请输入您所在的学术机构"
            />
          </el-form-item>

          <el-form-item label="职位/职称" prop="position">
            <el-select v-model="verificationForm.position" placeholder="请选择您的职位" style="width: 100%">
              <el-option label="教授" value="professor" />
              <el-option label="副教授" value="associate_professor" />
              <el-option label="助理教授" value="assistant_professor" />
              <el-option label="研究员" value="researcher" />
              <el-option label="副研究员" value="associate_researcher" />
              <el-option label="助理研究员" value="assistant_researcher" />
              <el-option label="博士后" value="postdoc" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>

          <el-form-item label="学者主页" prop="homepage">
            <el-input
              v-model="verificationForm.homepage"
              placeholder="请输入您的学者主页链接（如Google Scholar、ResearchGate等）"
            />
          </el-form-item>

          <el-form-item label="ORCID" prop="orcid">
            <el-input
              v-model="verificationForm.orcid"
              placeholder="请输入您的ORCID ID（可选）"
            />
          </el-form-item>

          <el-form-item label="代表性论文" prop="representativePapers">
            <el-input
              v-model="verificationForm.representativePapers"
              type="textarea"
              :rows="4"
              placeholder="请列出3-5篇您的代表性论文（包括标题、期刊、年份）"
            />
          </el-form-item>

          <el-form-item label="证明材料" prop="documents">
            <div class="upload-section">
              <el-upload
                v-model:file-list="verificationForm.documents"
                :before-upload="beforeUpload"
                :on-remove="handleRemove"
                multiple
                :limit="5"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              >
                <el-button type="primary">
                  <el-icon><Upload /></el-icon>
                  上传证明材料
                </el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    支持上传工作证明、学位证书、论文发表证明等，格式：PDF、JPG、PNG、DOC，单个文件不超过10MB，最多5个文件
                  </div>
                </template>
              </el-upload>
            </div>
          </el-form-item>

          <el-form-item label="补充说明" prop="additionalInfo">
            <el-input
              v-model="verificationForm.additionalInfo"
              type="textarea"
              :rows="3"
              placeholder="如有其他需要说明的情况，请在此填写（可选）"
            />
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
  Upload
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'
import { useSettingsStore } from '../stores/settings'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const authTab = ref('login')
const activeTab = ref('info')
const loginLoading = ref(false)
const registerLoading = ref(false)

// 认证相关变量
const verificationStatus = ref('unverified') // 'unverified' | 'pending' | 'verified' | 'rejected'
const showVerificationDialog = ref(false)
const submittingVerification = ref(false)

const verificationForm = ref({
  realName: '',
  institution: '',
  position: '',
  homepage: '',
  orcid: '',
  representativePapers: '',
  documents: [],
  additionalInfo: ''
})

// 模拟已认证用户可管理的论文
const managedPapers = ref([
  {
    id: 'paper-1',
    title: '深度学习在自然语言处理中的应用研究',
    journal: 'Nature Machine Intelligence',
    publishDate: '2024-01-15',
    citations: 156,
    favorites: 23
  },
  {
    id: 'paper-2', 
    title: '基于Transformer架构的多模态学习方法',
    journal: 'IEEE Transactions on Pattern Analysis',
    publishDate: '2023-11-20',
    citations: 89,
    favorites: 15
  }
])

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

// 认证表单验证规则
const verificationRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  institution: [
    { required: true, message: '请输入学术机构', trigger: 'blur' }
  ],
  position: [
    { required: true, message: '请选择职位', trigger: 'change' }
  ],
  homepage: [
    { required: true, message: '请输入学者主页链接', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ],
  representativePapers: [
    { required: true, message: '请列出代表性论文', trigger: 'blur' }
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

// 认证相关方法
const resetVerificationForm = () => {
  verificationForm.value = {
    realName: '',
    institution: '',
    position: '',
    homepage: '',
    orcid: '',
    representativePapers: '',
    documents: [],
    additionalInfo: ''
  }
}

const beforeUpload = (file: any) => {
  const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
  const isValidSize = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传 PDF、JPG、PNG、DOC 格式的文件！')
    return false
  }
  if (!isValidSize) {
    ElMessage.error('文件大小不能超过 10MB！')
    return false
  }
  return true
}

const handleRemove = () => {
  // 处理文件移除
}

const handleSubmitVerification = () => {
  submittingVerification.value = true
  
  // 模拟提交审核
  setTimeout(() => {
    verificationStatus.value = 'pending'
    showVerificationDialog.value = false
    submittingVerification.value = false
    ElMessage.success('认证申请已提交，我们将在3-5个工作日内完成审核')
    resetVerificationForm()
  }, 2000)
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
