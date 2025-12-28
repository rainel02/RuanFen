<template>
  <div class="analytics-page">
    <AppHeader />
    <div class="container">
      <div class="header">
        <h2>数据分析看板</h2>
        <div class="header-actions">
          <el-dropdown @command="handleExport">
            <el-button class="retro-export-btn">
              导出报告 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="image">导出为图片 (PNG)</el-dropdown-item>
                <el-dropdown-item command="pdf">导出为 PDF</el-dropdown-item>
                <el-dropdown-item command="excel">导出排行榜数据 (Excel)</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
                <el-radio-group v-model="hotTopicRange" size="small" @change="fetchHotTopics" class="retro-radio-group">
                  <el-radio-button value="1y">近1年</el-radio-button>
                  <el-radio-button value="3m">近3月</el-radio-button>
                  <el-radio-button value="all">全部</el-radio-button>
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
                <el-select v-model="rankingDomain" size="small" style="width: 160px" @change="fetchRanking" class="retro-select">
                  <el-option label="全部" value="all" class="retro-option" />
                  <el-option label="Medicine" value="Medicine" class="retro-option" />
                  <el-option label="Biology" value="Biology" class="retro-option" />
                  <el-option label="Chemistry" value="Chemistry" class="retro-option" />
                  <el-option label="Computer science" value="Computer science" class="retro-option" />
                  <el-option label="Business" value="Business" class="retro-option" />
                  <el-option label="Sociology" value="Sociology" class="retro-option" />
                  <el-option label="Political science" value="Political science" class="retro-option" />
                  <el-option label="Geology" value="Geology" class="retro-option" />
                  <el-option label="Philosophy" value="Philosophy" class="retro-option" />
                  <el-option label="History" value="History" class="retro-option" />
                  <el-option label="Materials science" value="Materials science" class="retro-option" />
                  <el-option label="Psychology" value="Psychology" class="retro-option" />
                  <el-option label="Physics" value="Physics" class="retro-option" />
                  <el-option label="Environmental science" value="Environmental science" class="retro-option" />
                  <el-option label="Mathematics" value="Mathematics" class="retro-option" />
                  <el-option label="Engineering" value="Engineering" class="retro-option" />
                  <el-option label="Geography" value="Geography" class="retro-option" />
                  <el-option label="Economics" value="Economics" class="retro-option" />
                  <el-option label="Art" value="Art" class="retro-option" />
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
                  <el-radio-button value="citations">引用量</el-radio-button>
                  <el-radio-button value="h-index">H指数</el-radio-button>
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
import * as echarts from 'echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import 'echarts-wordcloud'
import { getHotTopics, getInfluenceRanking, getInfluenceTrend } from '../api/analysis'
import { useAuthStore } from '../stores/auth'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent])

const authStore = useAuthStore()
const hotTopicRange = ref<'1y' | '3m' | 'all'>('all')
const rankingDomain = ref<string>('all')
const trendMetric = ref<'citations' | 'h-index'>('citations')

const wordCloudOption = ref<any>({})
const trendOption = ref<any>({})
const rankingData = ref<any[]>([])

const handleExport = (command: string) => {
  if (command === 'image') exportAsImage()
  if (command === 'pdf') exportAsPDF()
  if (command === 'excel') exportRankingData()
}

