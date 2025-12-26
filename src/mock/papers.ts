// import type { Paper } from '../types/paper'
//
// const fields = [
//   '计算机科学与技术',
//   '人工智能',
//   '机器学习',
//   '深度学习',
//   '计算机视觉',
//   '自然语言处理',
//   '数据挖掘',
//   '软件工程',
//   '网络安全',
//   '量子计算',
//   '生物信息学',
//   '医学信息学'
// ]
//
// const journals = [
//   'Nature',
//   'Science',
//   'Nature Machine Intelligence',
//   'IEEE Transactions on Pattern Analysis and Machine Intelligence',
//   'Journal of Machine Learning Research',
//   'Artificial Intelligence',
//   'ACM Computing Surveys',
//   'IEEE Computer',
//   'Communications of the ACM',
//   'Pattern Recognition',
//   'Neural Networks',
//   'Computer Vision and Image Understanding'
// ]
//
// const institutions = [
//   '清华大学',
//   '北京大学',
//   '中科院',
//   'Stanford University',
//   'MIT',
//   'Google Research',
//   'Microsoft Research',
//   'OpenAI',
//   'DeepMind',
//   'Facebook AI Research'
// ]
//
// export const mockPapers: Paper[] = Array.from({ length: 50 }, (_, i) => {
//   const randomFields = fields.slice().sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1)
//   const randomKeywords = randomFields.flatMap(field =>
//     field.split('').slice(0, 2).map(char => `${char}关键词${i}`)
//   ).slice(0, 5)
//
//   return {
//     id: `paper-${i + 1}`,
//     title: `${randomFields[0]}领域的创新研究：基于深度学习的新方法 ${i + 1}`,
//     authors: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, j) => ({
//       id: `author-${i}-${j}`,
//       name: `研究员${String.fromCharCode(65 + (i + j) % 26)}`,
//       institution: institutions[Math.floor(Math.random() * institutions.length)]
//     })),
//     abstract: `这是一篇关于${randomFields.join('、')}的重要研究论文。本研究提出了一种新的算法框架，通过结合最新的深度学习技术和传统方法，在多个基准数据集上取得了显著的性能提升。实验结果表明，该方法在准确性、效率和可解释性方面都有明显优势。研究成果为相关领域的发展提供了新的思路和技术支撑，具有重要的理论价值和应用前景。`,
//     publishDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
//     journal: journals[Math.floor(Math.random() * journals.length)],
//     fields: randomFields,
//     keywords: randomKeywords,
//     citations: Math.floor(Math.random() * 500) + 10,
//     favorites: Math.floor(Math.random() * 100) + 5,
//     isFavorited: Math.random() > 0.7,
//     pdfUrl: `https://arxiv.org/pdf/2023.${String(i + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 999)).padStart(3, '0')}.pdf`,
//     doi: `10.1000/nature.2023.${i + 1}`
//   }
// })
