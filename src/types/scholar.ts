export interface Scholar {
  id: string
  name: string
  avatar?: string
  title: string
  institution: string
  fields: string[]
  hIndex: number
  citations: number
  papers: number
  isFollowed: boolean
  email?: string
  bio?: string
}