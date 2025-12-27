import request from '../utils/request'

export const getHotTopics = (timeRange: '1y' | '3m' | 'all' = 'all') => {
  return request({
    url: '/analysis/hot-topics',
    method: 'get',
    params: { time_range: timeRange }
  }).catch((error) => {
    // 如果接口不存在，返回空数据而不是抛出错误
    console.warn('getHotTopics API not available:', error)
    return { topics: [] }
  })
}

export const getInfluenceRanking = (domain: string = 'all') => {
  return request({
    url: '/analysis/influence/ranking',
    method: 'get',
    params: { domain }
  })
}

export const getInfluenceTrend = (userId: string) => {
  return request({
    url: `/analysis/influence/trend/${userId}`,
    method: 'get'
  })
}
