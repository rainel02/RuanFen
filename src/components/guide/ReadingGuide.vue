<template>
  <div class="reading-guide retro-theme">
    <!-- 顶部导航 -->
    <div class="guide-stepper glass-panel">
      <div class="stepper-content">
          <div class="custom-steps">
            <div 
              v-for="(step, index) in store.steps" 
              :key="index" 
              class="custom-step-item"
              :class="{ active: store.currentSectionIndex === index, completed: store.currentSectionIndex > index }"
              @click="store.setSection(index)"
            >
               <span class="step-number" v-if="store.currentSectionIndex <= index">{{ index + 1 }}</span>
               <el-icon class="step-icon" v-else><Check /></el-icon>
               <span class="step-text" :title="step">{{ formatStepTitle(step) }}</span>
            </div>
          </div>
      </div>
      <div class="stepper-actions">
          <el-button type="primary" link @click="handleAIReParse">
              <el-icon><MagicStick /></el-icon> AI 智能识别生成
          </el-button>
          <el-button type="success" link @click="store.exportRecords">
              <el-icon><Download /></el-icon> 导出记录
          </el-button>
      </div>
    </div>

    <div class="guide-body">
      <!-- 左侧：原文 -->
      <div class="original-text-panel glass-panel">
        <div class="panel-header">
          <h3 class="text-retro-brown">原文内容</h3>
          <el-tag effect="dark" color="#8B4513" class="section-title-tag" :title="currentSection?.title">
            {{ currentSection?.title }}
          </el-tag>
        </div>
        
        <div 
            class="text-content" 
            ref="textContentRef"
            @mouseup="handleTextSelection"
        >
          <pre>{{ currentSection?.content }}</pre>
          
          <!-- 浮动工具栏 -->
          <div 
            v-if="selectionMenu.visible" 
            class="selection-menu"
            :style="{ top: selectionMenu.y + 'px', left: selectionMenu.x + 'px' }"
          >
            <el-button-group>
                <el-button size="small" type="primary" @click="handleSummarizeSelection">
                    <el-icon><EditPen /></el-icon> 总结
                </el-button>
                <el-button size="small" type="warning" @click="handleExplainSelection">
                    <el-icon><QuestionFilled /></el-icon> 解释
                </el-button>
                <el-button size="small" type="success" @click="handleTranslateSelection">
                    <el-icon><Switch /></el-icon> 翻译
                </el-button>
                <el-button size="small" type="info" @click="handleAskSelection">
                    <el-icon><ChatLineRound /></el-icon> 询问
                </el-button>
                <el-button size="small" color="#8B4513" @click="handleCreateMindCard">
                    <el-icon><Collection /></el-icon> 生成思维卡片
                </el-button>
            </el-button-group>
          </div>
        </div>
      </div>

      <!-- 右侧：AI 导读与卡片 -->
      <div class="ai-guide-panel glass-panel">
        <el-tabs v-model="activeTab" class="retro-tabs">
            <el-tab-pane label="AI 导读" name="guide">
                <div class="panel-header">
                  <h3 class="text-retro-brown">智能解读</h3>
                  <el-button 
                    type="primary" 
                    size="small" 
                    color="#8B4513"
                    :loading="store.isAnalyzing"
                    @click="store.analyzeCurrentSection()"
                  >
                    {{ hasAnalysis ? '重新分析' : '开始解读' }}
                  </el-button>
                </div>
                
                <div 
                    class="analysis-content" 
                    v-loading="store.isAnalyzing"
                    element-loading-text="AI 正在深度思考中..."
                    element-loading-background="rgba(255, 255, 255, 0.8)"
                >
                  <div v-if="hasAnalysis" class="markdown-body" v-html="renderedAnalysis"></div>
                  <div v-else class="empty-state">
                    <el-empty description="点击上方按钮开始 AI 解读" image-size="100" />
                  </div>
                </div>
            </el-tab-pane>
            
            <el-tab-pane label="思维卡片" name="cards">
                <div class="cards-container">
                    <div v-if="currentCards.length === 0" class="empty-cards">
                        <el-empty description="选中左侧原文生成思维卡片" image-size="80" />
                    </div>
                    <transition-group name="list">
                        <div v-for="card in currentCards" :key="card.id" class="mind-card">
                            <div class="card-header">
                                <h4>{{ card.title }}</h4>
                                <el-tag size="small" effect="plain">{{ card.concept }}</el-tag>
                            </div>
                            <div class="card-body">
                                <p class="definition"><strong>定义：</strong>{{ card.definition }}</p>
                                <div class="key-points">
                                    <p v-for="(point, idx) in card.keyPoints" :key="idx">
                                        • {{ point }}
                                    </p>
                                </div>
                                <div class="implication">
                                    <el-icon><opportunity /></el-icon>
                                    <span>{{ card.implication }}</span>
                                </div>
                            </div>
                        </div>
                    </transition-group>
                </div>
            </el-tab-pane>

            <el-tab-pane label="AI 对话" name="chat">
                <!-- 聊天记录区域 -->
                <div class="chat-history-area">
                    <div v-if="store.chatHistory.length === 0" class="empty-chat">
                        <el-empty description="有问题？随时问我！" image-size="80" />
                    </div>
                    <div v-else v-for="(msg, index) in store.chatHistory" :key="index" :class="['chat-message', msg.role]">
                        <div class="message-content">
                            <span class="role-label">{{ msg.role === 'user' ? '我' : 'AI' }}:</span>
                            {{ msg.content }}
                        </div>
                    </div>
                </div>

                <!-- 简单的对话框 -->
                <div class="chat-input-area">
                   <el-input
                    v-model="userQuestion"
                    type="textarea"
                    :autosize="{ minRows: 1, maxRows: 4 }"
                    placeholder="针对这一部分提问... (Enter 发送)"
                    @keydown.enter.prevent="askQuestion"
                    resize="none"
                   />
                   <el-button type="primary" :icon="ChatLineRound" @click="askQuestion" circle />
                </div>
            </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 底部控制栏 -->
    <div class="guide-footer glass-panel">
      <el-button @click="prevStep" :disabled="store.currentSectionIndex === 0">上一步</el-button>
      <el-button type="danger" plain @click="confirmExit">结束阅读</el-button>
      <el-button type="primary" color="#8B4513" @click="nextStep" :disabled="store.currentSectionIndex === store.steps.length - 1">下一步</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, nextTick } from 'vue';
