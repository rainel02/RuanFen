import request from '../utils/request'

export const getHotTopics = (timeRange: '1y' | '3m' | 'all' = 'all') => {
  return request({
    url: '/analysis/hot-topics',
    method: 'get',
    params: { time_range: timeRange }
  })
}

export const getInfluenceRanking = (domain: 'cs' | 'physics' | 'all' = 'all') => {
  return request({
    url: '/analysis/influence/ranking',
    method: 'get',
    params: { domain }
  })
}

export const getInfluenceTrend = (userId: string, timeRange: string = '5y', metric: 'citations' | 'h-index' = 'citations') => {
  return request({
    url: `/analysis/influence/trend/${userId}`,
    method: 'get',
    params: { time_range: timeRange, metric }
  })
}
