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
  userType?: string | string[]
}
export type UpdateUserInfoQuery = {
  id: string;
  first_name: string;
  last_name: string;
  father_name: string;
  security_number: string;
  email: string;
  birthday: string;
  gender: string;
  full_address: {
      id: string;
      province_id: number;
      city_id: number;
      longitude: number;
      latitude: number;
  };
}
