export interface Feature {
  id: string
  name: string
  placeholder?: string
  key?: string
  type: string
  value:
    | string
    | boolean
    | {
        id: string
        value: string
      }
  image?: string
  icon?: string
}

