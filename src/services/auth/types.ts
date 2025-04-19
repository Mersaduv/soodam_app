export type MsgResult = { message: string }

interface ResultBody {
  token: string
}
export type LoginResult = { code: string; message: string }
export type VerifyLoginResult = ResultBody

export type LoginQuery = {
  phoneNumber: string
}
export type VerifyLoginQuery = {
  code: string
  phoneNumber?: string
  role?: string | string[]
}
