export interface Feature {
  id: string
  name: string
  placeholder?:string
  type: string
  values: {
    id: string
    name: string
  }[]
}
