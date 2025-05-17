export interface Feature {
  id: string
  name: string
  placeholder?: string
  key?: string
  type: string
  value:
    | string
    | {
        id: string
        value: string
      }[]
  image?: string
}

