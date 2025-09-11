<template>
  <div class="analytics-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div class="page-header-section">
          <h2>统计分析</h2>
          <div class="time-selector">
            <el-select v-model="timeRange" @change="updateCharts" placeholder="选择时间范围">
              <el-option label="近1年" value="1year" />
              <el-option label="近3年" value="3years" />
              <el-option label="近5年" value="5years" />
              <el-option label="全部时间" value="all" />
            </el-select>
          </div>
        </div>

        <el-row :gutter="24" class="charts-row">
          <el-col :lg="12" :md="24" :sm="24" :xs="24">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>科研机构论文发表量排名</span>
                  <el-button size="small" @click="exportChart('institutions')">
                    <el-icon><Download /></el-icon>
                    导出
                  </el-button>
                </div>
              </template>
              <div class="chart-container">
                <v-chart
                  :option="institutionChartOptions"
                  autoresize
                  style="height: 350px;"
                />
              </div>
            </el-card>
          </el-col>

          <el-col :lg="12" :md="24" :sm="24" :xs="24">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>研究领域热度分析</span>
                  <el-button size="small" @click="exportChart('fields')">
                    <el-icon><Download /></el-icon>
                    导出
                  </el-button>
                </div>
              </template>
              <div class="chart-container">
                <v-chart
                  :option="fieldChartOptions"
                  autoresize
                  style="height: 350px;"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="24" class="charts-row">
          <el-col :span="24">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>论文发表趋势</span>
                  <el-button size="small" @click="exportChart('trend')">
                    <el-icon><Download /></el-icon>
                    导出
                  </el-button>
                </div>
              </template>
              <div class="chart-container">
                <v-chart
                  :option="trendChartOptions"
                  autoresize
                  style="height: 400px;"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="24" class="charts-row">
          <el-col :span="24">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>专家合作关系网络图</span>
                  <el-button size="small" @click="exportChart('network')">
                    <el-icon><Download /></el-icon>
                    导出
                  </el-button>
                </div>
              </template>
              <div class="chart-container">
                <v-chart
                  :option="networkChartOptions"
                  autoresize
                  style="height: 500px;"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  BarChart,
  PieChart,
  LineChart,
  GraphChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { analyticsData } from '@/mock/analytics'

use([
  CanvasRenderer,
  BarChart,
  PieChart,
  LineChart,
  GraphChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent
])

const timeRange = ref('1year')

// 科研机构数据
const institutionChartOptions = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: 'category',
    data: analyticsData.institutions.map(item => item.name)
  },
  series: [
    {
      name: '论文发表量',
      type: 'bar',
      data: analyticsData.institutions.map(item => item.papers),
      itemStyle: {
        color: '#1890ff'
      }
    }
  ]
}))

// 研究领域数据
const fieldChartOptions = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    type: 'scroll',
    orient: 'vertical',
    right: 10,
    top: 20,
    bottom: 20
  },
  series: [
    {
      name: '研究领域',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      data: analyticsData.fields.map(item => ({
        value: item.count,
        name: item.name
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}))

// 发表趋势数据
const trendChartOptions = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['论文数量', '引用数量']
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: analyticsData.trends.map(item => item.month)
  },
  yAxis: [
    {
      type: 'value',
      name: '论文数量',
      position: 'left'
    },
    {
      type: 'value',
      name: '引用数量',
      position: 'right'
    }
  ],
  series: [
    {
      name: '论文数量',
      type: 'line',
      data: analyticsData.trends.map(item => item.papers),
      smooth: true,
      itemStyle: {
        color: '#1890ff'
      }
    },
    {
      name: '引用数量',
      type: 'line',
      yAxisIndex: 1,
      data: analyticsData.trends.map(item => item.citations),
      smooth: true,
      itemStyle: {
        color: '#52c41a'
      }
    }
  ]
}))

// 合作网络数据
const networkChartOptions = computed(() => ({
  tooltip: {},
  series: [
    {
      name: '合作关系',
      type: 'graph',
      layout: 'force',
      data: analyticsData.network.nodes,
      links: analyticsData.network.links,
      categories: analyticsData.network.categories,
      roam: true,
      label: {
        show: true,
        position: 'right',
        formatter: '{b}'
      },
      labelLayout: {
        hideOverlap: true
      },
      scaleLimit: {
        min: 0.4,
        max: 2
      },
      lineStyle: {
        color: 'source',
        curveness: 0.3
      },
      force: {
        repulsion: 1000,
        edgeLength: [10, 50]
      }
    }
  ]
}))

const updateCharts = () => {
  // 根据时间范围更新图表数据
  ElMessage.success(`已切换到${timeRange.value === '1year' ? '近1年' : timeRange.value === '3years' ? '近3年' : timeRange.value === '5years' ? '近5年' : '全部时间'}数据`)
}

const exportChart = (chartType) => {
  ElMessage.success(`正在导出${chartType}图表数据...`)
}

onMounted(() => {
  updateCharts()
})
</script>

<style scoped lang="scss">
@import "../styles/main.scss";

.analytics-page {
  min-height: 100vh;
}

.page-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  @include mobile {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}

.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .chart-container {
    min-height: 300px;
  }
}
</style>
