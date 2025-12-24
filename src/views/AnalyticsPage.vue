<template>
  <div class="analytics-page">
    <AppHeader />
    <div class="container">
      <div class="header">
        <h2>数据分析看板</h2>
        <div class="header-actions">
          <el-button type="primary" plain>导出报告</el-button>
        </div>
      </div>

      <!-- Summary Cards -->
      <el-row :gutter="20" class="mb-20">
        <el-col :span="6" v-for="(item, index) in summaryData" :key="index">
          <el-card class="summary-card" shadow="hover">
            <div class="summary-content">
              <div class="summary-value" :style="{ color: item.color }">{{ item.value }}</div>
              <div class="summary-label">{{ item.label }}</div>
            </div>
            <el-icon class="summary-icon" :style="{ color: item.color }"><component :is="item.icon" /></el-icon>
          </el-card>
        </el-col>
      </el-row>

      <!-- Top Row: Hot Topics -->
      <el-row :gutter="20" class="mb-20">
        <el-col :span="24">
          <el-card class="chart-card glass-effect">
            <template #header>
              <div class="card-header">
                <span class="card-title">学科热点词云</span>
                <el-radio-group v-model="hotTopicRange" size="small" @change="fetchHotTopics">
                  <el-radio-button label="1y">近1年</el-radio-button>
                  <el-radio-button label="3m">近3月</el-radio-button>
                  <el-radio-button label="all">全部</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container">
              <v-chart class="chart" :option="wordCloudOption" autoresize />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Middle Row: Ranking & Trend -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-card class="chart-card glass-effect">
            <template #header>
              <div class="card-header">
                <span class="card-title">影响力排行榜</span>
                <el-select v-model="rankingDomain" size="small" style="width: 100px" @change="fetchRanking">
                  <el-option label="全部" value="all" />
                  <el-option label="计算机" value="cs" />
                  <el-option label="物理" value="physics" />
                </el-select>
              </div>
            </template>
            <el-table :data="rankingData" style="width: 100%" height="350" :row-class-name="tableRowClassName">
              <el-table-column prop="rank" label="排名" width="80" align="center">
                <template #default="scope">
                  <div class="rank-wrapper">
                    <img v-if="scope.row.rank <= 3" :src="getRankIcon(scope.row.rank)" class="rank-icon" />
                    <span v-else class="rank-text">{{ scope.row.rank }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="学者" width="180">
                <template #default="scope">
                  <div class="scholar-info">
                    <el-avatar :size="36" :src="scope.row.avatar || defaultAvatar" class="scholar-avatar" />
                    <div class="scholar-detail">
                      <span class="name">{{ scope.row.name }}</span>
                      <span class="institution">{{ scope.row.institution || '未知机构' }}</span>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="score" label="影响力指数" align="right">
                <template #default="scope">
                  <span class="score-text">{{ scope.row.score }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="14">
          <el-card class="chart-card glass-effect">
            <template #header>
              <div class="card-header">
                <span class="card-title">影响力趋势 (我的)</span>
                <el-radio-group v-model="trendMetric" size="small" @change="fetchTrend">
                  <el-radio-button label="citations">引用量</el-radio-button>
                  <el-radio-button label="h-index">H指数</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container">
              <v-chart class="chart" :option="trendOption" autoresize />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import 'echarts-wordcloud'
import { getHotTopics, getInfluenceRanking, getInfluenceTrend } from '../api/analysis'
import * as echarts from 'echarts/core'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent])

const hotTopicRange = ref<'1y' | '3m' | 'all'>('all')
const rankingDomain = ref<'cs' | 'physics' | 'all'>('all')
const trendMetric = ref<'citations' | 'h-index'>('citations')

const wordCloudOption = ref<any>({})
const trendOption = ref<any>({})
const rankingData = ref<any[]>([])

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// Mock summary data
const summaryData = [
  { label: '总引用量', value: '1,234', icon: 'DataLine', color: '#409EFF' },
  { label: 'H指数', value: '15', icon: 'StarFilled', color: '#E6A23C' },
  { label: '发表论文', value: '42', icon: 'Trophy', color: '#67C23A' },
  { label: '关注者', value: '89', icon: 'UserFilled', color: '#F56C6C' },
]

const getRankIcon = (rank: number) => {
  // You can replace these with actual image URLs or SVGs
  if (rank === 1) return 'https://cdn-icons-png.flaticon.com/512/2583/2583344.png'
  if (rank === 2) return 'https://cdn-icons-png.flaticon.com/512/2583/2583319.png'
  if (rank === 3) return 'https://cdn-icons-png.flaticon.com/512/2583/2583434.png'
  return ''
}

