export interface Patent {
  id: string
  title: string // 专利名称
  type: string // 专利类型
  applicant: string // 申请人（可能为分号分隔的多项）
  applicantType?: string // 申请人类型（机构/个人，可选）
  applicationNumber: string // 申请号
  applicationYear: string // 申请年份（字符串形式）
  publicationNumber?: string // 授权/公告号（可选）
  publicationYear?: string // 授权/公告年份（可选）
  ipcClassification?: string // IPC分类号（可能为分号分隔的字符串）
  inventors: string[] // 发明人数组（由后端分号分隔字符串转换）
  abstract: string // 摘要文本
  claims?: string // 主权项内容（可选）
  currentAssignee?: string // 当前权利人（可选）
  citedCount?: number // 被引次数（可选）
  grantNumber?: string // 授权号，等价于 publicationNumber 的可选别名
}

export interface PatentSearchFilters {
  q?: string
  type?: string
  applicant?: string
  inventor?: string
  startDate?: string
  endDate?: string
  applicationYear?: number | string
  grantYear?: number | string
}
