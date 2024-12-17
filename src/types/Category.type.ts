export interface Category {
  id: string
  name: string
  description?: string
  isActive?: boolean
  imageUrl?: string
  children?: Category[]
}
