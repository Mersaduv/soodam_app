import type { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import type { SerializedError } from '@reduxjs/toolkit'

interface CustomError {
  status: number
  data: {
    message: string
  }
}

const getErrorMessage = (error: FetchBaseQueryError | SerializedError): string => {
  if (error && 'status' in error && 'data' in error) {
    const customError = error as CustomError
    return customError.data?.message || 'متاسفانه خطایی رخ داده است'
  }
  return 'متاسفانه خطایی رخ داده است'
}

export default getErrorMessage
