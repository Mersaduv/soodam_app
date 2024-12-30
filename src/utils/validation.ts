import { Feature } from '@/types';
import * as Yup from 'yup'

export const phoneSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(/^09[0-9]{9}$/, 'شماره موبایل نامعتبر است')
    .required('شماره موبایل الزامی است'),
})

export const codeSchema = Yup.object().shape({
  code: Yup.string().length(6, 'کد باید ۵ رقمی باشد').required('کد تایید الزامی است'),
})

export const advertisementRegistrationFormSchema = Yup.object().shape({
  price: Yup.string().required('قیمت الزامی است'),
  discount: Yup.string().optional(),
});

export const validationSchema = (contextData: { features: Feature[]; dealType: string }) =>
  Yup.object().shape({
    // مرحله 1
    phoneNumber: Yup.string()
      .required('شماره تماس الزامی است')
      .matches(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
    nationalCode: Yup.string()
      .matches(/^[0-9]{10}$/, 'کد ملی معتبر نیست')
      .optional(),
    postalCode: Yup.string()
      .required('کد پستی الزامی است')
      .min(5, 'کد پستی معتبر نیست'),
    address: Yup.string().required('آدرس الزامی است'),
    category: Yup.string().required('دسته‌بندی الزامی است'),
    location: Yup.object().shape({
      lat: Yup.number().required('موقعیت جغرافیایی الزامی است'),
      lng: Yup.number().required('موقعیت جغرافیایی الزامی است'),
    }),

    // مرحله 2
    price: Yup.number()
      .transform((value) => (isNaN(value) || value === '' ? undefined : value))
      .when('$dealType', {
        is: 'sale',
        then: (schema) => schema.required('قیمت فروش الزامی است'),
        otherwise: (schema) => schema.nullable(),
      }),

    discount: Yup.number()
      .transform((value) => (isNaN(value) || value === '' ? undefined : value))
      .when('$dealType', {
        is: 'sale',
        then: (schema) =>
          schema
            .nullable()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, 'تخفیف نمی‌تواند منفی باشد')
            .test('max-discount', 'تخفیف نمی‌تواند بیشتر از قیمت اصلی باشد', function (value) {
              return !value || value <= this.parent.price;
            }),
        otherwise: (schema) => schema.nullable(),
      }),

    deposit: Yup.number()
      .transform((value) => (isNaN(value) || value === '' ? undefined : value))
      .when('$dealType', {
        is: 'rent',
        then: (schema) => schema.required('مبلغ ودیعه الزامی است'),
        otherwise: (schema) => schema.nullable(),
      }),

    rent: Yup.number()
      .transform((value) => (isNaN(value) || value === '' ? undefined : value))
      .when('$dealType', {
        is: 'rent',
        then: (schema) => schema.required('مبلغ اجاره ماهیانه الزامی است'),
        otherwise: (schema) => schema.nullable(),
      }),

    capacity: Yup.number()
      .transform((value) => (isNaN(value) || value === '' ? undefined : value))
      .when('$dealType', {
        is: 'shortRent',
        then: (schema) => schema.required('تعیین ظرفیت الزامی است'),
        otherwise: (schema) => schema.nullable(),
      }),

    producerProfitPercentage: Yup.number()
      .transform((value) => (isNaN(value) || value === '' ? undefined : value))
      .when('$dealType', {
        is: 'constructionProjects',
        then: (schema) => schema.required('تعیین سود سازنده الزامی است'),
        otherwise: (schema) => schema.nullable(),
      }),

    ownerProfitPercentage: Yup.number()
      .transform((value) => (isNaN(value) || value === '' ? undefined : value))
      .when('$dealType', {
        is: 'constructionProjects',
        then: (schema) => schema.required('تعیین سود مالک الزامی است'),
        otherwise: (schema) => schema.nullable(),
      }),

      title: Yup.string()
      .required('عنوان الزامی است'),

    // مرحله 3: فیلدهای داینامیک
    features: Yup.object().shape(
      contextData && contextData.features.reduce((schema, field) => {
        schema[field.id] = Yup.string()
          .required(`${field.name} الزامی است`)
          .test(
            'custom-condition',
            `${field.name} شرط خاصی را نقض کرده است`,
            function (value) {
              const context = this.options.context; // دسترسی به context
              return context?.someCondition ? true : !!value;
            }
          );
        return schema;
      }, {} as Record<string, Yup.StringSchema>)
    ),

    // مرحله 4
    media: Yup.object().shape({
      images: Yup.array().min(1, 'حداقل یک تصویر الزامی است'),
      video: Yup.mixed().optional(),
    }),
  });
