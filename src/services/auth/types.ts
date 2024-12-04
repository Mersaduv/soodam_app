
export type MsgResult = { message: string }

interface ResultBody {
  roles: string[]
  phoneNumber: string
  fullName: string
}
export type LoginResult = { code : string }
export type VerifyLoginResult = ResultBody

export type LoginQuery = {
  phoneNumber: string
}
export type VerifyLoginQuery = {
  code: string
}
 