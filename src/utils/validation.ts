import { Feature } from '@/types'
import * as Yup from 'yup'

export const phoneSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('شماره تماس الزامی است')
    .matches(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
})

export const adminPhoneSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('شماره تماس الزامی است')
    .matches(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
  security_number: Yup.string().required('کد ملی الزامی است'),
})

export const codeSchema = Yup.object().shape({
  code: Yup.string().length(6, 'کد باید ۵ رقمی باشد').required('کد تایید الزامی است'),
})

export const advertisementRegistrationFormSchema = Yup.object().shape({
  price: Yup.string().required('قیمت الزامی است'),
  discount: Yup.string().optional(),
})

export const contactUsFormSchema = Yup.object().shape({
  fullName: Yup.string().required('نام خانوادگی الزامی است'),
  mobileNumber: Yup.string()
    .required('شماره تماس الزامی است')
    .matches(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
  address: Yup.string().optional(),
  description: Yup.string().optional(),
})

export const validationSchema = (contextData: { features: Feature[]; dealType: string }) =>
  Yup.object().shape({
    // مرحله 1
    phoneNumber: Yup.string()
      .required('شماره تماس الزامی است')
      .matches(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
    nationalCode: Yup.string().optional(),
    postalCode: Yup.string().required('کد پستی الزامی است').min(10, 'کد پستی معتبر نیست').max(10, 'کد پستی معتبر نیست'),
    address: Yup.string().required('آدرس الزامی است'),
    category: Yup.string().required('دسته‌بندی الزامی است'),
    location: Yup.object().shape({
      lat: Yup.number().required('موقعیت جغرافیایی الزامی است'),
      lng: Yup.number().required('موقعیت جغرافیایی الزامی است'),
    }),

    // مرحله 2
    // price: Yup.number()
    //   .transform((value) => (isNaN(value) || value === '' ? undefined : value))
    //   .when('$dealType', {
    //     is: 'sale',
    //     then: (schema) => schema.required('قیمت فروش الزامی است'),
    //     otherwise: (schema) => schema.nullable(),
    //   }),

    // discount: Yup.number()
    //   .transform((value) => (isNaN(value) || value === '' ? undefined : value))
    //   .when('$dealType', {
    //     is: 'sale',
    //     then: (schema) =>
    //       schema
    //         .nullable()
    //         .transform((value) => (isNaN(value) ? undefined : value))
    //         .min(0, 'تخفیف نمی‌تواند منفی باشد')
    //         .test('max-discount', 'تخفیف نمی‌تواند بیشتر از قیمت اصلی باشد', function (value) {
    //           return !value || value <= this.parent.price
    //         }),
    //     otherwise: (schema) => schema.nullable(),
    //   }),

    // deposit: Yup.number()
    //   .transform((value) => (isNaN(value) || value === '' ? undefined : value))
    //   .when('$dealType', {
    //     is: 'rent',
    //     then: (schema) => schema.required('مبلغ ودیعه الزامی است'),
    //     otherwise: (schema) => schema.nullable(),
    //   }),

    // rent: Yup.number()
    //   .transform((value) => (isNaN(value) || value === '' ? undefined : value))
    //   .when('$dealType', {
    //     is: 'rent',
    //     then: (schema) => schema.required('مبلغ اجاره ماهیانه الزامی است'),
    //     otherwise: (schema) => schema.nullable(),
    //   }),

    // capacity: Yup.number()
    //   .transform((value) => (isNaN(value) || value === '' ? undefined : value))
    //   .when('$dealType', {
    //     is: 'shortRent',
    //     then: (schema) => schema.required('تعیین ظرفیت الزامی است'),
    //     otherwise: (schema) => schema.nullable(),
    //   }),

    // producerProfitPercentage: Yup.number()
    //   .transform((value) => (isNaN(value) || value === '' ? undefined : value))
    //   .when('$dealType', {
    //     is: 'constructionProjects',
    //     then: (schema) => schema.required('تعیین سود سازنده الزامی است'),
    //     otherwise: (schema) => schema.nullable(),
    //   }),

    // ownerProfitPercentage: Yup.number()
    //   .transform((value) => (isNaN(value) || value === '' ? undefined : value))
    //   .when('$dealType', {
    //     is: 'constructionProjects',
    //     then: (schema) => schema.required('تعیین سود مالک الزامی است'),
    //     otherwise: (schema) => schema.nullable(),
    //   }),

    title: Yup.string().required('عنوان الزامی است').min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
    description: Yup.string().required('توضیحات الزامی است').min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),

    // مرحله 3: فیلدهای داینامیک
    features: Yup.object().shape(
      contextData &&
        contextData.features
          .filter(
            (item) =>
              item.type === 'text' &&
              item.key !== 'text_discount' &&
              item.key !== 'text_mortgage_deposit' &&
              item.key !== 'text_monthly_rent'
          )
          .reduce((schema, field) => {
            schema[field.id] = Yup.string()
              .required(`${field.name} الزامی است`)
              .test('custom-condition', `${field.name} شرط خاصی را نقض کرده است`, function (value) {
                const context = this.options.context // دسترسی به context
                return context?.someCondition ? true : !!value
              })
            return schema
          }, {} as Record<string, Yup.StringSchema>)
    ),
  })

export const validationRequestSchema = (contextData: { features: Feature[]; dealType: string }) =>
  Yup.object().shape({
    // مرحله 1
    fullName: Yup.string().required('نام و نام خانوادگی الزامی است'),
    phoneNumber: Yup.string()
      .required('شماره تماس الزامی است')
      .matches(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
    category: Yup.string().required('دسته‌بندی الزامی است'),
    location: Yup.object().shape({
      lat: Yup.number().required('موقعیت جغرافیایی الزامی است'),
      lng: Yup.number().required('موقعیت جغرافیایی الزامی است'),
    }),

    // مرحله 2
    priceRange: Yup.object().shape({
      from: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .when('$dealType', {
          is: 'sale',
          then: (schema) => schema.required('قیمت فروش از الزامی است'),
          otherwise: (schema) => schema.nullable(),
        }),
      to: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .when('$dealType', {
          is: 'sale',
          then: (schema) => schema.required('قیمت فروش تا الزامی است'),
          otherwise: (schema) => schema.nullable(),
        }),
    }),
    discount: Yup.number()
      .transform((value) => (isNaN(value) || value === '' ? undefined : value))
      .nullable(),

    depositRange: Yup.object().shape({
      from: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .when('$dealType', {
          is: 'rent',
          then: (schema) => schema.required('رهن یا ودیعه از الزامی است'),
          otherwise: (schema) => schema.nullable(),
        }),
      to: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .when('$dealType', {
          is: 'rent',
          then: (schema) => schema.required('رهن یا ودیعه تا الزامی است'),
          otherwise: (schema) => schema.nullable(),
        }),
    }),
    rent: Yup.object().shape({
      from: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .when('$dealType', {
          is: 'rent',
          then: (schema) => schema.required('اجاره ماهیانه از الزامی است'),
          otherwise: (schema) => schema.nullable(),
        }),
      to: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .when('$dealType', {
          is: 'rent',
          then: (schema) => schema.required('اجاره ماهیانه تا الزامی است'),
          otherwise: (schema) => schema.nullable(),
        }),
    }),
    capacity: Yup.object().shape({
      from: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .when('$dealType', {
          is: 'shortRent',
          then: (schema) => schema.required('ظرفیت از الزامی است'),
          otherwise: (schema) => schema.nullable(),
        }),
      to: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .when('$dealType', {
          is: 'shortRent',
          then: (schema) => schema.required('ظرفیت تا الزامی است'),
          otherwise: (schema) => schema.nullable(),
        }),
    }),
    extraPeople: Yup.object().shape({
      from: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .nullable(),
      to: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .nullable(),
    }),
    producerProfitPercentage: Yup.object().shape({
      from: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .when('$dealType', {
          is: 'constructionProjects',
          then: (schema) => schema.required('درصد سود سازنده از الزامی است'),
          otherwise: (schema) => schema.nullable(),
        }),
      to: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .when('$dealType', {
          is: 'constructionProjects',
          then: (schema) => schema.required('درصد سود سازنده تا الزامی است'),
          otherwise: (schema) => schema.nullable(),
        }),
    }),
    ownerProfitPercentage: Yup.object().shape({
      from: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .when('$dealType', {
          is: 'constructionProjects',
          then: (schema) => schema.required('درصد سود مالک از الزامی است'),
          otherwise: (schema) => schema.nullable(),
        }),
      to: Yup.number()
        .transform((value) => (isNaN(value) || value === '' ? undefined : value))
        .when('$dealType', {
          is: 'constructionProjects',
          then: (schema) => schema.required('درصد سود مالک تا الزامی است'),
          otherwise: (schema) => schema.nullable(),
        }),
    }),

    title: Yup.string().required('عنوان الزامی است'),

    // // مرحله 3: فیلدهای داینامیک
    // features: Yup.object().shape(
    //   contextData &&
    //     contextData.features
    //       .filter((item) => item.type === '')
    //       .reduce((schema, field) => {
    //         schema[field.id] = Yup.string()
    //           .required(`${field.name} الزامی است`)
    //           .test('custom-condition', `${field.name} شرط خاصی را نقض کرده است`, function (value) {
    //             const context = this.options.context // دسترسی به context
    //             return context?.someCondition ? true : !!value
    //           })
    //         return schema
    //       }, {} as Record<string, Yup.StringSchema>)
    // ),
  })

export const marketerUserFormValidationSchema = Yup.object().shape({
  fullName: Yup.string().required('نام و نام خانوادگی الزامی است'),

  fatherName: Yup.string().required('نام پدر الزامی است'),

  notionalCode: Yup.string()
    .required('کد ملی الزامی است')
    .matches(/^[0-9]{10}$/, 'کد ملی باید ۱۰ رقم باشد'),

  idCode: Yup.string()
    .required('شماره شناسنامه الزامی است')
    .matches(/^[0-9]{1,10}$/, 'شماره شناسنامه معتبر نیست'),

  birthDate: Yup.string().required('تاریخ تولد الزامی است'),

  bankAccountNumber: Yup.string()
    .required('شماره حساب بانکی الزامی است')
    .matches(/^[0-9]{1,30}$/, 'شماره حساب بانکی معتبر نیست'),

  shabaNumber: Yup.string().required('شماره شبا الزامی است'),

  maritalStatus: Yup.string().required('وضعیت تأهل الزامی است'),

  nationalCardFrontImage: Yup.mixed().required('عکس روی کارت ملی الزامی است'),

  nationalCardBackImage: Yup.mixed().required('عکس پشت کارت ملی الزامی است'),

  IdImage: Yup.mixed().required('عکس شناسنامه الزامی است'),

  scannedImage: Yup.mixed().optional(),

  agreeToTerms: Yup.boolean().required('موافقت با قوانین الزامی است'),
})

export const userInfoFormValidationSchema = Yup.object().shape({
  mobileNumber: Yup.string()
    .required('شماره موبایل الزامی است')
    .matches(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'), // شروع با 09 و ۱۱ رقم
  province: Yup.object()
    .shape({
      id: Yup.number().nullable(),
      name: Yup.string().nullable(),
    })
    .nullable()
    .optional(),
  city: Yup.object()
    .shape({
      id: Yup.number().nullable(),
      name: Yup.string().nullable(),
    })
    .nullable()
    .optional()
    .test('required-if-province', 'اگر استان انتخاب شده است، شهر هم باید انتخاب شود', function (value) {
      const { province } = this.parent
      // If province is not selected or has no ID, city is optional
      if (!province || !province.id) {
        return true
      }
      // If province is selected (has an ID), city is required and must have an ID
      return !!(value && value.id)
    }),
})

export const estateConsultantRegisterFormValidationSchema = Yup.object().shape({
  fullName: Yup.string().required('نام و نام خانوادگی الزامی است'),
  fatherName: Yup.string().required('نام پدر الزامی است'),
  notionalCode: Yup.string().required('کد ملی الزامی است'),
})

export const adminFormValidationSchema = Yup.object().shape({
  full_name: Yup.string().required('نام و نام خانوادگی الزامی است'),
  phone_number: Yup.string()
    .required('شماره موبایل الزامی است')
    .matches(/^(09[0-9]{9})$/, 'شماره موبایل معتبر نیست'),
  email: Yup.string().required('ایمیل الزامی است').email('ایمیل معتبر نیست'),
  password: Yup.string().required('رمز عبور الزامی است').min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password')], 'رمز عبور مطابقت ندارد')
    .required('تکرار رمز عبور الزامی است'),
  city: Yup.object().shape({
    id: Yup.number().required('شهر الزامی است'),
  }),
  security_number: Yup.string().required('کد امنیتی الزامی است'),
})
