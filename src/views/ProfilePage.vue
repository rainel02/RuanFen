<template>
  <div class="profile-page" :class="{ 'login-page': !isLoggedIn }">
    <AppHeader />

    <!-- Vanta.js Birds 背景（已登录用户） -->
    <div v-if="isLoggedIn" id="vanta-birds-bg" class="vanta-background"></div>

    <!-- 登录背景轮播 -->
    <div v-if="!isLoggedIn" class="login-carousel-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
      <div 
        class="carousel-wrapper" 
        :style="getCarouselStyle()"
      >
        <!-- 最后一张的副本（放在最前面，用于从第一张向左滑动） -->
        <div 
          class="carousel-item"
          :style="{ backgroundImage: `url(${loginImages[loginImages.length - 1]})` }"
        ></div>
        <!-- 原始图片 -->
        <div 
          v-for="(_image, index) in loginImages" 
          :key="index" 
          class="carousel-item"
          :style="{ backgroundImage: `url(${loginImages[index]})` }"
        ></div>
        <!-- 第一张的副本（放在最后面，用于从最后一张向右滑动） -->
        <div 
          class="carousel-item"
          :style="{ backgroundImage: `url(${loginImages[0]})` }"
        ></div>
      </div>
      <!-- 指示器 -->
      <div class="carousel-indicators">
        <span 
          v-for="(_, index) in loginImages" 
          :key="index"
          class="indicator"
          :class="{ active: getDisplayIndex() === index }"
          @click="goToSlide(index)"
        ></span>
      </div>
    </div>

    <div class="page-content" :class="{ 'with-carousel': !isLoggedIn }">
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

                    <el-form-item label="用户角色" prop="role">
                      <el-radio-group v-model="registerForm.role">
                        <el-radio label="user">普通用户</el-radio>
                        <el-radio label="admin">管理员</el-radio>
                      </el-radio-group>
                    </el-form-item>

                    <el-form-item 
                      v-if="registerForm.role === 'admin'" 
                      label="邀请码" 
                      prop="inviteCode"
                    >
                      <el-input 
                        v-model="registerForm.inviteCode" 
                        placeholder="请输入管理员邀请码" 
                        type="password"
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

        <div v-if="isLoggedIn" class="profile-content">
          <!-- Profile Header Card -->
          <div class="profile-header-card glass-panel">
            <div class="header-bg"></div>
            <div class="header-content">
              <div class="avatar-section">
                <el-avatar :src="user?.avatar || defaultAvatar" :size="140" class="main-avatar">
                  {{ user?.name?.charAt(0) }}
                </el-avatar>
              </div>
              <div class="info-section">
                <div class="name-row">
                  <h1>{{ user?.name }}</h1>
                  <el-tag v-if="verificationStatus === 'verified'" type="success" effect="dark" round size="small" class="verified-tag">
                    <el-icon><Select /></el-icon> 认证学者
                  </el-tag>
                  <el-tag v-else-if="verificationStatus === 'pending'" type="warning" effect="dark" round size="small" class="pending-tag">
                    审核中
                  </el-tag>
                </div>
                <p class="title">{{ user?.title || '用户' }}</p>
                <p class="institution">
                  <el-icon><School /></el-icon> 
                  {{ user?.institution || '未设置机构' }}
                </p>
                <div class="bio-preview">{{ user?.bio || '这个人很懒，什么都没有写...' }}</div>
                
                <div class="action-buttons">
                  <el-button 
                    class="gothic-btn"
                    @click="showEditDialog = true"
                  >
                    <el-icon><Edit /></el-icon> 编辑资料
                  </el-button>
                  <el-button 
                    v-if="verificationStatus === 'unverified' || verificationStatus === 'rejected'"
                    class="gothic-btn"
                    @click="showVerificationDialog = true"
                  >
                    <el-icon><DocumentChecked /></el-icon> 申请认证
                  </el-button>
                  <el-button 
                    class="gothic-btn danger-btn"
                    @click="handleLogout"
                  >
                    <el-icon><SwitchButton /></el-icon> 退出登录
                  </el-button>
                </div>
              </div>
              
              <div class="stats-section">
                <div class="stat-box clickable" @click="showFollowingDialog = true">
                  <div class="value">{{ followingCount }}</div>
                  <div class="label">关注</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-box clickable" @click="showFollowersDialog = true">
                  <div class="value">{{ followersCount }}</div>
                  <div class="label">粉丝</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-box">
                  <div class="value">0</div>
                  <div class="label">获赞</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <el-row :gutter="24" class="main-body">
            <!-- Left Column -->
            <el-col :lg="8" :md="24" :sm="24" :xs="24">
              <div class="sidebar-stack">
                <!-- About Card -->
                <div class="glass-panel sidebar-card">
                  <h3><el-icon><UserFilled /></el-icon> 个人信息</h3>
                  <div class="info-group">
                    <label><el-icon><Message /></el-icon> 邮箱</label>
                    <div class="contact-row">{{ user?.email }}</div>
                  </div>
                  <div class="info-group" v-if="user?.bio">
                    <label><el-icon><Document /></el-icon> 个人简介</label>
                    <div class="bio-text">{{ user?.bio }}</div>
                  </div>
                </div>
              </div>
            </el-col>

            <!-- Right Column -->
            <el-col :lg="16" :md="24" :sm="24" :xs="24">
              <div class="glass-panel content-card">
                <!-- 管理员视图 -->
                <el-tabs v-if="isAdmin" v-model="activeTab" class="custom-tabs">
                  <el-tab-pane label="待审核认证" name="certifications">
                    <template #label>
                      <span><el-icon><DocumentChecked /></el-icon> 待审核认证</span>
                    </template>
                    <div class="admin-content">
                      <div v-if="pendingCertifications.length === 0" class="empty-state">
                        <el-empty description="暂无待审核的认证申请" />
                      </div>
                      <div v-else class="certifications-list">
                        <div 
                          v-for="cert in pendingCertifications" 
                          :key="cert.id"
                          class="certification-item glass-panel"
                        >
                          <div class="cert-info">
                            <h4>{{ cert.realName || '未知姓名' }}</h4>
                            <p class="cert-meta">
                              <span><el-icon><School /></el-icon> {{ cert.organization || '未知机构' }}</span>
                              <span><el-icon><Message /></el-icon> {{ cert.orgEmail || '未知邮箱' }}</span>
                              <span><el-icon><UserFilled /></el-icon> {{ cert.title || '未知职称' }}</span>
                            </p>
                            <p v-if="cert.submittedAt" class="cert-time">提交时间：{{ formatDate(cert.submittedAt) }}</p>
                          </div>
                          <div class="cert-actions">
                            <el-button 
                              class="gothic-btn-small"
                              type="success"
                              @click="approveCertification(cert.id)"
                            >
                              <el-icon><Check /></el-icon> 批准
                            </el-button>
                            <el-button 
                              class="gothic-btn-small"
                              type="danger"
                              @click="rejectCertification(cert.id)"
                            >
                              <el-icon><Close /></el-icon> 驳回
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="待处理申诉" name="appeals">
                    <template #label>
                      <span><el-icon><Warning /></el-icon> 待处理申诉</span>
                    </template>
                    <div class="admin-content">
                      <div v-if="pendingAppeals.length === 0" class="empty-state">
                        <el-empty description="暂无待处理的申诉" />
                      </div>
                      <div v-else class="appeals-list">
                        <div 
                          v-for="appeal in pendingAppeals" 
                          :key="appeal.id"
                          class="appeal-item glass-panel"
                        >
                          <div class="appeal-info">
                            <h4>申诉类型：{{ appeal.appealType === 'identity_stolen' ? '身份冒用' : '成果冒领' }}</h4>
                            <p class="appeal-reason">{{ appeal.reason }}</p>
                            <p class="appeal-time">提交时间：{{ formatDate(appeal.createdAt) }}</p>
                          </div>
                          <div class="appeal-actions">
                            <el-button 
                              class="gothic-btn-small"
                              type="success"
                              @click="processAppeal(appeal.id, 'approve')"
                            >
                              <el-icon><Check /></el-icon> 批准
                            </el-button>
                            <el-button 
                              class="gothic-btn-small"
                              type="danger"
                              @click="processAppeal(appeal.id, 'reject')"
                            >
                              <el-icon><Close /></el-icon> 驳回
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="待审核成果" name="achievements">
                    <template #label>
                      <span><el-icon><Document /></el-icon> 待审核成果</span>
                    </template>
                    <div class="admin-content">
                      <div v-if="pendingAchievements.length === 0" class="empty-state">
                        <el-empty description="暂无待审核的成果" />
                      </div>
                      <div v-else class="achievements-list">
                        <div 
                          v-for="achievement in pendingAchievements" 
                          :key="achievement.id"
                          class="achievement-item glass-panel"
                        >
                          <div class="achievement-info">
                            <h4>{{ achievement.title || '未命名成果' }}</h4>
                            <p class="achievement-meta">
                              {{ achievement.authors?.join(', ') || '未知作者' }} · 
                              {{ achievement.journal || '未知期刊' }} · 
                              {{ achievement.year || '未知年份' }}
                            </p>
                          </div>
                          <div class="achievement-actions">
                            <el-button 
                              class="gothic-btn-small"
                              type="success"
                              @click="approveAchievement(achievement.id)"
                            >
                              <el-icon><Check /></el-icon> 批准
                            </el-button>
                            <el-button 
                              class="gothic-btn-small"
                              type="danger"
                              @click="rejectAchievement(achievement.id)"
                            >
                              <el-icon><Close /></el-icon> 驳回
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
                
                <!-- 普通用户视图 -->
                <el-tabs v-else v-model="activeTab" class="custom-tabs">
                  <el-tab-pane label="我的收藏" name="favorites">
                    <template #label>
                      <span><el-icon><Star /></el-icon> 我的收藏</span>
                    </template>
                    <div class="collections-content">
                      <div v-if="collections.length === 0" class="empty-state">
                        <el-empty description="暂无收藏内容" />
                      </div>
                      <div v-else class="collections-list">
                        <div 
                          v-for="item in collections" 
                          :key="item.id"
                          class="collection-item glass-panel"
                        >
                          <div class="item-info">
                            <h4>{{ item.title || '未命名成果' }}</h4>
                            <p class="item-meta">{{ item.authors?.join(', ') || '未知作者' }} · {{ item.year || '未知年份' }}</p>
                          </div>
                          <el-button 
                            class="gothic-btn-small"
                            @click="removeFromCollection(item.id)"
                          >
                            <el-icon><Delete /></el-icon> 取消收藏
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="我的成果" name="achievements">
                    <template #label>
                      <span><el-icon><Document /></el-icon> 我的成果</span>
                    </template>
                    <div class="achievements-content">
                      <div class="achievements-header">
                        <el-button 
                          class="gothic-btn"
                          @click="showAchievementDialog = true; editingAchievement = null"
                        >
                          <el-icon><Plus /></el-icon> 新增成果
                        </el-button>
                      </div>
                      <div v-if="myAchievements.length === 0" class="empty-state">
                        <el-empty description="暂无成果，点击上方按钮添加" />
                      </div>
                      <div v-else class="achievements-list">
                        <div 
                          v-for="achievement in myAchievements" 
                          :key="achievement.id"
                          class="achievement-item glass-panel"
                        >
                          <div class="achievement-info">
                            <div class="achievement-header-row">
                              <h4>{{ achievement.title || '未命名成果' }}</h4>
                              <el-tag 
                                :type="getStatusType(achievement.status)"
                                effect="dark"
                                size="small"
                                class="status-tag"
                              >
                                {{ getStatusText(achievement.status) }}
                              </el-tag>
                            </div>
                            <p class="achievement-meta">
                              {{ achievement.authors?.join(', ') || '未知作者' }} · 
                              {{ achievement.journal || '未知期刊' }} · 
                              {{ achievement.year || '未知年份' }}
                            </p>
                            <p v-if="achievement.doi" class="achievement-doi">DOI: {{ achievement.doi }}</p>
                          </div>
                          <div class="achievement-actions">
                            <el-button 
                              class="gothic-btn-small"
                              @click="editAchievement(achievement)"
                            >
                              <el-icon><Edit /></el-icon> 编辑
                            </el-button>
                            <el-button 
                              class="gothic-btn-small danger-btn"
                              @click="deleteAchievement(achievement.id)"
                            >
                              <el-icon><Delete /></el-icon> 删除
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="浏览历史" name="history">
                    <template #label>
                      <span><el-icon><Clock /></el-icon> 浏览历史</span>
                    </template>
                    <el-empty description="暂无浏览记录" />
                  </el-tab-pane>
                  <el-tab-pane label="我的帖子" name="posts">
                    <template #label>
                      <span><el-icon><ChatLineRound /></el-icon> 我的帖子</span>
                    </template>
                    <el-empty description="暂无发帖记录" />
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <!-- Edit Profile Dialog -->
    <el-dialog v-model="showEditDialog" title="编辑个人资料" width="500px">
      <el-form :model="editForm" label-position="top">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input v-model="editForm.bio" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="研究兴趣">
          <el-select
            v-model="editForm.interests"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="添加标签"
            style="width: 100%"
          >
            <el-option label="人工智能" value="AI" />
            <el-option label="大数据" value="BigData" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Achievement Dialog -->
    <el-dialog 
      v-model="showAchievementDialog" 
      :title="editingAchievement ? '编辑成果' : '新增成果'" 
      width="600px"
      class="gothic-dialog"
    >
      <el-form 
        ref="achievementFormRef"
        :model="achievementForm" 
        label-position="top"
        class="gothic-form"
      >
        <el-form-item label="标题" required>
          <el-input v-model="achievementForm.title" placeholder="请输入成果标题" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input 
            v-model="achievementForm.authorsText" 
            placeholder="请输入作者，多个作者用逗号分隔"
          />
        </el-form-item>
        <el-form-item label="期刊/会议">
          <el-input v-model="achievementForm.journal" placeholder="请输入期刊或会议名称" />
        </el-form-item>
        <el-form-item label="年份">
          <el-date-picker
            v-model="achievementForm.year"
            type="year"
            placeholder="选择年份"
            format="YYYY"
            value-format="YYYY"
          />
        </el-form-item>
        <el-form-item label="DOI">
          <el-input v-model="achievementForm.doi" placeholder="请输入DOI（可选）" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input 
            v-model="achievementForm.abstract" 
            type="textarea" 
            :rows="4"
            placeholder="请输入摘要（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="gothic-btn" @click="showAchievementDialog = false">取消</el-button>
          <el-button class="gothic-btn" type="primary" @click="saveAchievement">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Verification Dialog -->
    <el-dialog v-model="showVerificationDialog" title="学者身份认证" width="500px">
      <el-form 
        ref="verificationFormRef"
        :model="verificationForm" 
        :rules="verificationRules"
        label-position="top"
      >
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="verificationForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        
        <el-form-item label="教育邮箱" prop="email">
          <el-input v-model="verificationForm.email" placeholder="请输入edu邮箱">
            <template #append>
              <el-button 
                @click="handleSendCode" 
                :disabled="codeSending || codeCountdown > 0"
              >
                {{ codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="验证码" prop="code" :rules="[{ required: true, message: '请输入验证码', trigger: 'blur' }]">
          <el-input v-model="verificationForm.code" placeholder="请输入验证码" />
        </el-form-item>
      </el-form>
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

    <!-- Following Dialog -->
    <el-dialog v-model="showFollowingDialog" title="我的关注" width="500px">
      <div v-if="followingList.length === 0" class="empty-state">
        <el-empty description="暂无关注" />
      </div>
      <div v-else class="following-list">
        <div 
          v-for="item in followingList" 
          :key="item.userId || item.id"
          class="following-item"
          @click="router.push(`/scholar/${item.userId || item.id}`)"
        >
          <el-avatar :size="40" :src="item.avatarUrl">
            {{ item.name?.charAt(0) }}
          </el-avatar>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-org">{{ item.organization || '未知机构' }}</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Followers Dialog -->
    <el-dialog v-model="showFollowersDialog" title="我的粉丝" width="500px">
      <div v-if="followersList.length === 0" class="empty-state">
        <el-empty description="暂无粉丝" />
      </div>
      <div v-else class="followers-list">
        <div 
          v-for="item in followersList" 
          :key="item.userId || item.id"
          class="follower-item"
          @click="router.push(`/scholar/${item.userId || item.id}`)"
        >
          <el-avatar :size="40" :src="item.avatarUrl">
            {{ item.name?.charAt(0) }}
          </el-avatar>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-org">{{ item.organization || '未知机构' }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">

import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue'
import type { FormRules, FormInstance } from 'element-plus'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Message, UserFilled, School, Document, Edit, DocumentChecked, SwitchButton,
  Select, Star, Clock, ChatLineRound, Plus, Delete, Check, Close, Warning
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'
import { useSettingsStore } from '../stores/settings'
import * as authApi from '../api/auth'
import * as userApi from '../api/user'
import * as achievementApi from '../api/index'

// 导入登录背景图片
import login1 from '@/assets/login1.png'
import login2 from '@/assets/login2.png'
import login3 from '@/assets/login3.png'
import login4 from '@/assets/login4.png'
import login5 from '@/assets/login5.png'
import login6 from '@/assets/login6.png'
import login7 from '@/assets/login7.png'
import login8 from '@/assets/login8.png'
import login9 from '@/assets/login9.png'
import login10 from '@/assets/login10.png'
import defaultAvatar from '@/assets/profile.png'

// 轮播相关
const loginImages = [login1, login2, login3, login4, login5, login6, login7, login8, login9, login10]
// currentIndex 现在表示实际位置（包括副本），范围是 0 到 loginImages.length + 1
// 0 是最后一张的副本，1 到 loginImages.length 是原始图片，loginImages.length + 1 是第一张的副本
const currentIndex = ref(1) // 从第一张真实图片开始
const isTransitioning = ref(true)
let autoPlayTimer: any = null
let touchStartX = 0
let touchEndX = 0
let isDragging = ref(false)
let dragStartX = 0
let dragOffset = ref(0)

let vantaEffect: any = null
let vantaPromise: Promise<void> | null = null

// 动态加载外部脚本
const loadScript = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script ${src}`))
    document.head.appendChild(script)
  })
}

const ensureVantaBirds = async () => {
  if (typeof window === 'undefined') return
  if (!vantaPromise) {
    vantaPromise = (async () => {
      if (!(window as any).THREE) {
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.min.js')
      }
      if (!(window as any).VANTA || !(window as any).VANTA.BIRDS) {
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js')
      }
    })()
  }
  await vantaPromise
}

// 获取显示的索引（用于指示器）
const getDisplayIndex = () => {
  if (currentIndex.value === 0) {
    return loginImages.length - 1 // 显示最后一张
  } else if (currentIndex.value === loginImages.length + 1) {
    return 0 // 显示第一张
  } else {
    return currentIndex.value - 1 // 显示对应的真实图片
  }
}

// 计算轮播样式
const getCarouselStyle = () => {
  // 总共有 loginImages.length + 2 张图片（原始 + 2个副本）
  const baseOffset = -currentIndex.value * 100
  const dragOffsetPercent = isDragging.value ? (dragOffset.value / window.innerWidth) * 100 : 0
  const totalOffset = baseOffset + dragOffsetPercent
  
  return {
    transform: `translateX(${totalOffset}%)`,
    transition: isTransitioning.value && !isDragging.value ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
  }
}

const router = useRouter()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user || ({} as any))
const isAdmin = computed(() => {
  const role = user.value?.role
  return role === 'ADMIN' || role === 'admin' || role === 'administrator'
})
const authTab = ref('login')
const activeTab = ref(isAdmin.value ? 'certifications' : 'favorites')
const showEditDialog = ref(false)
const loginLoading = ref(false)
const registerLoading = ref(false)

const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user' as 'user' | 'admin' | 'administrator',
  inviteCode: ''
})

const editForm = reactive({
  name: '',
  bio: '',
  interests: []
})

const verificationForm = ref({
  email: '',
  realName: '',
  code: ''
})
const verificationFormRef = ref<FormInstance>()
const verificationStatus = ref('unverified')
const showVerificationDialog = ref(false)
const submittingVerification = ref(false)
const codeSending = ref(false)
const codeCountdown = ref(0)
let codeTimer: any = null
const sentCode = ref('')

// 收藏和成果相关
const collections = ref<any[]>([])
const myAchievements = ref<any[]>([])
const showAchievementDialog = ref(false)

// 关注和粉丝相关
const followingCount = ref(0)
const followersCount = ref(0)
const followingList = ref<any[]>([])
const followersList = ref<any[]>([])
const showFollowingDialog = ref(false)
const showFollowersDialog = ref(false)

// 管理员相关
const pendingCertifications = ref<any[]>([])
const pendingAppeals = ref<any[]>([])
const pendingAchievements = ref<any[]>([])

const editingAchievement = ref<any>(null)
const achievementFormRef = ref<FormInstance>()
const achievementForm = reactive({
  title: '',
  authorsText: '',
  journal: '',
  year: '',
  doi: '',
  abstract: ''
})

const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const registerRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {

      validator: (_rule: any, value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ],
  inviteCode: [
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (registerForm.role === 'admin' && (!value || value.trim() === '')) {
          callback(new Error('请输入管理员邀请码'))
        } else if (registerForm.role === 'admin' && value !== '123456') {
          callback(new Error('邀请码错误'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

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
  ]
}

const handleLogin = async () => {

  loginLoading.value = true
  try {
    console.log('准备发送登录请求，用户名:', loginForm.username)
    const result = await authStore.login(loginForm.username, loginForm.password)
    console.log('登录结果:', result)
    if (result.success) {
      ElMessage.success('登录成功')
      // 刷新用户信息（包括role）
      await authStore.refreshUserInfo()
      // 确保role正确设置后再加载其他数据
      await loadCertificationStatus()
      // 登录成功后跳转到首页
      router.push('/')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    console.error('登录异常:', error)
    ElMessage.error('登录失败')
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  // 验证邀请码
  if (registerForm.role === 'admin') {
    if (!registerForm.inviteCode || registerForm.inviteCode.trim() === '') {
      ElMessage.error('请输入管理员邀请码')
      return
    }
    if (registerForm.inviteCode !== '123456') {
      ElMessage.error('邀请码错误，请输入正确的管理员邀请码')
      return
    }
  }
  
  registerLoading.value = true
  try {
    const result = await authStore.register(
      registerForm.name,
      registerForm.email,
      registerForm.password,
      registerForm.role
    )
    if (result.success) {
      ElMessage.success('注册成功，请登录')
      authTab.value = 'login'
      // 重置表单
      registerForm.name = ''
      registerForm.email = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerForm.role = 'user'
      registerForm.inviteCode = ''
    } else {
      ElMessage.error(result.message || '注册失败')
    }
  } catch (error) {
    ElMessage.error('注册失败')
  } finally {
    registerLoading.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}


// 认证相关方法
const handleSendCode = async () => {
  const email = verificationForm.value.email
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.edu(\.[A-Za-z]{2,})?$/.test(email)) {
    ElMessage.error('请输入有效的edu邮箱')
    return
  }
  codeSending.value = true
  try {
    await authApi.forgotPassword({ email })
    ElMessage.success('验证码已发送到邮箱')
    codeCountdown.value = 60
    codeTimer && clearInterval(codeTimer)
    codeTimer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        clearInterval(codeTimer)
        codeCountdown.value = 0
      }
    }, 1000)
  } catch (error: any) {
    ElMessage.error(error.message || '发送验证码失败')
  } finally {
    codeSending.value = false
  }
}

const handleSubmitVerification = async () => {
  submittingVerification.value = true
  const formRef = verificationFormRef.value
  if (!formRef) return
  formRef.validate(async (valid: boolean) => {
    if (!valid) {
      submittingVerification.value = false
      return
    }
    try {
      await userApi.submitCertification({
        realName: verificationForm.value.realName,
        organization: '', // 需要从表单获取
        orgEmail: verificationForm.value.email,
        title: '', // 需要从表单获取
        proofMaterials: []
      })
      verificationStatus.value = 'pending'
      showVerificationDialog.value = false
      submittingVerification.value = false
      ElMessage.success('认证申请已提交，等待审核')
      resetVerificationForm()
      await loadCertificationStatus()
    } catch (error: any) {
      ElMessage.error(error.message || '提交认证申请失败')
      submittingVerification.value = false
    }
  })
}

const saveProfile = async () => {
  console.log('saveProfile called', editForm)
  try {
    await userApi.updateCurrentUser({
      username: editForm.name,
      preferences: {
        bio: editForm.bio,
        interests: editForm.interests
      }
    })
    ElMessage.success('保存成功')
    await authStore.refreshUserInfo()
    showEditDialog.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  }
}

// 加载收藏
const loadCollections = async () => {
  try {
    const response = await achievementApi.getMyCollections()
    collections.value = response || []
  } catch (error) {
    console.error('加载收藏失败', error)
    collections.value = []
  }
}

// 取消收藏
const removeFromCollection = async (achievementId: string) => {
  try {
    await achievementApi.removeFromCollections(achievementId)
    ElMessage.success('已取消收藏')
    await loadCollections()
  } catch (error: any) {
    ElMessage.error(error.message || '取消收藏失败')
  }
}

// 加载关注和粉丝列表
import * as socialApi from '../api/social'

const loadFollowingAndFollowers = async () => {
  if (!user.value?.id) return
  try {
    // 加载关注列表
    const followingResponse = await socialApi.getFollowing(user.value.id)
    if (followingResponse) {
      // 后端返回格式：{ following: [...], total: number }
      const data = followingResponse.following || followingResponse.data?.following || []
      followingList.value = data
      followingCount.value = followingResponse.total || followingResponse.data?.total || data.length
    }
    
    // 加载粉丝列表
    const followersResponse = await socialApi.getFollowers(user.value.id)
    if (followersResponse) {
      // 后端返回格式：{ followers: [...], total: number }
      const data = followersResponse.followers || followersResponse.data?.followers || []
      followersList.value = data
      followersCount.value = followersResponse.total || followersResponse.data?.total || data.length
    }
  } catch (error) {
    console.error('加载关注和粉丝列表失败', error)
    // 如果API调用失败，设置默认值
    followingCount.value = 0
    followersCount.value = 0
  }
}

// 加载管理员数据
import * as adminApi from '../api/admin'

const loadAdminData = async () => {
  if (!isAdmin.value) return
  
  try {
    // 加载待审核认证
    const certsResponse = await adminApi.getPendingCertifications()
    pendingCertifications.value = Array.isArray(certsResponse) ? certsResponse : (certsResponse?.applications || [])
    
    // 加载待处理申诉
    try {
      const appealsResponse = await adminApi.getPendingAppeals()
      pendingAppeals.value = Array.isArray(appealsResponse) ? appealsResponse : (appealsResponse?.appeals || [])
    } catch (error) {
      console.warn('加载申诉列表失败:', error)
      pendingAppeals.value = []
    }
    
    // 加载待审核成果
    try {
      const achievementsResponse = await adminApi.getPendingAchievements()
      pendingAchievements.value = Array.isArray(achievementsResponse) ? achievementsResponse : (achievementsResponse?.pendingAchievements || [])
    } catch (error) {
      console.warn('加载待审核成果失败:', error)
      pendingAchievements.value = []
    }
  } catch (error) {
    console.error('加载管理员数据失败', error)
  }
}

// 批准认证
const approveCertification = async (certId: string) => {
  try {
    await ElMessageBox.confirm('确定要批准这个认证申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await adminApi.approveCertification(certId)
    ElMessage.success('认证已批准')
    await loadAdminData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 驳回认证
const rejectCertification = async (certId: string) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入驳回理由', '驳回认证', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入驳回理由'
    })
    if (reason) {
      await adminApi.rejectCertification(certId, reason)
      ElMessage.success('认证已驳回')
      await loadAdminData()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 处理申诉
const processAppeal = async (caseId: string, action: 'approve' | 'reject') => {
  try {
    let reason = ''
    if (action === 'reject') {
      const { value } = await ElMessageBox.prompt('请输入驳回理由', '处理申诉', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请输入驳回理由'
      })
      if (!value) return
      reason = value
    }
    
    await adminApi.processAppeal(caseId, action, reason)
    ElMessage.success(action === 'approve' ? '申诉已批准' : '申诉已驳回')
    await loadAdminData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 批准成果
const approveAchievement = async (achId: string) => {
  try {
    await ElMessageBox.confirm('确定要批准这个成果吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await adminApi.approveAchievement(achId)
    ElMessage.success('成果已批准')
    await loadAdminData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 驳回成果
const rejectAchievement = async (achId: string) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入驳回理由', '驳回成果', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入驳回理由'
    })
    if (reason) {
      await adminApi.rejectAchievement(achId, reason)
      ElMessage.success('成果已驳回')
      await loadAdminData()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '未知'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('zh-CN')
}

// 加载我的成果
const loadMyAchievements = async () => {
  try {
    const response = await achievementApi.searchAchievements({ owner: 'me' })
    myAchievements.value = response?.results || response || []
  } catch (error) {
    console.error('加载成果失败', error)
    myAchievements.value = []
  }
}

// 编辑成果
const editAchievement = (achievement: any) => {
  editingAchievement.value = achievement
  achievementForm.title = achievement.title || ''
  achievementForm.authorsText = achievement.authors?.join(', ') || ''
  achievementForm.journal = achievement.journal || ''
  achievementForm.year = achievement.year?.toString() || ''
  achievementForm.doi = achievement.doi || ''
  achievementForm.abstract = achievement.abstract || ''
  showAchievementDialog.value = true
}

// 保存成果
const saveAchievement = async () => {
  try {
    const data = {
      title: achievementForm.title,
      authors: achievementForm.authorsText.split(',').map(a => a.trim()).filter(a => a),
      journal: achievementForm.journal,
      year: achievementForm.year ? parseInt(achievementForm.year) : undefined,
      doi: achievementForm.doi,
      abstract: achievementForm.abstract
    }
    
    if (editingAchievement.value) {
      // 更新成果
      if (achievementApi.updateAchievement) {
        await achievementApi.updateAchievement(editingAchievement.value.id, data)
      }
      ElMessage.success('更新成功')
    } else {
      // 新增成果
      if (achievementApi.createAchievement) {
        await achievementApi.createAchievement(data)
      }
      ElMessage.success('添加成功')
    }
    
    showAchievementDialog.value = false
    resetAchievementForm()
    await loadMyAchievements()
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  }
}

// 删除成果
const deleteAchievement = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个成果吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    if (achievementApi.deleteAchievement) {
      await achievementApi.deleteAchievement(id)
    }
    ElMessage.success('删除成功')
    await loadMyAchievements()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 重置成果表单
const resetAchievementForm = () => {
  editingAchievement.value = null
  achievementForm.title = ''
  achievementForm.authorsText = ''
  achievementForm.journal = ''
  achievementForm.year = ''
  achievementForm.doi = ''
  achievementForm.abstract = ''
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'approved':
    case 'published':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'approved':
    case 'published':
      return '已发布'
    case 'pending':
      return '审核中'
    case 'rejected':
      return '被拒绝'
    default:
      return '未知'
  }
}

const loadCertificationStatus = async () => {
  if (!authStore.isLoggedIn) return
  try {
    const response = await userApi.getCertificationStatus()
    if (response.status) {
      const status = String(response.status)
      verificationStatus.value = status === 'certified' ? 'verified' : 
                                  status === 'pending' ? 'pending' :
                                  status === 'rejected' ? 'rejected' : 'unverified'
    }
  } catch (error) {
    // 如果接口返回404或其他错误，说明未申请认证
    verificationStatus.value = 'unverified'
  }
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

// 轮播方法
const startAutoPlay = () => {
  if (autoPlayTimer) clearInterval(autoPlayTimer)
  autoPlayTimer = setInterval(() => {
    nextSlide()
  }, 3000)
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

const nextSlide = () => {
  isTransitioning.value = true
  currentIndex.value++
  
  // 如果滑动到第一张的副本（最后一张后面），等待动画完成后跳转到真实的第一张
  if (currentIndex.value === loginImages.length + 1) {
    setTimeout(() => {
      isTransitioning.value = false
      currentIndex.value = 1
      // 使用 requestAnimationFrame 确保在下一帧恢复动画
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isTransitioning.value = true
        })
      })
    }, 800) // 等待动画完成（0.8s）
  }
}

const prevSlide = () => {
  isTransitioning.value = true
  currentIndex.value--
  
  // 如果滑动到最后一张的副本（第一张前面），等待动画完成后跳转到真实的最后一张
  if (currentIndex.value === 0) {
    setTimeout(() => {
      isTransitioning.value = false
      currentIndex.value = loginImages.length
      // 使用 requestAnimationFrame 确保在下一帧恢复动画
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isTransitioning.value = true
        })
      })
    }, 800) // 等待动画完成（0.8s）
  }
}

const goToSlide = (index: number) => {
  isTransitioning.value = true
  // index 是 0 到 loginImages.length - 1，需要转换为 1 到 loginImages.length
  currentIndex.value = index + 1
  stopAutoPlay()
  startAutoPlay()
}

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX
  isTransitioning.value = false
  stopAutoPlay()
}

const handleTouchMove = (e: TouchEvent) => {
  touchEndX = e.touches[0].clientX
  const diff = touchEndX - touchStartX
  dragOffset.value = -diff
  isDragging.value = true
}

const handleTouchEnd = () => {
  isDragging.value = false
  isTransitioning.value = true
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }
  dragOffset.value = 0
  startAutoPlay()
}

// 鼠标拖拽事件处理
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  dragStartX = e.clientX
  dragOffset.value = 0
  isTransitioning.value = false
  stopAutoPlay()
  e.preventDefault()
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  dragOffset.value = e.clientX - dragStartX
}

const handleMouseUp = () => {
  if (!isDragging.value) return
  const offset = dragOffset.value
  isDragging.value = false
  isTransitioning.value = true
  
  if (Math.abs(offset) > 50) {
    if (offset > 0) {
      prevSlide()
    } else {
      nextSlide()
    }
  }
  dragOffset.value = 0
  startAutoPlay()
}

onMounted(async () => {
  await authStore.initAuth()
  settingsStore.loadSettings()
  
  if (authStore.isLoggedIn) {
    await loadCertificationStatus()
    if (isAdmin.value) {
      await loadAdminData()
      activeTab.value = 'certifications'
    } else {
      await loadCollections()
      await loadMyAchievements()
      await loadFollowingAndFollowers()
    }
    await ensureVantaBirds()
    // 等待 DOM 渲染后再初始化 Vanta.js
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).VANTA) {
        vantaEffect = (window as any).VANTA.BIRDS({
          el: '#vanta-birds-bg',
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
          quantity: 5.00,
          wingSpan: 30.00,
          speedLimit: 5.00,
          separation: 20.00,
          alignment: 20.00,
          cohesion: 20.00
        })
      }
    }, 100)
  } else {
    // 未登录时启动轮播
    startAutoPlay()
  }
})

onUnmounted(() => {
  stopAutoPlay()
  // 清理 Vanta.js 实例
  if (vantaEffect) {
    vantaEffect.destroy()
  }
})
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  position: relative;
  background-image: url('@/assets/frontBG.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  padding-bottom: 40px;
}

// Vanta.js Birds 背景样式
.vanta-background {
  position: fixed;
  top: 64px; // 导航栏高度
  left: 0;
  width: 100%;
  height: calc(100vh - 64px);
  z-index: 0;
  pointer-events: none;
}

// 登录背景轮播样式
.login-carousel-container {
  position: fixed;
  top: 64px; // 导航栏高度，从导航栏下方开始
  left: 0;
  width: 100%;
  height: calc(100vh - 64px); // 减去导航栏高度
  z-index: 0;
  overflow: hidden;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }

  .carousel-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    will-change: transform;
    backface-visibility: hidden;
    perspective: 1000px;
  }

  .carousel-item {
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    background-size: 100% auto;
    background-position: center top;
    background-repeat: no-repeat;
    will-change: transform;
  }

  .carousel-indicators {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 10;

    .indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.8);
        transform: scale(1.2);
      }

      &.active {
        background-color: rgba(255, 255, 255, 1);
        width: 24px;
        border-radius: 5px;
      }
    }
  }
}

.page-content {
  position: relative;
  z-index: 1;

  &.with-carousel {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 64px);
    
    .auth-section {
      width: 100%;
      max-width: 450px;
      margin: 0 auto;
      
      .auth-card {
        background-image: url('@/assets/bg1.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border: 2px solid rgba(0, 0, 0, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 
                    0 2px 8px rgba(0, 0, 0, 0.2);
        border-radius: 16px;
        overflow: hidden;
        position: relative;

        // 中世纪装饰边框
        &::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(
            45deg,
            rgba(212, 175, 55, 0.3) 0%,
            transparent 25%,
            transparent 75%,
            rgba(212, 175, 55, 0.3) 100%
          );
          border-radius: 16px;
          z-index: -1;
          opacity: 0.6;
        }

        :deep(.el-card__body) {
          padding: 40px 35px;
          position: relative;
        }

        .auth-tabs {
          :deep(.el-tabs__header) {
            margin-bottom: 30px;
          }

          :deep(.el-tabs__nav-wrap::after) {
            background: rgba(0, 0, 0, 0.2);
            height: 2px;
          }

          :deep(.el-tabs__item) {
            color: #000;
            font-weight: 700;
            font-size: 20px;
            font-family: 'Georgia', 'Times New Roman', serif;

            &.is-active {
              color: #000;
              font-weight: 700;
              text-shadow: none;
            }

            &:hover {
              color: #000;
            }
          }

          :deep(.el-tabs__active-bar) {
            display: none;
          }

          :deep(.el-form-item__label) {
            color: #000;
            font-weight: 700;
            font-family: 'Georgia', 'Times New Roman', serif;
            text-shadow: none;
          }

          :deep(.el-input__wrapper) {
            background-color: rgba(255, 255, 255, 0.9);
            border: 2px solid rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;

            &:hover {
              background-color: rgba(255, 255, 255, 0.95);
              border-color: rgba(0, 0, 0, 0.5);
            }

            &.is-focus {
              background-color: #fff;
              border-color: #000;
              box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.2);
            }
          }

          :deep(.el-input__inner) {
            color: #000;
            font-weight: 600;
            font-family: 'Georgia', 'Times New Roman', serif;

            &::placeholder {
              color: rgba(0, 0, 0, 0.5);
            }
          }

          :deep(.el-input__prefix) {
            .el-icon {
              color: #000;
            }
          }

          :deep(.el-input__suffix) {
            .el-icon {
              color: #000;
            }
          }

          :deep(.el-button--primary) {
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            font-weight: 700;
            color: #fff;
            text-shadow: none;
            transition: all 0.3s ease;
            font-family: 'Georgia', 'Times New Roman', serif;

            &:hover {
              background: #000;
              border-color: #000;
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
              transform: translateY(-2px);
            }

            &:active {
              transform: translateY(0);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
          }

          :deep(.el-alert) {
            background-color: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;

            .el-alert__content {
              .el-alert__title {
                color: rgba(255, 255, 255, 0.95);
              }

              .el-alert__description {
                color: rgba(255, 255, 255, 0.85);
              }
            }
          }
        }
      }
    }
  }

}
/* Auth Styles */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 60vh;
  position: relative;
  z-index: 2;
  padding: 20px;

  .auth-card {
    width: 100%;
    max-width: 420px;
  }
}

// 登录页面样式
.profile-page.login-page {
  :deep(.page-header) {
    background-image: url('@/assets/bg1.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-bottom: 2px solid rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  :deep(.page-header .container) {
    .logo-link {
      .logo-text {
        color: #000 !important;
        text-shadow: none;
        font-family: 'Georgia', 'Times New Roman', serif;
        font-weight: 700;
      }

      .el-icon {
        color: #000 !important;
        filter: none;
      }
    }

    .nav-menu {
      :deep(.el-menu-item) {
        color: #000 !important;
        font-family: 'Georgia', 'Times New Roman', serif;
        font-weight: 700;

        &.is-active {
          color: #000 !important;
          border-bottom-color: #000 !important;
          text-shadow: none;
        }

        &:hover {
          color: #000 !important;
          background-color: rgba(0, 0, 0, 0.1) !important;
        }

        &.user-menu-item {
          .user-avatar-wrapper {
            .user-avatar {
              border-color: #000 !important;
            }

            .user-name {
              color: #000 !important;
              font-weight: 700 !important;
            }

            .user-icon {
              color: #000 !important;
            }
          }
        }
      }
    }

    .search-wrapper {
      :deep(.el-input__wrapper) {
        background-color: rgba(255, 255, 255, 0.9) !important;
        border: 2px solid rgba(0, 0, 0, 0.3) !important;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

        .el-input__inner {
          color: #000 !important;
          font-weight: 600;

          &::placeholder {
            color: rgba(0, 0, 0, 0.5) !important;
          }
        }

        .el-icon {
          color: #000 !important;
        }
      }
    }
  }
}

.profile-content {
  padding-top: 20px;
  position: relative;
  z-index: 1;
}

.profile-header-card {
  margin-top: 30px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;

  .header-bg {
    height: 140px;
    background: linear-gradient(135deg, 
      rgba(212, 175, 55, 0.3) 0%, 
      rgba(184, 134, 11, 0.4) 50%,
      rgba(139, 69, 19, 0.3) 100%);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(184, 134, 11, 0.2) 0%, transparent 50%);
    }
  }

  .header-content {
    padding: 0 40px 30px;
    display: flex;
    align-items: flex-end;
    gap: 30px;
    margin-top: -70px;
    position: relative;
    z-index: 1;

    .avatar-section {
      position: relative;
      
      .main-avatar {
        border: 5px solid #D4AF37;
        box-shadow: 
          0 6px 20px rgba(0,0,0,0.3),
          0 0 0 3px rgba(184, 134, 11, 0.4),
          inset 0 2px 4px rgba(255, 255, 255, 0.4);
        background: #fff;
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 
            0 8px 24px rgba(0,0,0,0.35),
            0 0 0 4px rgba(212, 175, 55, 0.5);
        }
      }
    }

    .info-section {
      flex: 1;
      padding-bottom: 5px;

      .name-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        
        h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: 900;
          color: #654321;
          font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
          letter-spacing: 0.5px;
        }

        .verified-tag {
          background: #D4AF37 !important;
          border-color: #B8860B !important;
          color: #654321 !important;
          font-weight: 700;
        }

        .pending-tag {
          background: #E6A23C !important;
          border-color: #B8860B !important;
          color: #654321 !important;
          font-weight: 700;
        }
      }

      .title { 
        margin: 5px 0; 
        font-size: 18px; 
        color: #8B4513;
        font-style: italic;
        font-family: 'Georgia', 'Times New Roman', serif;
      }
      
      .institution { 
        margin: 0 0 12px 0; 
        color: #B8860B; 
        display: flex; 
        align-items: center; 
        gap: 6px;
        font-weight: 600;
        font-family: 'Georgia', 'Times New Roman', serif;
        
        :deep(.el-icon) {
          color: #D4AF37;
        }
      }

      .bio-preview {
        color: #654321;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 15px;
        max-height: 60px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }

      .action-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
    }

    .stats-section {
      display: flex;
      gap: 20px;
      padding-bottom: 10px;
      align-items: center;

      .stat-box {
        text-align: center;
        min-width: 80px;
        
        &.clickable {
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
            
            .value {
              color: #D4AF37;
            }
          }
        }
        
        .value { 
          font-size: 28px; 
          font-weight: 900; 
          color: #654321;
          font-family: 'Georgia', 'Times New Roman', serif;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
          transition: color 0.3s ease;
        }
        
        .label { 
          font-size: 12px; 
          color: #8B4513; 
          text-transform: uppercase; 
          letter-spacing: 1px;
          font-weight: 700;
          margin-top: 4px;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
      }

      .stat-divider {
        width: 2px;
        height: 40px;
        background: linear-gradient(to bottom, 
          transparent 0%, 
          rgba(184, 134, 11, 0.5) 50%, 
          transparent 100%);
      }
    }
  }
}

.main-body {
  .sidebar-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .sidebar-card {
    padding: 24px;
    
    h3 { 
      margin: 0 0 18px 0; 
      font-size: 18px; 
      font-weight: 900;
      color: #654321;
      font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif;
      display: flex;
      align-items: center;
      gap: 8px;
      border-left: 4px solid #D4AF37;
      padding-left: 12px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
      
      :deep(.el-icon) {
        color: #D4AF37;
        font-size: 20px;
      }
    }

    .info-group {
      margin-bottom: 24px;
      &:last-child { margin-bottom: 0; }

      label { 
        display: flex;
        align-items: center;
        gap: 6px;
        color: #8B4513; 
        font-size: 13px; 
        font-weight: 700;
        margin-bottom: 10px;
        font-family: 'Georgia', 'Times New Roman', serif;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        
        :deep(.el-icon) {
          color: #D4AF37;
        }
      }

      .contact-row {
        color: #654321;
        font-size: 14px;
        font-weight: 600;
      }

      .bio-text {
        color: #654321;
        line-height: 1.8;
        font-size: 14px;
        font-family: 'Georgia', 'Times New Roman', serif;
      }
    }
  }

  .content-card {
    padding: 24px;
    min-height: 500px;

    :deep(.el-tabs__header) {
      margin-bottom: 20px;
      border-bottom: 2px solid rgba(184, 134, 11, 0.3);
    }

    :deep(.el-tabs__item) {
      font-weight: 700;
      color: #8B4513;
      font-family: 'Georgia', 'Times New Roman', serif;
      
      &.is-active {
        color: #654321;
      }
    }

    :deep(.el-tabs__active-bar) {
      background-color: #D4AF37;
      height: 3px;
    }

    // 收藏和成果内容样式
    .collections-content,
    .achievements-content {
      .achievements-header {
        margin-bottom: 20px;
        display: flex;
        justify-content: flex-end;
      }

      .empty-state {
        padding: 40px 0;
      }

      .collections-list,
      .achievements-list {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .collection-item,
        .achievement-item {
          padding: 20px;
          border: 2px solid rgba(184, 134, 11, 0.4);
          border-radius: 12px;
          background: rgba(249, 247, 236, 0.85);
          backdrop-filter: blur(16px);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;

          &::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, 
              rgba(212, 175, 55, 0.2) 0%, 
              transparent 25%, 
              transparent 75%, 
              rgba(212, 175, 55, 0.2) 100%);
            border-radius: 12px;
            z-index: -1;
            opacity: 0.6;
          }

          &:hover {
            transform: translateY(-3px);
            box-shadow: 
              0 8px 24px rgba(0, 0, 0, 0.15),
              0 0 0 2px rgba(212, 175, 55, 0.3);
          }

          .item-info,
          .achievement-info {
            flex: 1;

            h4 {
              margin: 0 0 8px 0;
              font-size: 18px;
              font-weight: 900;
              color: #654321;
              font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif;
              text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
            }

            .achievement-header-row {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 8px;

              .status-tag {
                font-weight: 700;
                font-family: 'Georgia', 'Times New Roman', serif;
              }
            }

            .item-meta,
            .achievement-meta {
              margin: 4px 0;
              color: #8B4513;
              font-size: 14px;
              font-weight: 600;
              font-family: 'Georgia', 'Times New Roman', serif;
            }

            .achievement-doi {
              margin: 8px 0 0 0;
              color: #B8860B;
              font-size: 13px;
              font-style: italic;
              font-family: 'Georgia', 'Times New Roman', serif;
            }
          }

          .achievement-actions {
            display: flex;
            gap: 8px;
          }
        }
      }
    }
  }
}

.gothic-btn-small {
  background: #8B4513 !important;
  border: 2px solid #654321 !important;
  color: #fff !important;
  font-weight: 700 !important;
  font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif !important;
  letter-spacing: 0.5px !important;
  border-radius: 16px !important;
  padding: 6px 16px !important;
  font-size: 13px !important;
  transition: all 0.3s ease !important;
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;

  &:hover {
    background: #654321 !important;
    border-color: #8B4513 !important;
    transform: translateY(-2px);
    box-shadow: 
      0 4px 10px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  }

  &.danger-btn {
    background: rgba(184, 134, 11, 0.2) !important;
    border-color: #B8860B !important;
    color: #654321 !important;
    
    &:hover {
      background: rgba(184, 134, 11, 0.3) !important;
    }
  }

  :deep(.el-icon) {
    margin-right: 4px;
  }
}

.gothic-dialog {
  :deep(.el-dialog) {
    background: rgba(249, 247, 236, 0.95) !important;
    border: 3px solid rgba(184, 134, 11, 0.5) !important;
    border-radius: 16px !important;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  }

  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, 
      rgba(212, 175, 55, 0.2) 0%, 
      rgba(184, 134, 11, 0.3) 100%);
    border-bottom: 2px solid rgba(184, 134, 11, 0.4);
    padding: 20px 24px;
    
    .el-dialog__title {
      color: #654321;
      font-weight: 900;
      font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif;
      font-size: 20px;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

.gothic-form {
  :deep(.el-form-item__label) {
    color: #8B4513;
    font-weight: 700;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  :deep(.el-input__wrapper) {
    background-color: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(184, 134, 11, 0.4);
    border-radius: 8px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(184, 134, 11, 0.6);
    }

    &.is-focus {
      border-color: #D4AF37;
      box-shadow: 
        inset 0 2px 4px rgba(0, 0, 0, 0.15), 
        0 2px 8px rgba(212, 175, 55, 0.3);
    }
  }

  :deep(.el-textarea__inner) {
    background-color: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(184, 134, 11, 0.4);
    border-radius: 8px;
    color: #654321;
    font-family: 'Georgia', 'Times New Roman', serif;

    &:focus {
      border-color: #D4AF37;
    }
  }
}

.gothic-btn {
  background: #8B4513 !important;
  border: 2px solid #654321 !important;
  color: #fff !important;
  font-weight: 700 !important;
  font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif !important;
  letter-spacing: 1px !important;
  border-radius: 20px !important;
  padding: 10px 20px !important;
  transition: all 0.3s ease !important;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;

  &:hover {
    background: #654321 !important;
    border-color: #8B4513 !important;
    transform: translateY(-2px);
    box-shadow: 
      0 6px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  }

  &.danger-btn {
    background: rgba(184, 134, 11, 0.2) !important;
    border-color: #B8860B !important;
    color: #654321 !important;
    
    &:hover {
      background: rgba(184, 134, 11, 0.3) !important;
    }
  }

  :deep(.el-icon) {
    margin-right: 4px;
  }
}


    .profile-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      .stat-item {
        text-align: center;
        background: #f8f9fa;
        border-radius: 12px;
        padding: 12px 8px;
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;

        &:hover {
          background: #f0f2f5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #1890ff;
          margin-bottom: 4px;
        }

        .stat-label {
          display: block;
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }
      }
    }

    .profile-actions {
      text-align: center;

      .el-button {
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        }
      }
    }
  


    .info-content {
      position: relative;
      z-index: 1;

      h4 {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 700;
        color: #2c3e50;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
      }

      .research-fields {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 24px;

        .el-tag {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(24, 144, 255, 0.3);
          color: #1890ff;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(24, 144, 255, 0.1);
            border-color: #1890ff;
            transform: translateY(-2px);
          }
        }
      }

      p {
        margin: 12px 0;
        color: #34495e;
        font-weight: 500;
        font-size: 15px;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);

        strong {
          color: #2c3e50;
          font-weight: 700;
        }
      }
      .edit-avatar-btn {
        position: absolute;
        bottom: 0;
        right: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
    }


    // 认证相关样式
    .verification-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 1;

      h4 {
        margin-bottom: 16px;
        color: #2c3e50;
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
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
        font-size: 13px;
        color: #34495e;
        margin: 8px 0 0 0;
        font-weight: 500;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
      }
    }

      .name-row {
        display: flex;
        align-items: center;
        gap: 10px;
        h1 { margin: 0; font-size: 28px; color: #303133; }
      }


      .managed-papers {
        h5 {
          margin-bottom: 16px;
          font-size: 18px;
          font-weight: 700;
          color: #2c3e50;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }

        .papers-list {
          .managed-paper-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 12px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;

            &:hover {
              background: rgba(255, 255, 255, 0.85);
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .paper-info {
              flex: 1;

              .paper-title {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
                color: #2c3e50;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
              }

              .paper-meta {
                margin: 4px 0;
                font-size: 14px;
                color: #34495e;
                font-weight: 500;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
              }

              .paper-stats {
                display: flex;
                gap: 16px;
                font-size: 13px;
                color: #34495e;
                font-weight: 500;
                margin-top: 8px;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
              }
            }

            .paper-actions {
              display: flex;
              gap: 8px;

              .el-button {
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(24, 144, 255, 0.3);
                color: #1890ff;
                font-weight: 600;
                backdrop-filter: blur(10px);

                &:hover {
                  background: #1890ff;
                  color: #fff;
                  border-color: #1890ff;
                }
              }
            }
          }
        }

        .empty-papers {
          text-align: center;
          padding: 40px 0;
          color: #34495e;
          font-weight: 500;
        }
      }
    


.content-card {
  padding: 20px;
  min-height: 400px;
}

.sidebar-card {
  padding: 20px;
  h3 { margin: 0 0 20px 0; font-size: 16px; color: #303133; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    text-align: center;

    .stat-item {
      .value { font-size: 20px; font-weight: 700; color: #303133; }
      .label { font-size: 12px; color: #909399; margin-top: 5px; }
    }
  }
}

@media (max-width: 768px) {
  .profile-header-card .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -40px;

    .info-section {
      .name-row { justify-content: center; }
      .email { justify-content: center; }
    }
  }
}
// 关注和粉丝列表样式
.following-list,
.followers-list {
  max-height: 400px;
  overflow-y: auto;
  
  .following-item,
  .follower-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(212, 175, 55, 0.1);
      transform: translateX(4px);
    }
    
    .item-info {
      flex: 1;
      
      .item-name {
        font-size: 16px;
        font-weight: 600;
        color: #654321;
        margin-bottom: 4px;
      }
      
      .item-org {
        font-size: 13px;
        color: #8B4513;
      }
    }
  }
}
</style>
