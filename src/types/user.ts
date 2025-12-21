export interface User {
  id: string
  username: string
  email: string
  role?: string
  avatar?: string
  name?: string
  title?: string
  institution?: string
  researchFields?: string[]
  hIndex?: number
  citations?: number
  papers?: number
  bio?: string
}