import { usePaperGuideStore } from '../../stores/paperGuide';
import { marked } from 'marked';
import { ElMessageBox, ElMessage } from 'element-plus';
import { EditPen, QuestionFilled, Collection, Opportunity, MagicStick, Switch, ChatLineRound, Download, Check } from '@element-plus/icons-vue';

const store = usePaperGuideStore();
const userQuestion = ref('');
const activeTab = ref('guide');
const textContentRef = ref<HTMLElement | null>(null);

const selectionMenu = reactive({
    visible: false,
    x: 0,
    y: 0,
    text: ''
});

const currentSection = computed(() => store.currentSection);

const hasAnalysis = computed(() => {
  return currentSection.value && store.aiAnalysis[currentSection.value.id];
});

const currentCards = computed(() => {
    if (!currentSection.value) return [];
    return store.mindCards[currentSection.value.id] || [];
});

const renderedAnalysis = computed(() => {
  if (!hasAnalysis.value || !currentSection.value) return '';
  return marked(store.aiAnalysis[currentSection.value.id]);
});

const formatStepTitle = (title: string) => {
  if (!title) return '';
  // 截断过长的标题，防止挤压布局
  return title.length > 10 ? title.substring(0, 10) + '...' : title;
};

const nextStep = () => {
  store.setSection(store.currentSectionIndex + 1);
  activeTab.value = 'guide'; // 切换章节时回到导读
};

const prevStep = () => {
  store.setSection(store.currentSectionIndex - 1);
  activeTab.value = 'guide';
};

