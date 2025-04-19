import { Category, Feature } from "@/types"

export interface IdQuery {
    id: string
  }
  
export interface MetaData {
  main_categories: Category[]
  features: Feature[]
}
