import { Housing, ServiceResponse } from '@/types'

export interface IdQuery {
  id: string
}
export type GetHousingResult = ServiceResponse<Housing[]>
export interface UploadResult {
  media_url: { media: string; type: string }[]
  detail: string
}