const confirmExit = () => {
  ElMessageBox.confirm(
    '确定要结束阅读吗？这将清除当前的阅读进度。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    store.clearPaper();
  });
};

const askQuestion = async () => {
    if(!userQuestion.value.trim()) return;
    
    const question = userQuestion.value;
    userQuestion.value = ''; // Clear input immediately
    
    await store.askAI(question);
};

// 文本选择处理
const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
        selectionMenu.visible = false;
        return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = textContentRef.value?.getBoundingClientRect();

    if (containerRect) {
        // 计算相对于 text-content 的位置
        const menuWidth = 380; // 估算菜单宽度，确保居中
        const menuHeight = 40;
        
        let x = rect.left - containerRect.left + (rect.width / 2) - (menuWidth / 2);
        let y = rect.top - containerRect.top - 50; // 默认显示在上方

        // 边界检查：如果上方空间不足，显示在下方
        if (y < 10) {
            y = rect.bottom - containerRect.top + 10;
        }
        
        // 边界检查：左右不溢出
        if (x < 10) x = 10;
        if (x + menuWidth > containerRect.width) x = containerRect.width - menuWidth - 10;

        selectionMenu.x = x;
        selectionMenu.y = y;
        selectionMenu.text = selection.toString();
        selectionMenu.visible = true;
    }
};

const handleSummarizeSelection = async () => {
    selectionMenu.visible = false;
    const result = await store.analyzeSelection(selectionMenu.text, 'summary');
    // 简单追加到当前分析中，或者弹窗显示
    // 这里为了演示，直接追加到 AI 导读
    if (currentSection.value) {
        const currentAnalysis = store.aiAnalysis[currentSection.value.id] || '';
        store.aiAnalysis[currentSection.value.id] = currentAnalysis + '\n\n' + result;
        activeTab.value = 'guide';
    }
};

const handleExplainSelection = async () => {
    selectionMenu.visible = false;
    const result = await store.analyzeSelection(selectionMenu.text, 'explain');
    if (currentSection.value) {
        const currentAnalysis = store.aiAnalysis[currentSection.value.id] || '';
        store.aiAnalysis[currentSection.value.id] = currentAnalysis + '\n\n' + result;
        activeTab.value = 'guide';
    }
};

const handleTranslateSelection = async () => {
    selectionMenu.visible = false;
    const result = await store.analyzeSelection(selectionMenu.text, 'translate');
    if (currentSection.value) {
        const currentAnalysis = store.aiAnalysis[currentSection.value.id] || '';
        store.aiAnalysis[currentSection.value.id] = currentAnalysis + '\n\n' + result;
        activeTab.value = 'guide';
    }
};

const handleAskSelection = () => {
    selectionMenu.visible = false;
    userQuestion.value = `> 引用：${selectionMenu.text.substring(0, 50)}...\n\n请问`;
    activeTab.value = 'chat';
    // 聚焦输入框 (简单实现，实际可能需要 ref)
    const inputEl = document.querySelector('.chat-input-area textarea') as HTMLTextAreaElement;
    if (inputEl) inputEl.focus();
};

const handleCreateMindCard = async () => {
    selectionMenu.visible = false;
    await store.generateMindCard(selectionMenu.text);
    activeTab.value = 'cards';
    ElMessage.success('思维卡片已生成');
};

const handleAIReParse = async () => {
    ElMessage.info('正在请求 AI 重新识别论文结构...');
    await store.reparseWithAI();
    ElMessage.success('结构优化完成');
};

watch(() => store.chatHistory.length, () => {
    nextTick(() => {
        const chatArea = document.querySelector('.chat-history-area');
        if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight;
        }
    });
});

</script>

