export type MsgResult = { message: string }

// Types for new API responses
export type LoginResult = {
  target: string
  message_id: number
  code: string
}

export type LoginErrorResult = {
  detail: {
    message: string
    code: string
    extra: Record<string, any>
  }
}

export type VerifyLoginResult = {
  access_token: string
  expire_at: string
  user_info: {
    id: number
    phone_number: string
    roles: string[]
  }
}

export type UserMeResult = {
  id: number
  phone_number: string
  roles: string[]
}

export type LoginQuery = {
  phoneNumber: string
}

export type VerifyLoginQuery = {
  phoneNumber: string
  code: string
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
