import * as Yup from 'yup'

export const phoneSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(/^09[0-9]{9}$/, 'شماره موبایل نامعتبر است')
    .required('شماره موبایل الزامی است'),
})

export const codeSchema = Yup.object().shape({
  code: Yup.string().length(6, 'کد باید ۵ رقمی باشد').required('کد تایید الزامی است'),
})
