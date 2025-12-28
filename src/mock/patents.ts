import type { Patent } from '../types/patent'

const patentTypes = ['发明专利', '实用新型', '外观设计']
const applicants = [
  '华为技术有限公司',
  '腾讯科技（深圳）有限公司',
  '阿里巴巴集团控股有限公司',
  '百度在线网络技术（北京）有限公司',
  '清华大学',
  '浙江大学',
  '国家电网公司',
  '京东方科技集团股份有限公司'
]

const inventorsList = [
  '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'
]

const generateRandomInventors = () => {
  const count = Math.floor(Math.random() * 3) + 1
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(inventorsList[Math.floor(Math.random() * inventorsList.length)])
  }
  return [...new Set(result)]
}

export const mockPatents: Patent[] = Array.from({ length: 50 }, (_, i) => {
  const type = patentTypes[Math.floor(Math.random() * patentTypes.length)]
  const applicant = applicants[Math.floor(Math.random() * applicants.length)]
  const year = 2015 + Math.floor(Math.random() * 10)
  
  return {
    id: `pat-${i + 1}`,
    title: `一种基于人工智能的${type === '外观设计' ? '显示设备' : '数据处理方法及系统'} ${i + 1}`,
    type: type,
    applicant: applicant,
    applicationNumber: `CN${year}10${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
    applicationYear: year.toString(),
    publicationNumber: `CN10${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}B`,
    publicationYear: (year + 1).toString(),
    ipcClassification: `G06F${Math.floor(Math.random() * 20)}/00`,
    inventors: generateRandomInventors(),
    abstract: `本发明公开了一种${type === '外观设计' ? '显示设备' : '数据处理方法及系统'}，涉及${type === '外观设计' ? '电子设备' : '计算机'}技术领域。该方案通过引入深度学习算法，解决了传统方法在处理大规模数据时效率低下的问题。具体包括：步骤1，获取输入数据；步骤2，进行预处理；步骤3，输入模型进行推理；步骤4，输出结果。本发明能够显著提高处理速度和准确率。`,
    claims: `1. 一种${type === '外观设计' ? '显示设备' : '数据处理方法'}，其特征在于，包括：\n获取待处理数据；\n利用预训练的神经网络模型对所述待处理数据进行特征提取；\n根据提取的特征生成处理结果。\n2. 根据权利要求1所述的方法，其特征在于，所述神经网络模型为卷积神经网络。\n3. 根据权利要求1所述的方法，其特征在于，所述待处理数据为图像数据。`,
    currentAssignee: applicant
  }
})
