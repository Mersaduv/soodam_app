export interface Category {
  id: string
  name: string
  description?: string
  status?: boolean
  key?: string
  main_category?: string
  sub_category?: string
  review?: number
  total_adv?: number
  image?: string
  sub_categories?: Category[]
  sub_sub_category?: Category[]
}
