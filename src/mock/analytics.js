// 统计分析Mock数据

export const analyticsData = {
  // 科研机构论文发表量数据
  institutions: [
    { name: '清华大学', papers: 1245, citations: 15678 },
    { name: '北京大学', papers: 1156, citations: 14521 },
    { name: '中科院', papers: 2341, citations: 28456 },
    { name: 'Stanford University', papers: 1876, citations: 23789 },
    { name: 'MIT', papers: 1654, citations: 21234 },
    { name: 'Harvard University', papers: 1598, citations: 20567 },
    { name: '复旦大学', papers: 987, citations: 12456 },
    { name: '上海交大', papers: 1123, citations: 13789 },
    { name: 'Google Research', papers: 876, citations: 15432 },
    { name: 'Microsoft Research', papers: 765, citations: 12890 }
  ],
  
  // 研究领域热度数据
  fields: [
    { name: '人工智能', count: 2456 },
    { name: '机器学习', count: 2134 },
    { name: '深度学习', count: 1876 },
    { name: '计算机视觉', count: 1654 },
    { name: '自然语言处理', count: 1432 },
    { name: '数据挖掘', count: 1298 },
    { name: '软件工程', count: 987 },
    { name: '网络安全', count: 876 },
    { name: '量子计算', count: 543 },
    { name: '生物信息学', count: 432 }
  ],
  
  // 论文发表趋势数据
  trends: [
    { month: '2023-01', papers: 234, citations: 1234 },
    { month: '2023-02', papers: 267, citations: 1456 },
    { month: '2023-03', papers: 298, citations: 1678 },
    { month: '2023-04', papers: 312, citations: 1789 },
    { month: '2023-05', papers: 345, citations: 1934 },
    { month: '2023-06', papers: 378, citations: 2156 },
    { month: '2023-07', papers: 392, citations: 2234 },
    { month: '2023-08', papers: 410, citations: 2398 },
    { month: '2023-09', papers: 456, citations: 2567 },
    { month: '2023-10', papers: 478, citations: 2734 },
    { month: '2023-11', papers: 489, citations: 2876 },
    { month: '2023-12', papers: 502, citations: 2945 }
  ],
  
  // 专家合作关系网络数据
  network: {
    categories: [
      { name: '人工智能' },
      { name: '机器学习' },
      { name: '计算机视觉' },
      { name: '自然语言处理' }
    ],
    nodes: [
      { id: 1, name: '张伟教授', symbolSize: 40, category: 0, value: 45 },
      { id: 2, name: '李娜博士', symbolSize: 30, category: 1, value: 32 },
      { id: 3, name: '王强教授', symbolSize: 35, category: 0, value: 38 },
      { id: 4, name: '刘敏博士', symbolSize: 25, category: 2, value: 28 },
      { id: 5, name: '陈杰教授', symbolSize: 45, category: 1, value: 42 },
      { id: 6, name: '杨静博士', symbolSize: 30, category: 3, value: 35 },
      { id: 7, name: '黄磊教授', symbolSize: 40, category: 2, value: 40 },
      { id: 8, name: '周涛博士', symbolSize: 28, category: 3, value: 30 },
      { id: 9, name: '吴梅教授', symbolSize: 38, category: 0, value: 36 },
      { id: 10, name: '郑宇博士', symbolSize: 32, category: 1, value: 34 }
    ],
    links: [
      { source: 1, target: 2, value: 5 },
      { source: 1, target: 3, value: 8 },
      { source: 1, target: 5, value: 6 },
      { source: 2, target: 4, value: 4 },
      { source: 2, target: 5, value: 7 },
      { source: 3, target: 7, value: 5 },
      { source: 4, target: 6, value: 3 },
      { source: 5, target: 10, value: 6 },
      { source: 6, target: 8, value: 4 },
      { source: 7, target: 9, value: 5 },
      { source: 8, target: 6, value: 3 },
      { source: 9, target: 1, value: 4 },
      { source: 10, target: 2, value: 5 }
    ]
  }
}