<template>
  <div class="upload-page-container">
    <!-- 上传区域 -->
    <div class="upload-header" 
         @dragover.prevent 
         @drop.prevent="handleDrop"
         @click="triggerFileInput">
      <div class="upload-content">
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <div class="upload-text">
          <h3>点击或拖拽上传 PDF 论文</h3>
          <p>开启您的 AI 辅助阅读之旅</p>
        </div>
      </div>
      <input 
        type="file" 
        ref="fileInput" 
        class="hidden-input" 
        accept=".pdf" 
        @change="handleFileChange"
      />
      <div v-if="loading" class="loading-overlay">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>正在解析论文结构...</p>
      </div>
    </div>

    <!-- 教程区域 -->
    <div class="tutorial-section">
      <div class="tutorial-header">
        <h2>文献阅读三步法</h2>
        <p class="subtitle">基于 Keshav 教授的经典论文《How to read a paper》</p>
      </div>

      <div class="tutorial-cards">
        <!-- 第一步 -->
        <div class="tutorial-card step-1">
          <div class="card-header">
            <span class="step-badge">Step 1</span>
            <h3>快速浏览</h3>
            <span class="time-tag">5-10 分钟</span>
          </div>
          <div class="card-body">
            <p class="goal"><strong>目标：</strong>摸清文献"底细"，筛选核心信息</p>
            <ul>
              <li><strong>聚焦核心：</strong>仔细读标题、摘要和引言，掌握研究主题。</li>
              <li><strong>扫读结构：</strong>快速浏览章节标题，建立整体认知。</li>
              <li><strong>锁定结论：</strong>读结论部分，明确主要发现。</li>
            </ul>
            <div class="check-list">
              <h4>✅ 检验标准 (5C)</h4>
              <div class="tags">
                <el-tag effect="plain" type="warning">类别 Category</el-tag>
                <el-tag effect="plain" type="warning">背景 Context</el-tag>
                <el-tag effect="plain" type="warning">正确性 Correctness</el-tag>
                <el-tag effect="plain" type="warning">贡献 Contributions</el-tag>
                <el-tag effect="plain" type="warning">清晰度 Clarity</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 第二步 -->
        <div class="tutorial-card step-2">
          <div class="card-header">
            <span class="step-badge">Step 2</span>
            <h3>仔细阅读</h3>
            <span class="time-tag">约 1 小时</span>
          </div>
          <div class="card-body">
            <p class="goal"><strong>目标：</strong>把握核心内容，梳理论证逻辑</p>
            <ul>
              <li><strong>通读全文：</strong>理解研究方法、实验设计和核心结果。</li>
              <li><strong>重视图表：</strong>仔细观察坐标轴、数据趋势，理解直观呈现。</li>
              <li><strong>标记文献：</strong>记录感兴趣的参考文献，为拓展阅读做准备。</li>
            </ul>
            <div class="tip-box">
              <el-icon><Reading /></el-icon>
              <span>读完后，你应该能向别人清晰总结出主要观点和核心证据。</span>
            </div>
          </div>
        </div>

        <!-- 第三步 -->
        <div class="tutorial-card step-3">
          <div class="card-header">
            <span class="step-badge">Step 3</span>
            <h3>深入理解</h3>
            <span class="time-tag">1-5 小时</span>
          </div>
          <div class="card-body">
            <p class="goal"><strong>目标：</strong>批判性思考，吸收转化</p>
            <ul>
              <li><strong>重构过程：</strong>站在作者角度，还原研究思路。</li>
              <li><strong>质疑逻辑：</strong>大胆质疑假设合理性和数据分析方法。</li>
              <li><strong>思考表达：</strong>如果是你，你会怎么组织语言？</li>
              <li><strong>记录灵感：</strong>结合自己的研究方向，记录启发点。</li>
            </ul>
            <div class="tip-box highlight">
              <el-icon><ChatLineRound /></el-icon>
              <span>使用本平台的 AI 问答功能，辅助你进行批判性思考。</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tutorial-footer">
        <p>文献阅读是"量变到质变"的过程。不用追求"一天读10篇"，而是要保证"读一篇懂一篇"。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UploadFilled, Loading, Reading, ChatLineRound } from '@element-plus/icons-vue';
import { usePaperGuideStore } from '../../stores/paperGuide';
import { ElMessage } from 'element-plus';

const store = usePaperGuideStore();
const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const processFile = async (file: File) => {
  if (file.type !== 'application/pdf') {
    ElMessage.error('请上传 PDF 文件');
    return;
  }
  
  loading.value = true;
  try {
    await store.uploadAndParse(file);
    ElMessage.success('解析成功');
  } catch (e) {
    ElMessage.error('解析失败，请重试');
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    processFile(target.files[0]);
  }
};

const handleDrop = (e: DragEvent) => {
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    processFile(e.dataTransfer.files[0]);
  }
};
</script>

<style scoped lang="scss">
.upload-page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  padding-bottom: 40px;
}

.upload-header {
  flex-shrink: 0;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #8B4513;
  border-radius: 12px;
  background-color: rgba(249, 247, 236, 0.6);
  transition: all 0.3s;
  position: relative;
  cursor: pointer;
  backdrop-filter: blur(4px);
  margin-top: 10px;

  &:hover {
    border-color: #D4AF37;
    background-color: rgba(249, 247, 236, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 69, 19, 0.1);
  }

  .upload-content {
    display: flex;
    align-items: center;
    gap: 24px;
    color: #5d4037;

    .upload-icon {
      font-size: 48px;
      color: #8B4513;
      opacity: 0.8;
    }

    .upload-text {
      text-align: left;
      
      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        font-family: 'Playfair Display', serif;
      }

      p {
        margin: 0;
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }
}

.hidden-input {
  display: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  z-index: 10;
  color: #8B4513;

  .el-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }
}

.tutorial-section {
  flex: 1;
  
  .tutorial-header {
    text-align: center;
    margin-bottom: 32px;

    h2 {
      font-family: 'Playfair Display', serif;
      color: #2c3e50;
      font-size: 28px;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #666;
      font-style: italic;
    }
  }

  .tutorial-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }

  .tutorial-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border: 1px solid #eee;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }

    .card-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 20px;
      position: relative;

      .step-badge {
        background: #8B4513;
        color: #fff;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 12px;
      }

      h3 {
        margin: 0;
        font-size: 20px;
        color: #2c3e50;
      }

      .time-tag {
        position: absolute;
        top: 0;
        right: 0;
        color: #8B4513;
        font-weight: 500;
        font-size: 14px;
        background: rgba(139, 69, 19, 0.1);
        padding: 4px 8px;
        border-radius: 4px;
      }
    }

    .card-body {
      .goal {
        color: #555;
        margin-bottom: 16px;
        font-size: 14px;
        line-height: 1.5;
      }

      ul {
        padding-left: 20px;
        margin-bottom: 20px;
        
        li {
          margin-bottom: 8px;
          color: #666;
          font-size: 14px;
          line-height: 1.6;
        }
      }

      .check-list {
        background: #f9f9f9;
        padding: 12px;
        border-radius: 8px;

        h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #333;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }

      .tip-box {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background: #f0f7ff;
        padding: 12px;
        border-radius: 8px;
        color: #409eff;
        font-size: 13px;
        line-height: 1.5;

        &.highlight {
          background: #fdf6ec;
          color: #e6a23c;
        }
      }
    }
  }

  .tutorial-footer {
    text-align: center;
    color: #888;
    font-style: italic;
    margin-top: 40px;
    padding-bottom: 20px;
  }
}
</style>