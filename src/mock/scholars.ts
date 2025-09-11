import type { Scholar } from '../types/scholar'

const names = [
  '张伟教授', '李娜博士', '王强教授', '刘敏博士', '陈杰教授',
  '杨静博士', '黄磊教授', '周涛博士', '吴梅教授', '郑宇博士',
  '朱琳教授', '孙浩博士', '马丽教授', '许峰博士', '曹雪教授',
  '邓超博士', '胡婷教授', '冯军博士', '梁薇教授', '董鹏博士',
  '蒋红教授', '谢明博士', '韩磊教授', '钟静博士', '石强教授',
  '邱娜博士', '汪杰教授', '姚磊博士', '潘丽教授', '段宇博士'
]

const titles = ['教授', '副教授', '博士', '研究员', '高级工程师']

const institutions = [
  '清华大学', '北京大学', '中科院计算所', '复旦大学', '上海交大',
  'Stanford University', 'MIT', 'Harvard University', 'Carnegie Mellon University',
  'Google Research', 'Microsoft Research', 'OpenAI', 'DeepMind'
]

const fields = [
  '计算机科学与技术', '人工智能', '机器学习', '深度学习', '计算机视觉',
  '自然语言处理', '数据挖掘', '软件工程', '网络安全', '量子计算'
]

export const mockScholars: Scholar[] = Array.from({ length: 30 }, (_, i) => {
  const randomFields = fields.slice().sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2)

  return {
    id: `scholar-${i + 1}`,
    name: names[i % names.length],
    avatar: `https://images.pexels.com/photos/${2379004 + i}/pexels-photo-${2379004 + i}.jpeg?auto=compress&cs=tinysrgb&w=150`,
    title: titles[Math.floor(Math.random() * titles.length)],
    institution: institutions[Math.floor(Math.random() * institutions.length)],
    fields: randomFields,
    hIndex: Math.floor(Math.random() * 80) + 10,
    citations: Math.floor(Math.random() * 5000) + 100,
    papers: Math.floor(Math.random() * 150) + 20,
    isFollowed: Math.random() > 0.8,
    email: `scholar${i + 1}@university.edu`,
    bio: `专注于${randomFields.join('、')}等领域的研究，在国际顶级期刊发表论文多篇，主持多项国家级科研项目。`
  }
})