const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  if (rowIndex === 0) return 'rank-row-1'
  if (rowIndex === 1) return 'rank-row-2'
  if (rowIndex === 2) return 'rank-row-3'
  return ''
}

const fetchHotTopics = async () => {
  try {
    const res = await getHotTopics(hotTopicRange.value)
    const data = (res as any).data || res
    
    wordCloudOption.value = {
      tooltip: {},
      series: [{
        type: 'wordCloud',
        gridSize: 8,
        sizeRange: [12, 60],
        rotationRange: [-45, 45],
        shape: 'circle',
        width: '100%',
        height: '100%',
        drawOutOfBound: false,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: function () {
            // Tech colors
            const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#36cfc9', '#9254de']
            return colors[Math.floor(Math.random() * colors.length)];
          }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            shadowBlur: 10,
            shadowColor: '#333'
          }
        },
        data: data
      }]
    }
  } catch (error) {
    console.error(error)
    // Fallback mock data
    const mockData = [
      { name: 'Deep Learning', value: 1000 },
      { name: 'Neural Networks', value: 800 },
      { name: 'Computer Vision', value: 700 },
      { name: 'NLP', value: 600 },
      { name: 'Reinforcement Learning', value: 500 },
      { name: 'Transformers', value: 450 },
      { name: 'GANs', value: 400 },
      { name: 'BERT', value: 350 },
      { name: 'GPT', value: 300 },
      { name: 'Attention', value: 250 }
    ]
    wordCloudOption.value = {
      series: [{
        type: 'wordCloud',
        data: mockData,
        textStyle: {
          color: () => ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#36cfc9'][Math.floor(Math.random() * 5)]
        }
      }]
    }
  }
}

const fetchRanking = async () => {
  try {
    const res = await getInfluenceRanking(rankingDomain.value)
    rankingData.value = (res as any).data || res
  } catch (error) {
    console.error(error)
    // Mock
    rankingData.value = [
      { rank: 1, name: 'Alice Smith', score: 98.5, institution: 'MIT' },
      { rank: 2, name: 'Bob Johnson', score: 95.2, institution: 'Stanford' },
      { rank: 3, name: 'Charlie Brown', score: 92.1, institution: 'Harvard' },
      { rank: 4, name: 'David Lee', score: 89.8, institution: 'Tsinghua' },
      { rank: 5, name: 'Eva Green', score: 88.4, institution: 'Oxford' }
    ]
  }
}

const fetchTrend = async () => {
  try {
    const res = await getInfluenceTrend('me', '5y', trendMetric.value)
    const data = (res as any).data || res
    
    trendOption.value = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.years || ['2020', '2021', '2022', '2023', '2024'],
        axisLine: { lineStyle: { color: '#909399' } }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#E4E7ED' } }
      },
      series: [{
        name: trendMetric.value === 'citations' ? '引用量' : 'H指数',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowBlur: 10,
          shadowOffsetY: 8
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.01)' }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: data.values || [150, 230, 224, 218, 135]
      }]
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchHotTopics()
  fetchRanking()
  fetchTrend()
})
</script>

<style scoped lang="scss">
.analytics-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  padding-bottom: 40px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h2 {
    margin: 0;
    color: #303133;
    font-size: 28px;
    font-weight: 600;
    background: -webkit-linear-gradient(315deg, #409eff 25%, #36cfc9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.mb-20 {
  margin-bottom: 25px;
}

.summary-card {
  border: none;
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .summary-content {
    position: relative;
    z-index: 1;
  }

  .summary-value {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .summary-label {
    color: #909399;
    font-size: 14px;
  }

  .summary-icon {
    position: absolute;
    right: 20px;
    bottom: 20px;
    font-size: 48px;
    opacity: 0.2;
    transform: rotate(-15deg);
  }
}

.chart-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .chart-container {
    height: 400px;
    padding: 10px;
    .chart {
      height: 100%;
      width: 100%;
    }
  }
}

.scholar-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .scholar-detail {
    display: flex;
    flex-direction: column;
    
    .name {
      font-weight: 500;
      color: #303133;
    }
    
    .institution {
      font-size: 12px;
      color: #909399;
    }
  }
}

.rank-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  
  .rank-icon {
    width: 24px;
    height: 24px;
  }
  
  .rank-text {
    font-weight: bold;
    color: #606266;
  }
}

.score-text {
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  color: #409EFF;
}

:deep(.el-table .rank-row-1) {
  background: #fdf6ec;
}
:deep(.el-table .rank-row-2) {
  background: #f0f9eb;
}
:deep(.el-table .rank-row-3) {
  background: #ecf5ff;
}
</style>