const exportAsImage = async () => {
  const element = document.querySelector('.analytics-page') as HTMLElement
  if (!element) return
  
  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 2,
      backgroundColor: '#f5f5f5'
    })
    
    const link = document.createElement('a')
    link.download = `数据分析报告_${new Date().toLocaleDateString()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    ElMessage.success('导出图片成功')
  } catch (error) {
    console.error('导出图片失败:', error)
    ElMessage.error('导出图片失败')
  }
}

const exportAsPDF = async () => {
  const element = document.querySelector('.analytics-page') as HTMLElement
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 2,
      backgroundColor: '#f5f5f5'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`数据分析报告_${new Date().toLocaleDateString()}.pdf`)
    ElMessage.success('导出PDF成功')
  } catch (error) {
    console.error('导出PDF失败:', error)
    ElMessage.error('导出PDF失败')
  }
}

const exportRankingData = () => {
  if (rankingData.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  
  const dataToExport = rankingData.value.map(item => ({
    '排名': item.rank,
    '学者姓名': item.name,
    '所属机构': item.institution,
    '影响力指数': item.score
  }))
  
  const ws = XLSX.utils.json_to_sheet(dataToExport)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '影响力排行榜')
  XLSX.writeFile(wb, `影响力排行榜_${new Date().toLocaleDateString()}.xlsx`)
  ElMessage.success('导出Excel成功')
}

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// Summary data
const summaryData = ref([
  { label: '总引用量', value: '0', icon: 'DataLine', color: '#409EFF' },
  { label: 'H指数', value: '0', icon: 'StarFilled', color: '#E6A23C' },
  { label: '发表论文', value: '0', icon: 'Trophy', color: '#67C23A' },
  { label: 'i10指数', value: '0', icon: 'UserFilled', color: '#F56C6C' },
])

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
    console.log('getHotTopics 返回数据:', res)
    // API returns { topics: [...] }
    let rawData = (res as any).topics || (res as any).data || res
    // 兼容后端返回 [{topic, weight}]，转换为 [{name, value}]，并做归一化
    let data: { name: string, value: number }[] = [];
    if (Array.isArray(rawData) && rawData.length > 0) {
      data = rawData.map((item: any) => ({ name: item.topic, value: item.weight }));
    }

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
            // Retro colors
            const colors = ['#8B4513', '#D4AF37', '#A0522D', '#CD853F', '#DEB887', '#556B2F', '#800000']
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
    // API returns { ranking: [{ rank, scholar: {...}, influenceScore }] }
    const data = (res as any).ranking || (res as any).data || []
    
    rankingData.value = data.map((item: any) => ({
      rank: item.rank,
      name: item.scholar?.displayName || 'Unknown',
      score: item.influenceScore,
      institution: (item.scholar?.primaryTags || []).join(', ') || 'Unknown', // Use tags as institution/field placeholder
      avatar: item.scholar?.avatarUrl // Assuming avatarUrl might be there, or undefined
    }))
  } catch (error) {
    console.error(error)
    // Fallback mock data
    rankingData.value = [
      { rank: 1, name: 'Dr. Zhang Wei', score: 95.8, institution: 'Tsinghua University', avatar: '' },
      { rank: 2, name: 'Prof. Li Ming', score: 92.3, institution: 'Peking University', avatar: '' },
      { rank: 3, name: 'Dr. Wang Fang', score: 88.7, institution: 'Fudan University', avatar: '' },
      { rank: 4, name: 'Prof. Chen Hua', score: 85.2, institution: 'Shanghai Jiao Tong University', avatar: '' },
      { rank: 5, name: 'Dr. Liu Yang', score: 82.6, institution: 'Zhejiang University', avatar: '' }
    ]
  }
}

const fetchTrend = async () => {
  // Use current user ID or a default one if not logged in
  const userId = authStore.user?.userId || '1' 
  
  try {
    const res = await getInfluenceTrend(userId)
    // API returns { worksCount, citedByCnt, hIndex, i10Index, authorName }
    const data = (res as any).data || res

    // Update summary cards
    summaryData.value[0].value = (data.citedByCnt || 0).toLocaleString()
    summaryData.value[1].value = (data.hIndex || 0).toString()
    summaryData.value[2].value = (data.worksCount || 0).toLocaleString()
    summaryData.value[3].value = (data.i10Index || 0).toString()

    // Since the API no longer returns trend data (time series), we'll use mock data for the chart
    // or we could hide the chart. For now, let's keep the mock chart but maybe update the title.
    trendOption.value = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['2020', '2021', '2022', '2023', '2024'],
        axisLine: { lineStyle: { color: '#909399' } }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#E4E7ED' } }
      },
      series: [{
        name: '模拟趋势',
        type: 'line',
        smooth: true,
        lineStyle: { width: 3, color: '#D4AF37' },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(212, 175, 55, 0.5)' },
            { offset: 1, color: 'rgba(212, 175, 55, 0.01)' }
          ])
        },
        data: [10, 20, 15, 30, data.citedByCnt || 40] // Use current citation count as last point
      }]
    }
  } catch (error) {
    console.error(error)
    // Fallback: set default values and mock chart
    summaryData.value[0].value = '1,234'
    summaryData.value[1].value = '15'
    summaryData.value[2].value = '42'
    summaryData.value[3].value = '28'

    trendOption.value = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['2020', '2021', '2022', '2023', '2024'],
        axisLine: { lineStyle: { color: '#909399' } }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#E4E7ED' } }
      },
      series: [{
        name: '示例趋势',
        type: 'line',
        smooth: true,
        lineStyle: { width: 3, color: '#D4AF37' },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(212, 175, 55, 0.5)' },
            { offset: 1, color: 'rgba(212, 175, 55, 0.01)' }
          ])
        },
        data: [800, 950, 1050, 1150, 1234]
      }]
    }
  }
}

onMounted(() => {
  fetchHotTopics()
  // Initialize with mock data for ranking and trend
  rankingData.value = [
    { rank: 1, name: 'Dr. Zhang Wei', score: 95.8, institution: 'Tsinghua University', avatar: '' },
    { rank: 2, name: 'Prof. Li Ming', score: 92.3, institution: 'Peking University', avatar: '' },
    { rank: 3, name: 'Dr. Wang Fang', score: 88.7, institution: 'Fudan University', avatar: '' },
    { rank: 4, name: 'Prof. Chen Hua', score: 85.2, institution: 'Shanghai Jiao Tong University', avatar: '' },
    { rank: 5, name: 'Dr. Liu Yang', score: 82.6, institution: 'Zhejiang University', avatar: '' }
  ]
  summaryData.value[0].value = '1,234'
  summaryData.value[1].value = '15'
  summaryData.value[2].value = '42'
  summaryData.value[3].value = '28'
  trendOption.value = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['2020', '2021', '2022', '2023', '2024'],
      axisLine: { lineStyle: { color: '#909399' } }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#E4E7ED' } }
    },
    series: [{
      name: '模拟趋势',
      type: 'line',
      smooth: true,
      lineStyle: { width: 3, color: '#D4AF37' },
      areaStyle: {
        opacity: 0.8,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(212, 175, 55, 0.5)' },
          { offset: 1, color: 'rgba(212, 175, 55, 0.01)' }
        ])
      },
      data: [800, 950, 1050, 1150, 1234]
    }]
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/retro-theme.scss';

.analytics-page {
  @extend .retro-page-bg;
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
    @extend .text-retro-dark;
    font-size: 32px;
    font-weight: 900;
    @extend .font-serif;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    background: none;
    -webkit-text-fill-color: initial;
  }
}

.mb-20 {
  margin-bottom: 25px;
}

/* Summary Card styles are imported from retro-theme.scss via class name match,
   but we need to ensure they apply if scoped.
   Since we imported the scss, the mixins/classes are available.
   However, .summary-card in retro-theme is a class, not a mixin.
   We need to extend it or just let the global class apply if it was global.
   But it's scoped here. So we extend. */
.summary-card {
  @extend .summary-card;
}

.chart-card {
  @extend .glass-panel;
  padding: 0; /* Reset padding if needed, glass-panel has its own */

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid rgba(184, 134, 11, 0.2);
  }

  .card-title {
    font-size: 18px;
    font-weight: 700;
    @extend .text-retro-dark;
    @extend .font-serif;
  }

  .chart-container {
    height: 400px;
    padding: 20px;
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
      font-weight: 600;
      @extend .text-retro-dark;
      @extend .font-serif;
    }

    .institution {
      font-size: 12px;
      color: #8B4513;
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
    filter: sepia(1) hue-rotate(10deg);
  }

  .rank-text {
    font-weight: bold;
    color: #654321;
    font-family: 'Georgia', serif;
  }
}

.score-text {
  font-family: 'Georgia', serif;
  font-weight: bold;
  color: #D4AF37;
}

:deep(.el-table) {
  background-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(212, 175, 55, 0.1);
  --el-table-row-hover-bg-color: rgba(212, 175, 55, 0.15);
  --el-table-border-color: rgba(184, 134, 11, 0.2);

  th.el-table__cell {
    color: #654321;
    font-family: 'Georgia', serif;
    font-weight: bold;
  }

  td.el-table__cell {
    color: #5d4037;
  }
}

:deep(.el-table .rank-row-1) {
  background: rgba(255, 215, 0, 0.15);
}
:deep(.el-table .rank-row-2) {
  background: rgba(192, 192, 192, 0.15);
}
:deep(.el-table .rank-row-3) {
  background: rgba(205, 127, 50, 0.15);
}

.retro-export-btn {
  background: linear-gradient(135deg, #f9f7ec 0%, #e7d3a1 100%) !important;
  border: 2px solid #D4AF37 !important;
  color: #8B4513 !important;
  font-family: 'Georgia', 'Times New Roman', serif !important;
  font-weight: 700 !important;
  font-size: 16px !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.10), 0 1.5px 6px 0 rgba(44, 38, 24, 0.04);
  padding: 10px 28px !important;
  transition: all 0.2s;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px #fff8e1;
}
.retro-export-btn:hover, .retro-export-btn:focus {
  background: linear-gradient(135deg, #fffbe6 0%, #f3e7c6 100%) !important;
  border-color: #B8860B !important;
  color: #654321 !important;
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.18), 0 2px 8px rgba(44, 38, 24, 0.08);
  transform: translateY(-2px) scale(1.03);
}

/* 复古风格按钮/选项栏统一样式 */
.retro-radio-group {
  background: none;
  border-radius: 8px;
  padding: 2px 0;
}
// 复古风格单选按钮（时间选择等）
.retro-radio-btn {
  font-family: 'Georgia', 'Times New Roman', serif !important;
  font-weight: 700 !important;
  color: #8B4513 !important;
  background: linear-gradient(135deg, #f9f7ec 0%, #e7d3a1 100%) !important;
  border: 2px solid #D4AF37 !important;
  border-radius: 8px !important;
  margin-right: 8px !important;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.08);
  transition: all 0.2s;
  font-size: 15px !important;
  letter-spacing: 0.5px;
  min-width: 60px;
  min-height: 32px;
  padding: 0 18px;
  text-align: center;
}
.retro-radio-btn.is-active,
.retro-radio-btn:active,
.retro-radio-btn:focus,
.retro-radio-btn.el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background: linear-gradient(135deg, #fffbe6 0%, #f3e7c6 100%) !important;
  color: #B8860B !important;
  border-color: #B8860B !important;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.12);
}
.retro-radio-btn .el-radio-button__inner {
  background: transparent !important;
  border: none !important;
  color: inherit !important;
  font-family: inherit !important;
  font-weight: inherit !important;
  font-size: inherit !important;
  box-shadow: none !important;
}
.retro-radio-btn.is-active .el-radio-button__inner {
  color: #B8860B !important;
}
.retro-radio-btn.is-active,
.retro-radio-btn:active,
.retro-radio-btn:focus {
  background: linear-gradient(135deg, #fffbe6 0%, #f3e7c6 100%) !important;
  color: #654321 !important;
  border-color: #B8860B !important;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.12);
}
.retro-select {
  font-family: 'Georgia', 'Times New Roman', serif !important;
  font-weight: 700 !important;
  color: #8B4513 !important;
  background: linear-gradient(135deg, #f9f7ec 0%, #e7d3a1 100%) !important;
  border: 2px solid #D4AF37 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.08);
  font-size: 15px !important;
  letter-spacing: 0.5px;
}
.retro-option {
  font-family: 'Georgia', 'Times New Roman', serif !important;
  color: #8B4513 !important;
  background: #fffef8 !important;
  font-size: 15px !important;
}
.retro-select .el-input__inner {
  color: #8B4513 !important;
  font-weight: 700 !important;
  font-family: 'Georgia', 'Times New Roman', serif !important;
}
</style>
