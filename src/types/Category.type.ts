export interface Category {
  id: string
  name: string
  description?: string
  status?: boolean
  key?: string
  review?: number
  total_adv?: number
  image?: string
  sub_categories?: Category[]
  parentCategory?: Category
}