<style scoped lang="scss">
.reading-guide {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  background-color: #f9f7ec; // Retro background color
  border-radius: 8px;
  overflow: hidden;

  .glass-panel {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 69, 19, 0.1);
  }

  .guide-stepper {
    padding: 12px 20px;
    border-bottom: 1px solid rgba(139, 69, 19, 0.1);
    display: flex;
    align-items: center;
    gap: 16px;
    max-height: 80px; // 限制最大高度，防止挤压内容区
    
    .stepper-content {
        flex: 1;
        overflow-x: auto;
        overflow-y: hidden; // 防止垂直滚动
        white-space: nowrap; // 强制不换行
        mask-image: linear-gradient(to right, black 95%, transparent 100%); // 添加渐变遮罩提示滚动
        
        // 隐藏滚动条但保留功能
        &::-webkit-scrollbar {
            height: 4px;
        }
        &::-webkit-scrollbar-thumb {
            background: rgba(139, 69, 19, 0.2);
            border-radius: 2px;
        }

        .custom-steps {
            display: flex;
            align-items: center;
            gap: 12px; // Compact spacing
            padding: 4px 0;
        }

        .custom-step-item {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid transparent;
            cursor: pointer;
            transition: all 0.3s;
            flex-shrink: 0; // Don't shrink
            color: #5d4037;
            
            &:hover {
                background: rgba(255, 255, 255, 0.8);
                transform: translateY(-1px);
                box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            }

            &.active {
                background: #8B4513;
                color: white;
                box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
                border-color: #8B4513;
            }

            &.completed {
                color: #8B4513;
                background: rgba(139, 69, 19, 0.1);
                border-color: rgba(139, 69, 19, 0.2);
            }
            
            .step-number {
                font-weight: bold;
                font-size: 12px;
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(0,0,0,0.1);
            }

            &.active .step-number {
                background: rgba(255,255,255,0.3);
            }

            .step-text {
                font-size: 14px;
                font-weight: 500;
            }
        }
    }

    .stepper-actions {
        flex-shrink: 0;
    }
    
    :deep(.el-steps--simple) {
        background: transparent;
        padding: 10px 0;
    }
  }

  .guide-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    padding: 20px;
    gap: 20px;

    .original-text-panel, .ai-guide-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      overflow: hidden;
    }

    .panel-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(139, 69, 19, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.5);

      h3 {
        margin: 0;
        font-family: 'Georgia', serif;
        color: #5d4037;
        white-space: nowrap; // 防止标题换行
      }

      .section-title-tag {
          border: none;
          max-width: 300px; // 限制标签最大宽度
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
      }
    }

    .original-text-panel {
      .text-content {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        position: relative;
        
        pre {
          white-space: pre-wrap;
          font-family: 'Times New Roman', Times, serif;
          font-size: 17px;
          line-height: 1.8;
          color: #2c3e50;
          text-align: justify;
        }

        .selection-menu {
            position: absolute;
            z-index: 1000; // 提高层级，防止被遮挡
            background: white;
            padding: 4px;
            border-radius: 4px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2); // 加深阴影
            animation: fadeIn 0.2s ease;
            white-space: nowrap; // 防止按钮换行
        }
      }
    }

    .ai-guide-panel {
      .retro-tabs {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      :deep(.el-tabs__header) {
          margin: 0;
          padding: 0 20px;
          background: rgba(255, 255, 255, 0.5);
          border-bottom: 1px solid rgba(139, 69, 19, 0.1);
          flex-shrink: 0;
      }
      
      :deep(.el-tabs__content) {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: auto;
      }

      :deep(.el-tab-pane) {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden; // Ensure pane content doesn't overflow
      }

      .analysis-content {
        flex: 1 1 auto; // Allow shrinking and growing
        min-height: 100px; // Minimum height
        overflow-y: auto;
        padding: 20px;
        
        .markdown-body {
          font-size: 15px;
          line-height: 1.7;
          color: #37474f;
          
          :deep(h1), :deep(h2), :deep(h3) {
            color: #8B4513;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
          }
          
          :deep(strong) {
            color: #d35400;
          }
          
          :deep(blockquote) {
            background: #fff8e1;
            border-left-color: #ffb300;
            padding: 12px;
            border-radius: 4px;
          }
        }
      }

      .chat-history-area {
          flex: 0 1 40%; // Take up to 40% of space, but can shrink
          min-height: 150px; // Minimum height
          overflow-y: auto;
          padding: 16px;
          background: #fcfcfc;
          border-top: 1px solid #eee;
          display: flex;
          flex-direction: column;

          .chat-message {
              margin-bottom: 16px;
              display: flex;
              flex-direction: column;
              
              .message-content {
                  padding: 10px 14px;
                  border-radius: 12px;
                  font-size: 14px;
                  line-height: 1.6;
                  display: inline-block;
                  max-width: 85%;
                  word-wrap: break-word;
                  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
              }

              .role-label {
                  font-size: 12px;
                  margin-bottom: 4px;
                  color: #888;
                  padding: 0 4px;
              }

              &.user {
                  align-items: flex-end;
                  .message-content {
                      background: #8B4513;
                      color: white;
                      border-bottom-right-radius: 2px;
                  }
                  .role-label {
                      text-align: right;
                  }
              }

              &.ai {
                  align-items: flex-start;
                  .message-content {
                      background: #fff;
                      border: 1px solid #e0e0e0;
                      color: #333;
                      border-bottom-left-radius: 2px;
                  }
              }
          }
      }

      // Remove the old chat-history-area definition that was here
      
      .cards-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f5f5f5;

          .mind-card {
              background: white;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 16px;
              border-left: 4px solid #8B4513;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
              transition: transform 0.2s;

              &:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }

              .card-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 12px;
                  
                  h4 {
                      margin: 0;
                      color: #5d4037;
                  }
              }

              .definition {
                  font-size: 14px;
                  color: #555;
                  margin-bottom: 12px;
                  background: #fafafa;
                  padding: 8px;
                  border-radius: 4px;
              }

              .key-points {
                  margin-bottom: 12px;
                  p {
                      font-size: 13px;
                      margin: 4px 0;
                      color: #666;
                  }
              }

              .implication {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-size: 13px;
                  color: #e65100;
                  background: #fff3e0;
                  padding: 8px;
                  border-radius: 4px;
              }
          }
      }
      
      .chat-history-area {
          flex: 1; // Take full remaining height in the tab
          overflow-y: auto;
          padding: 16px;
          background: #fcfcfc;
          display: flex;
          flex-direction: column;

          .empty-chat {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
          }

          .chat-message {
              margin-bottom: 16px;
              display: flex;
              flex-direction: column;
              
              .message-content {
                  padding: 10px 14px;
                  border-radius: 12px;
                  font-size: 14px;
                  line-height: 1.6;
                  display: inline-block;
                  max-width: 85%;
                  word-wrap: break-word;
                  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
              }

              .role-label {
                  font-size: 12px;
                  margin-bottom: 4px;
                  color: #888;
                  padding: 0 4px;
              }

              &.user {
                  align-items: flex-end;
                  .message-content {
                      background: #8B4513;
                      color: white;
                      border-bottom-right-radius: 2px;
                  }
                  .role-label {
                      text-align: right;
                  }
              }

              &.ai {
                  align-items: flex-start;
                  .message-content {
                      background: #fff;
                      border: 1px solid #e0e0e0;
                      color: #333;
                      border-bottom-left-radius: 2px;
                  }
              }
          }
      }
      
      .chat-input-area {
          flex: 0 0 auto; // Don't shrink
          padding: 12px 16px;
          background: white;
          border-top: 1px solid #eee;
          display: flex;
          gap: 10px;
          align-items: flex-end;
          z-index: 10; // Ensure it's above other elements if overlap happens

          :deep(.el-textarea__inner) {
              border-radius: 18px;
              padding: 8px 16px;
              background: #f5f5f5;
              border: none;
              box-shadow: none;
              max-height: 150px; // Limit max height of textarea
              overflow-y: auto;
              
              &:focus {
                  background: white;
                  box-shadow: 0 0 0 1px #8B4513 inset;
              }
          }
      }
    }
  }

  .guide-footer {
    padding: 16px 20px;
    border-top: 1px solid rgba(139, 69, 19, 0.1);
    display: flex;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.8);
  }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
