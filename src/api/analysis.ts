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
  }).catch((error) => {
    console.warn('getInfluenceRanking API not available:', error)
    return { ranking: [] }
  })
}

export const getInfluenceTrend = (userId: string) => {
  return request({
    url: `/analysis/influence/trend/${userId}`,
    method: 'get'
  }).catch((error) => {
    console.warn('getInfluenceTrend API not available:', error)
    return { worksCount: 0, citedByCnt: 0, hIndex: 0, i10Index: 0 }
  })
}

export const getRelationData = (authorName: string) => {
  return request({
    url: `/analysis/relation/${authorName}`,
    method: 'get'
  }).catch((error) => {
    console.warn('getRelationData API not available:', error)
    return { author1Id: "000", author1Name: "null", author2Id: "000", author2Name: "null" }
  })
}
