export interface Estate {
  id: string
  name: string
  city: string
  location: { lat: number; lng: number }
  address: string
  image: string
  housing: any
  userInfo: {
    fullName: string
    fatherName: string
    notionalCode: string
    businessLicense: number
    tradeLicense: number
    phoneNumber: string
    businessLicenseImage: string
    nationalCardBackImage: string
    nationalCardFrontImage: string
    birthCertificateImage: string
  }
  accountManage: {
    id: string
    type: 'withdrawal' | 'deposit'
    price: number
    created: string
    updated: string
  }[]
  marketerUser: {
    id: string
    fullName: string
    fatherName: string
    birthDate: string
    notionalCode: string
    idCode: string
    gender: 'مرد' | 'زن'
    maritalStatus: 'مجرد' | 'متاهل'
    bankAccountNumber: string
    marketerCode: string
    shabaNumber: string
    city: string
    phoneNumber: string
    email: string
    address: string
    activityChart: any
  }[]
}
