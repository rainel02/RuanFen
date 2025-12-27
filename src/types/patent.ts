export interface Patent {
  id: string
  title: string // 专利名称
  type: string // 专利类型
  applicant: string // 申请人
  applicationNumber: string // 申请号
  applicationYear: string // 申请年份
  publicationNumber: string // 授权公告号
  publicationYear: string // 授权公告年份
  ipcClassification: string // IPC分类号
  inventors: string[] // 发明人
  abstract: string // 摘要文本
  claims: string // 主权项内容
  currentAssignee: string // 当前权利人
}

export interface PatentSearchFilters {
  q?: string
  type?: string
  applicant?: string
  inventor?: string
  startDate?: string
  endDate?: string
}
