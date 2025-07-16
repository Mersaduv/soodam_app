import { Feature, Category, SubscriptionPlan, User, AdFormValues } from '@/types'
import { generateUUID, UserRoleType } from '@/utils'
import { rest } from 'msw'
import { point, booleanPointInPolygon } from '@turf/turf'
import { polygon as turfPolygon } from '@turf/helpers'
import distance from '@turf/distance'

const getRandomLocation = (baseLat: number, baseLng: number, offset: number) => {
  const randomLat = baseLat + (Math.random() - 0.5) * offset
  const randomLng = baseLng + (Math.random() - 0.5) * offset
  return { lat: parseFloat(randomLat.toFixed(6)), lng: parseFloat(randomLng.toFixed(6)) }
}
function normalizePersian(str: string): string {
  return str
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[^\u0600-\u06FF\s]/g, '') // حذف علائم غیر فارسی
    .trim()
    .toLowerCase()
}

function getFuzzyScore(str: string, keyword: string): number {
  if (str.includes(keyword)) return 100

  let matchCount = 0
  for (let i = 0; i < Math.min(str.length, keyword.length); i++) {
    if (str[i] === keyword[i]) matchCount++
  }

  return (matchCount / keyword.length) * 100
}

const verificationCodes = new Map<string, string>()
// export interface User {
//   id: string
//   phoneNumber: string
//   role: 'BASIC' | 'MEMBER' | 'SUBSCRIBER'
//   subscription?: {
//     type: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
//     remainingViews: number
//     totalViews: number
//     startDate: string
//     endDate: string
//     status: 'ACTIVE' | 'EXPIRED'
//   }
// }

export const users = new Map<string, User>()

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly-1000',
    title: 'اشتراک ماهیانه',
    duration: 'MONTHLY',
    viewLimit: 1000,
    price: 3000000,
  },
  {
    id: 'monthly-2000',
    title: 'اشتراک ماهیانه',
    duration: 'MONTHLY',
    viewLimit: 2000,
    price: 4000000,
  },
  {
    id: 'monthly-3000',
    title: 'اشتراک ماهیانه',
    duration: 'MONTHLY',
    viewLimit: 3000,
    price: 5000000,
  },
  {
    id: 'quarterly-5000',
    title: 'اشتراک 3 ماهه',
    duration: 'QUARTERLY',
    viewLimit: 5000,
    price: 12000000,
    discount: 20,
  },
  {
    id: 'yearly-unlimited',
    title: 'اشتراک یک ساله',
    duration: 'YEARLY',
    viewLimit: -1, // unlimited
    price: 42000000,
    discount: 30,
  },
]

function getFeaturesByCategory(categoryId: string) {
  const categoryFeatures: Set<string> = new Set()

  const collectFeatures = (category: Category | undefined): void => {
    if (!category) return

    featureCategories.filter((fc) => fc.categoryId === category.id).forEach((fc) => categoryFeatures.add(fc.featureId))

    if (category.sub_categories) {
      category.sub_categories.forEach(collectFeatures)
    }
  }

  const rootCategory = categories.find((cat) => cat.id === categoryId)
  collectFeatures(rootCategory)

  return features.filter((feature) => categoryFeatures.has(feature.id))
}

const newsData = [
  {
    id: '1',
    title: 'آموزش انجام معامله ی امن و دریافت پول',
    image: '/static/R.jfif',
    descriptions: '',
    category: 'آموزش',
    keyword: '',
    viewCount: '20',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'پاسخ به همه سوال هایی که درباره پرداخت امن دارید',
    image: '/static/R2.jpg',
    descriptions: '',
    category: 'داستان کاربران',
    keyword: '',
    viewCount: '16',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'دسترسی پذیری درگاه های پرداختی ',
    image: '/static/R (1).jfif',
    descriptions: '',
    category: 'آپدیت',
    keyword: '',
    viewCount: '20',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'افزونه آگاپه در اپلیکیشن اهدای هوشمند کالا به نیازمندان ',
    image: '/static/smart-house-cover.jpg',
    descriptions: '',
    category: 'آپدیت',
    keyword: '',
    viewCount: '20',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },

  {
    id: '5',
    title: 'آموزش انجام معامله ی امن و دریافت پول',
    image: '/static/R.jfif',
    descriptions: '',
    category: 'آموزش',
    keyword: '',
    viewCount: '20',
    created: '2024-12-07T09:21:45.625Z',
    updated: '2024-12-07T09:21:45.625Z',
  },
  {
    id: '6',
    title: 'پاسخ به همه سوال هایی که درباره پرداخت امن دارید',
    image: '/static/R2.jpg',
    descriptions: '',
    category: 'داستان کاربران',
    keyword: '',
    viewCount: '16',
    created: '2024-12-07T09:21:45.625Z',
    updated: '2024-12-07T09:21:45.625Z',
  },
  {
    id: '7',
    title: 'دسترسی پذیری درگاه های پرداختی ',
    image: '/static/R (1).jfif',
    descriptions: '',
    category: 'آپدیت',
    keyword: '',
    viewCount: '20',
    created: '2024-12-07T09:21:45.625Z',
    updated: '2024-12-07T09:21:45.625Z',
  },
  {
    id: '8',
    title: 'افزونه آگاپه در اپلیکیشن اهدای هوشمند کالا به نیازمندان ',
    image: '/static/smart-house-cover.jpg',
    descriptions: '',
    category: 'آپدیت',
    keyword: '',
    viewCount: '20',
    created: '2024-12-07T09:21:45.625Z',
    updated: '2024-12-07T09:21:45.625Z',
  },
]

const requests = [
  {
    id: '1',
    title: 'ثبت درخواست',
    category: 'اجاره آپارتمان',
    categoryId: '1-1',
    status: 2,
    userInfo: {
      id: '1',
      fullName: 'محمد حسین حسینی',
      phoneNumber: '09123456789',
      email: 'test@test.com',
      image: '/static/62544dd3fc1adcec9ba30b7ccb57be92.jfif',
      gender: 'مرد',
    },
    highlightFeatures: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        title: 'متراژ',
        value: '75',
      },
    ],
    features: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        title: 'تعداد اتاق',
        value: '2',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        title: 'پارکینگ',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'انباری',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'نمای ساختمان',
        value: 'سنگ',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1366',
      },
    ],
    location: getRandomLocation(35.75, 51.41, 0.02),
    address: 'تهران، ونک،خیابان 33',
    deposit: 600000000,
    rent: 5000000,
    price: 0,
    ownerProfitPercentage: 0,
    producerProfitPercentage: 0,
    capacity: 0,
    extraPeople: 0,
    rentalTerm: null,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },

  {
    id: '2',
    title: 'خیابان جمهوری',
    category: 'مشارکت در ساخت',
    categoryId: '5-1',
    status: 2,
    userInfo: {
      id: '1',
      fullName: 'علی محمدی',
      phoneNumber: '09010101010',
      email: 'test@test.com',
      image: null,
      gender: 'مرد',
    },
    highlightFeatures: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        title: 'متراژ زمین',
        value: '130',
      },
    ],
    features: [
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'نمای ساختمان',
        value: 'سنگ',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1366',
      },
    ],
    location: getRandomLocation(35.75, 51.41, 0.02),
    address: 'تهران، ونک،خیابان 33',
    deposit: 0,
    rent: 0,
    price: 0,
    ownerProfitPercentage: 25,
    producerProfitPercentage: 75,
    capacity: 0,
    extraPeople: 0,
    rentalTerm: null,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
]

const housing = [
  {
    id: '1',
    status: 2,
    title: '۲۰۰ متر، محدوده ونک، بلوار دانش',
    location: getRandomLocation(35.75, 51.41, 0.02),
    highlightFeatures: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        title: 'تعداد اتاق',
        value: '3',
      },
      {
        id: '2',
        image: '/static/ads/grid-2.png',
        title: 'متر مربع',
        value: '3',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1377',
      },
    ],
    features: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        title: 'تعداد اتاق',
        value: '2',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        title: 'پارکینگ',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'انباری',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'نمای ساختمان',
        value: 'سنگ',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1366',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'استخر',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سونا',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سیستم گرمایش:',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'وان و جکوزی',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'موقعیت جغرافیایی',
        value: 'شمالی',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'بالکن',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'تعداد کل طبقات ساختمان',
        value: '4',
      },
    ],
    deposit: 600000000,
    rent: 5000000,
    price: 0,
    ownerProfitPercentage: 0,
    producerProfitPercentage: 0,
    capacity: 0,
    extraPeople: 0,
    rentalTerm: null,
    address: 'تهران، ونک،خیابان 33',
    categoryId: '1-1',
    category: 'اجاره آپارتمان',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    adCode: 'A10001',
    images: [
      '/static/ads/pic1.jpg',
      '/static/ads/pic2.jpg',
      '/static/ads/pic3.jpg',
      '/static/ads/pic4.jpg',
      '/static/ads/pic5.jpg',
    ],
    views: 21,
    save: 0,
    contactOwner: '09334004040',
    description: ' آسانسور، سندتکبرگ، وام دار',
  },
  {
    id: '2',
    status: 2,
    title: '  محدوده ولنجک، بلوار ',
    location: getRandomLocation(35.75, 51.41, 0.02),
    highlightFeatures: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        title: 'تعداد اتاق',
        value: '3',
      },
      {
        id: '2',
        image: '/static/ads/grid-2.png',
        title: 'متر مربع',
        value: '3',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1377',
      },
    ],
    features: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        title: 'تعداد اتاق',
        value: '2',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        title: 'پارکینگ',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'انباری',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'نمای ساختمان',
        value: 'سنگ',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1366',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'استخر',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سونا',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سیستم گرمایش:',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'وان و جکوزی',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'موقعیت جغرافیایی',
        value: 'شمالی',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'بالکن',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'تعداد کل طبقات ساختمان',
        value: '4',
      },
    ],
    deposit: 0,
    rent: 0,
    price: 1400000000,
    ownerProfitPercentage: 0,
    producerProfitPercentage: 0,
    capacity: 0,
    extraPeople: 0,
    rentalTerm: null,
    address: 'تهران، ونک،خیابان 33',
    categoryId: '2-1',
    category: 'فروش آپارتمان',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    adCode: 'A10002',
    images: [
      '/static/ads/pic1.jpg',
      '/static/ads/pic2.jpg',
      '/static/ads/pic3.jpg',
      '/static/ads/pic4.jpg',
      '/static/ads/pic5.jpg',
    ],
    views: 21,
    save: 0,
    contactOwner: '09334003030',
    description: ' آسانسور، سندتکبرگ، وام دار',
  },
  {
    id: '3',
    status: 2,
    title: 'دعوت از سازنده جهت مشارکت در ساخت فاز8پردیس ',
    location: getRandomLocation(35.75, 51.41, 0.02),
    highlightFeatures: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        title: 'تعداد اتاق',
        value: '3',
      },
      {
        id: '2',
        image: '/static/ads/grid-2.png',
        title: 'متر مربع',
        value: '3',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1377',
      },
    ],
    features: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        title: 'تعداد اتاق',
        value: '2',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        title: 'پارکینگ',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'انباری',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'نمای ساختمان',
        value: 'سنگ',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1366',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'استخر',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سونا',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سیستم گرمایش:',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'وان و جکوزی',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'موقعیت جغرافیایی',
        value: 'شمالی',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'بالکن',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'تعداد کل طبقات ساختمان',
        value: '4',
      },
    ],
    deposit: 0,
    rent: 0,
    price: 0,
    ownerProfitPercentage: 10,
    producerProfitPercentage: 5,
    capacity: 0,
    extraPeople: 0,
    rentalTerm: null,
    address: 'تهران، ونک،خیابان 33',
    categoryId: '5-1-1',
    category: 'مالک',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    adCode: 'A10003',
    images: [
      '/static/ads/pic1.jpg',
      '/static/ads/pic2.jpg',
      '/static/ads/pic3.jpg',
      '/static/ads/pic4.jpg',
      '/static/ads/pic5.jpg',
    ],
    views: 21,
    save: 0,
    contactOwner: '09124003030',
    description: ' آسانسور، سندتکبرگ، وام دار',
  },
  {
    id: '4',
    status: 2,
    title: 'اجاره روزانه/هفتگی/ماهانه آپارتمان ۴۰ متری ',
    location: getRandomLocation(35.75, 51.41, 0.02),
    highlightFeatures: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        title: 'تعداد اتاق',
        value: '3',
      },
      {
        id: '2',
        image: '/static/ads/grid-2.png',
        title: 'متر مربع',
        value: '3',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1377',
      },
    ],
    features: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        title: 'تعداد اتاق',
        value: '2',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        title: 'پارکینگ',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'انباری',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'نمای ساختمان',
        value: 'سنگ',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1366',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'استخر',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سونا',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سیستم گرمایش:',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'وان و جکوزی',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'موقعیت جغرافیایی',
        value: 'شمالی',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'بالکن',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'تعداد کل طبقات ساختمان',
        value: '4',
      },
    ],
    deposit: 0,
    rent: 0,
    price: 0,
    ownerProfitPercentage: 0,
    producerProfitPercentage: 0,
    capacity: 10,
    extraPeople: 2,
    rentalTerm: {
      id: '2',
      name: 'آخر هفته (چهارشنبه تا جمعه)',
    },
    address: 'تهران، ونک،خیابان 33',
    categoryId: '5-1-1',
    category: 'مالک',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    adCode: 'A10004',
    images: [
      '/static/ads/pic1.jpg',
      '/static/ads/pic2.jpg',
      '/static/ads/pic3.jpg',
      '/static/ads/pic4.jpg',
      '/static/ads/pic5.jpg',
    ],
    views: 21,
    save: 0,
    contactOwner: '09115030300',
    description: ' آسانسور، سندتکبرگ، وام دار',
  },

  {
    id: '5',
    status: 1,
    title: ' 200 متر، محدوده بلوار دانش',
    location: getRandomLocation(35.75, 51.41, 0.02),
    highlightFeatures: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        title: 'تعداد اتاق',
        value: '3',
      },
      {
        id: '2',
        image: '/static/ads/grid-2.png',
        title: 'متر مربع',
        value: '3',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1377',
      },
    ],
    features: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        title: 'تعداد اتاق',
        value: '2',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        title: 'پارکینگ',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'انباری',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'نمای ساختمان',
        value: 'سنگ',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1366',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'استخر',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سونا',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سیستم گرمایش:',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'وان و جکوزی',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'موقعیت جغرافیایی',
        value: 'شمالی',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'بالکن',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'تعداد کل طبقات ساختمان',
        value: '4',
      },
    ],
    deposit: 600000000,
    rent: 5000000,
    price: 0,
    ownerProfitPercentage: 0,
    producerProfitPercentage: 0,
    capacity: 0,
    extraPeople: 0,
    rentalTerm: null,
    address: 'تهران، ونک،خیابان 33',
    categoryId: '1-1',
    category: 'اجاره آپارتمان',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    adCode: 'A10001',
    images: [
      '/static/ads/pic1.jpg',
      '/static/ads/pic2.jpg',
      '/static/ads/pic3.jpg',
      '/static/ads/pic4.jpg',
      '/static/ads/pic5.jpg',
    ],
    views: 21,
    save: 0,
    contactOwner: '09334004040',
    description: ' آسانسور، سندتکبرگ، وام دار',
  },
  {
    id: '6',
    status: 2,
    title: 'محدوده ولنجک، بلوار ',
    location: getRandomLocation(35.75, 51.41, 0.02),
    highlightFeatures: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        title: 'تعداد اتاق',
        value: '1',
      },
      {
        id: '2',
        image: '/static/ads/grid-2.png',
        title: 'متراژ',
        value: '100',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1379',
      },
    ],
    features: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        title: 'تعداد اتاق',
        value: '2',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        title: 'پارکینگ',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'انباری',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'نمای ساختمان',
        value: 'سنگ',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1366',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'استخر',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سونا',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سیستم گرمایش:',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'وان و جکوزی',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'موقعیت جغرافیایی',
        value: 'شمالی',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'بالکن',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'تعداد کل طبقات ساختمان',
        value: '4',
      },
    ],
    deposit: 0,
    rent: 0,
    price: 1400000000,
    ownerProfitPercentage: 0,
    producerProfitPercentage: 0,
    capacity: 0,
    extraPeople: 0,
    rentalTerm: null,
    address: 'تهران، ونک،خیابان 33',
    categoryId: '2-1',
    category: 'فروش آپارتمان',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    adCode: 'A10002',
    images: [
      '/static/ads/pic1.jpg',
      '/static/ads/pic2.jpg',
      '/static/ads/pic3.jpg',
      '/static/ads/pic4.jpg',
      '/static/ads/pic5.jpg',
    ],
    views: 21,
    save: 0,
    contactOwner: '09334003030',
    description: ' آسانسور، سندتکبرگ، وام دار',
  },
  {
    id: '7',
    status: 3,
    title: 'دعوت از سازنده جهت مشارکت در ساخت فاز8پردیس ',
    location: getRandomLocation(35.75, 51.41, 0.02),
    highlightFeatures: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        title: 'تعداد اتاق',
        value: '1',
      },
      {
        id: '2',
        image: '/static/ads/grid-2.png',
        title: 'متراژ',
        value: '300',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1377',
      },
    ],
    features: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        title: 'تعداد اتاق',
        value: '2',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        title: 'پارکینگ',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'انباری',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'نمای ساختمان',
        value: 'سنگ',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سال ساخت',
        value: '1366',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'استخر',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سونا',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'سیستم گرمایش:',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'وان و جکوزی',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'موقعیت جغرافیایی',
        value: 'شمالی',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'بالکن',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        title: 'تعداد کل طبقات ساختمان',
        value: '4',
      },
    ],
    deposit: 0,
    rent: 0,
    price: 0,
    ownerProfitPercentage: 10,
    producerProfitPercentage: 5,
    capacity: 0,
    extraPeople: 0,
    rentalTerm: null,
    address: 'تهران، ونک،خیابان 33',
    categoryId: '5-1-1',
    category: 'مالک',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    adCode: 'A10003',
    images: [
      '/static/ads/pic1.jpg',
      '/static/ads/pic2.jpg',
      '/static/ads/pic3.jpg',
      '/static/ads/pic4.jpg',
      '/static/ads/pic5.jpg',
    ],
    views: 21,
    save: 0,
    contactOwner: '09124003030',
    description: ' سندتکبرگ، وام دار',
  },
]

const categories = [
  {
    id: '1',
    name: 'اجاره مسکونی',
    sub_categories: [
      { id: '1-1', name: 'اجاره آپارتمان', parentCategory: { id: '1', name: 'اجاره مسکونی' } },
      { id: '1-2', name: 'اجاره خانه و ویلا', parentCategory: { id: '1', name: 'اجاره مسکونی' } },
    ],
    image: '/category/house.png',
  },
  {
    id: '2',
    name: 'فروش مسکونی',
    sub_categories: [
      { id: '2-1', name: 'فروش آپارتمان', parentCategory: { id: '2', name: 'فروش مسکونی' } },
      { id: '2-2', name: 'فروش خانه و ویلا', parentCategory: { id: '2', name: 'فروش مسکونی' } },
      { id: '2-3', name: 'فروش زمین و کلنگی', parentCategory: { id: '2', name: 'فروش مسکونی' } },
    ],
    image: '/category/house.png',
  },
  {
    id: '3',
    name: 'فروش دفاتر اداری و تجاری',
    sub_categories: [
      { id: '3-1', name: 'فروش  دفتر کار، اداری و مطب', parentCategory: { id: '3', name: 'فروش دفاتر اداری و تجاری' } },
      { id: '3-2', name: 'فروش  مغازه و غرفه', parentCategory: { id: '3', name: 'فروش دفاتر اداری و تجاری' } },
      {
        id: '3-3',
        name: 'فروش  دفاتر صنعتی،کشاورزی و تجاری',
        parentCategory: { id: '3', name: 'فروش دفاتر اداری و تجاری' },
      },
    ],
    image: '/category/buildings.png',
  },
  {
    id: '4',
    name: 'اجاره دفاتر اداری و تجاری',
    sub_categories: [
      {
        id: '4-1',
        name: 'اجاره دفتر کار ، اداری و مطب',
        parentCategory: { id: '4', name: 'اجاره دفاتر اداری و تجاری' },
      },
      { id: '4-2', name: 'اجاره مغازه و غرفه', parentCategory: { id: '4', name: 'اجاره دفاتر اداری و تجاری' } },
      {
        id: '4-3',
        name: 'اجاره دفاتر صنعتی،کشاورزی و تجاری',
        parentCategory: { id: '4', name: 'اجاره دفاتر اداری و تجاری' },
      },
    ],
    image: '/category/buildings.png',
  },
  {
    id: '5',
    name: 'پروژه‌های ساخت و ساز',
    sub_categories: [
      {
        id: '5-1',
        name: 'مشارکت در ساخت املاک',
        parentCategory: { id: '5', name: 'پروژه‌های ساخت و ساز' },
        sub_categories: [
          { id: '5-1-1', name: 'مالک', parentCategory: { id: '5-1', name: 'مشارکت در ساخت املاک' } },
          { id: '5-1-2', name: 'سازنده', parentCategory: { id: '5-1', name: 'مشارکت در ساخت املاک' } },
        ],
      },
      { id: '5-2', name: 'پیش فروش', parentCategory: { id: '5', name: 'پروژه‌های ساخت و ساز' } },
    ],
    image: '/category/tr.png',
  },
  {
    id: '6',
    name: 'اجاره کوتاه مدت',
    sub_categories: [
      { id: '6-1', name: 'اجاره کوتاه مدت آپارتمان و سوئیت', parentCategory: { id: '6', name: 'اجاره کوتاه مدت' } },
      { id: '6-2', name: 'اجاره کوتاه مدت باغ و ویلا', parentCategory: { id: '6', name: 'اجاره کوتاه مدت' } },
      {
        id: '6-3',
        name: 'اجاره کوتاه مدت دفتر کار و فضای آموزشی',
        parentCategory: { id: '6', name: 'اجاره کوتاه مدت' },
      },
    ],
    image: '/category/buliding.png',
  },
]

const features = [
  // type empty (newer dates)
  {
    id: 'f87ac4d1',
    name: 'متراژ',
    placeholder: 'مثال : 100 متر',
    image: '/static/ads/......png',
    type: 'text',
    values: [],
    created: '2024-03-15T10:30:00Z',
    updated: '2024-06-20T14:45:00Z',
  },
  {
    id: 'f87ac4dDsfsd1',
    name: 'متراژ نیم طبقه',
    placeholder: 'مثال : 100 متر',
    type: 'text',
    values: [],
    created: '2024-03-10T09:20:00Z',
    updated: '2024-06-15T11:30:00Z',
  },
  {
    id: 'b92df63e',
    name: 'سال ساخت',
    placeholder: 'مثال : 1394 ',
    type: 'text',
    values: [],
    created: '2024-02-25T08:15:00Z',
    updated: '2024-05-30T16:20:00Z',
  },
  {
    id: 'b41ddsFer422224333',
    name: 'متراژ بر ملک',
    placeholder: 'متراژ بر ملک را وارد کنید',
    type: 'text',
    values: [],
    created: '2024-02-20T11:45:00Z',
    updated: '2024-05-25T13:10:00Z',
  },
  {
    id: 'b41ddsfssafsdse824333',
    name: 'متراژ زمین',
    placeholder: 'مثال : 100 متر',
    type: 'text',
    values: [],
    created: '2024-02-15T13:25:00Z',
    updated: '2024-05-20T15:40:00Z',
  },
  {
    id: 'f87safe3d1',
    name: 'گذر',
    placeholder: 'متراژ گذر را تایپ کنید',
    type: 'text',
    values: [],
    created: '2024-01-30T15:50:00Z',
    updated: '2024-04-25T10:15:00Z',
  },
  {
    id: '2d3acsdf333d1',
    name: 'بازسازی شده است.',
    image: '/static/ads/......png',
    type: 'check',
    values: [],
    created: '2024-01-30T15:50:00Z',
    updated: '2024-04-25T10:15:00Z',
  },
  {
    id: 'e234csdf3wdd',
    name: 'سند',
    type: 'check',
    values: [],
    created: '2024-01-30T15:50:00Z',
    updated: '2024-04-25T10:15:00Z',
  },

  // type selective (medium dates)
  {
    id: 'a51c28f7',
    name: 'تعداد اتاق',
    type: 'choice',
    image: '/static/ads/......png',
    values: [
      { id: 'c73fa8b4', name: 'بدون اتاق' },
      { id: 'e15bd9a6', name: '1' },
      { id: 'f84cd72e', name: '2' },
      { id: 'a29de8f4', name: '3' },
      { id: 'd93fa5b8', name: '4' },
      { id: 'b64ef27c', name: '5' },
      { id: 'f72ce81a', name: '7 اتاق یا بیشتر' },
    ],
    created: '2023-09-25T14:30:00Z',
    updated: '2023-12-20T09:45:00Z',
  },
  {
    id: 'e91ab5c7',
    name: 'تعداد کل طبقات ساختمان',
    type: 'choice',
    values: [
      { id: 'c27bd94e', name: '1' },
      { id: 'f83ad72b', name: '2' },
      { id: 'b51cd83f', name: '3' },
      { id: 'e76fa91c', name: '4' },
      { id: 'a54bd32f', name: '7 طبقه یا بیشتر' },
    ],
    created: '2023-09-20T13:30:00Z',
    updated: '2023-12-15T10:45:00Z',
  },
  {
    id: 'd38fa91b',
    name: 'طبقه',
    type: 'choice',
    values: [
      { id: 'f12ce98d', name: 'همکف' },
      { id: 'c89ab73f', name: '1' },
      { id: 'a34df82b', name: '2' },
      { id: 'b71ce64d', name: '3' },
      { id: 'e95ad83c', name: '20 طبقه یا بیشتر' },
    ],
    created: '2023-09-15T11:30:00Z',
    updated: '2023-12-10T08:45:00Z',
  },
  {
    id: 'd3Dss86y71b',
    name: 'نیم طبقه',
    type: 'choice',
    values: [
      { id: 'c89ab73f', name: '1' },
      { id: 'a34df82b', name: '2' },
      { id: 'b71ce64d', name: '3' },
    ],
    created: '2023-09-10T10:30:00Z',
    updated: '2023-12-05T15:45:00Z',
  },
  {
    id: 'd38fa92p',
    name: 'تعداد واحد در طبقه',
    type: 'choice',
    values: [
      { id: 'f12ce98d', name: 'همکف' },
      { id: 'c89ab73f', name: '1' },
      { id: 'a34df82b', name: '2' },
      { id: 'b71ce64d', name: '3' },
      { id: 'b71ce64d', name: '4' },
      { id: 'b71ce64d', name: '5' },
      { id: 'b71ce64d', name: '6' },
      { id: 'e95ad83c', name: '20 واحد یا بیشتر' },
    ],
    created: '2023-09-05T09:30:00Z',
    updated: '2023-11-30T14:45:00Z',
  },
  {
    id: 'b41fc83a',
    name: 'جهت ساختمان',
    type: 'choice',
    values: [
      { id: 'c57de92a', name: 'شمالی' },
      { id: 'e34bf71d', name: 'جنوبی' },
      { id: 'f69ad83c', name: 'شرقی' },
      { id: 'a23fe61b', name: 'غربی' },
    ],
    created: '2023-08-25T08:30:00Z',
    updated: '2023-11-25T13:45:00Z',
  },
  {
    id: 'f89cd72e',
    name: 'نمای ساختمان',
    type: 'choice',
    values: [
      { id: 'b52ad74f', name: 'سنگ' },
      { id: 'c61fb83d', name: 'کامپوزیت' },
      { id: 'e78cd91b', name: 'آجر' },
    ],
    created: '2023-08-20T07:30:00Z',
    updated: '2023-11-20T12:45:00Z',
  },
  {
    id: 'b41ddsfs8ue8243wd333',
    name: 'وضعیت بر ملک',
    type: 'choice',
    values: [
      { id: 'c73fasdds8b4', name: 'دو نبش' },
      { id: 'e15dsfre33339a6', name: 'سه نبش' },
      { id: 'csdcdssc3', name: 'دو کله' },
      { id: 'a29sdde333de8f4', name: 'تک بر' },
    ],
    created: '2023-08-15T06:30:00Z',
    updated: '2023-11-15T11:45:00Z',
  },

  // type radio (older dates)
  {
    id: 'f73bd91c',
    name: 'آسانسور',
    image: '/static/ads/......png',
    type: 'bool',
    values: [],
    created: '2023-03-25T08:45:00Z',
    updated: '2023-06-20T13:15:00Z',
  },
  {
    id: 'b68ad74e',
    name: 'پارکینگ',
    type: 'bool',
    values: [],
    created: '2023-03-20T07:45:00Z',
    updated: '2023-06-15T12:15:00Z',
  },
  {
    id: 'c97fe82b',
    name: 'انباری',
    type: 'bool',
    values: [],
    created: '2023-03-15T06:45:00Z',
    updated: '2023-06-10T11:15:00Z',
  },
  {
    id: 'e12ad83c',
    name: 'بالکن',
    type: 'bool',
    values: [],
    created: '2023-03-10T05:45:00Z',
    updated: '2023-06-05T10:15:00Z',
  },
  {
    id: 'f84ab71d',
    name: 'سیستم خنک کننده',
    type: 'bool',
    values: [],
    created: '2023-03-05T04:45:00Z',
    updated: '2023-05-30T09:15:00Z',
  },
  {
    id: 'a36cd92e',
    name: 'سیستم گرم کننده',
    type: 'bool',
    values: [],
    created: '2023-02-28T03:45:00Z',
    updated: '2023-05-25T08:15:00Z',
  },
  {
    id: 'c85fe91b',
    name: 'آبگرمکن',
    type: 'bool',
    values: [],
    created: '2023-02-25T02:45:00Z',
    updated: '2023-05-20T07:15:00Z',
  },
  {
    id: 'd93ab82c',
    name: 'سرویس بهداشتی (فرنگی)',
    type: 'bool',
    values: [],
    created: '2023-02-20T01:45:00Z',
    updated: '2023-05-15T06:15:00Z',
  },
  {
    id: 'e45cd73f',
    name: 'کابینت (MDF)',
    type: 'bool',
    values: [],
    created: '2023-02-15T00:45:00Z',
    updated: '2023-05-10T05:15:00Z',
  },
  {
    id: 'f91ab64e',
    name: 'روف گاردن (باغچه پشت بام)',
    type: 'bool',
    values: [],
    created: '2023-02-10T23:45:00Z',
    updated: '2023-05-05T04:15:00Z',
  },
  {
    id: 'a53fe92b',
    name: 'استخر',
    type: 'bool',
    values: [],
    created: '2023-02-05T22:45:00Z',
    updated: '2023-04-30T03:15:00Z',
  },
  {
    id: 'b81ad74c',
    name: 'وان و جکوزی (حمام)',
    type: 'bool',
    values: [],
    created: '2023-02-01T21:45:00Z',
    updated: '2023-04-25T02:15:00Z',
  },
  {
    id: 'b41ad7r9',
    name: 'سونا',
    type: 'bool',
    values: [],
    created: '2023-01-25T20:45:00Z',
    updated: '2023-04-20T01:15:00Z',
  },
  {
    id: 'b41ad0a3',
    name: 'لاندری (اتاق لباسشویی)',
    type: 'bool',
    values: [],
    created: '2023-01-20T19:45:00Z',
    updated: '2023-04-15T00:15:00Z',
  },
  {
    id: 'b4134ffe4333',
    name: 'مستر (حمام والدین)',
    type: 'bool',
    values: [],
    created: '2023-01-15T18:45:00Z',
    updated: '2023-04-10T23:15:00Z',
  },
  {
    id: 'b41dewew9824333',
    name: 'کلوزت (اتاق لباس)',
    type: 'bool',
    values: [],
    created: '2023-01-10T17:45:00Z',
    updated: '2023-04-05T22:15:00Z',
  },
  {
    id: 'b41ddsfs8ue824333',
    name: 'بافت فرسوده',
    type: 'bool',
    values: [],
    created: '2023-01-05T16:45:00Z',
    updated: '2023-04-01T21:15:00Z',
  },
]

const featureCategories = [
  { featureId: 'f87ac4d1', categoryId: '1' },
  { featureId: 'b92df63e', categoryId: '1' },
  { featureId: 'a51c28f7', categoryId: '1' },
  { featureId: 'd38fa92p', categoryId: '1' },
  { featureId: 'e91ab5c7', categoryId: '1' },
  { featureId: 'd38fa91b', categoryId: '1' },
  { featureId: 'f89cd72e', categoryId: '1' },
  { featureId: 'f73bd91c', categoryId: '1' },
  { featureId: 'b68ad74e', categoryId: '1' },
  { featureId: 'c97fe82b', categoryId: '1' },
  { featureId: 'e12ad83c', categoryId: '1' },
  { featureId: 'f84ab71d', categoryId: '1' },
  { featureId: 'a36cd92e', categoryId: '1' },
  { featureId: 'c85fe91b', categoryId: '1' },
  { featureId: 'd93ab82c', categoryId: '1' },
  { featureId: '2d3acsdf333d1', categoryId: '1' },
  { featureId: 'b4134ffe4333', categoryId: '1' },
  { featureId: 'b41dewew9824333', categoryId: '1' },
  { featureId: 'b41ad0a3', categoryId: '1' },
  { featureId: 'f91ab64e', categoryId: '1' },
  { featureId: 'a53fe92b', categoryId: '1' },
  { featureId: 'b81ad74c', categoryId: '1' },
  { featureId: 'b41ad7r9', categoryId: '1' },
  { featureId: 'f87ac4d1', categoryId: '1-2' },
  { featureId: 'b92df63e', categoryId: '1-2' },
  { featureId: 'a51c28f7', categoryId: '1-2' },
  { featureId: 'b41fc83a', categoryId: '1-2' },
  { featureId: 'f89cd72e', categoryId: '1-2' },
  { featureId: 'b68ad74e', categoryId: '1-2' },
  { featureId: 'c97fe82b', categoryId: '1-2' },
  { featureId: 'e12ad83c', categoryId: '1-2' },
  { featureId: 'f84ab71d', categoryId: '1-2' },
  { featureId: 'a36cd92e', categoryId: '1-2' },
  { featureId: 'c85fe91b', categoryId: '1-2' },
  { featureId: 'd93ab82c', categoryId: '1-2' },
  { featureId: 'b4134ffe4333', categoryId: '1-2' },
  { featureId: 'b41dewew9824333', categoryId: '1-2' },
  { featureId: 'b41ad0a3', categoryId: '1-2' },
  { featureId: 'f91ab64e', categoryId: '1-2' },
  { featureId: 'a53fe92b', categoryId: '1-2' },
  { featureId: 'b81ad74c', categoryId: '1-2' },
  { featureId: 'b41ad7r9', categoryId: '1-2' },
  { featureId: 'b41ddsfssafsdse824333', categoryId: '5' },
  { featureId: 'b41ddsfs8ue8243wd333', categoryId: '5' },
  { featureId: 'b41ddsFer422224333', categoryId: '5' },
  { featureId: 'f87safe3d1', categoryId: '5' },
  { featureId: 'b41ddsfs8ue824333', categoryId: '5' },
  { featureId: 'f87ac4d1', categoryId: '2-3' },
  { featureId: 'b41ddsfs8ue8243wd333', categoryId: '2-3' },
  { featureId: 'b41ddsFer422224333', categoryId: '2-3' },
  { featureId: 'f87safe3d1', categoryId: '2-3' },
  { featureId: 'b41ddsfs8ue824333', categoryId: '2-3' },
  { featureId: 'f87ac4d1', categoryId: '2-2' },
  { featureId: 'b92df63e', categoryId: '2-2' },
  { featureId: 'a51c28f7', categoryId: '2-2' },
  { featureId: 'b41fc83a', categoryId: '2-2' },
  { featureId: 'c97fe82b', categoryId: '2-2' },
  { featureId: 'e12ad83c', categoryId: '2-2' },
  { featureId: 'f84ab71d', categoryId: '2-2' },
  { featureId: 'a36cd92e', categoryId: '2-2' },
  { featureId: 'c85fe91b', categoryId: '2-2' },
  { featureId: 'd93ab82c', categoryId: '2-2' },
  { featureId: 'b4134ffe4333', categoryId: '2-2' },
  { featureId: 'b41dewew9824333', categoryId: '2-2' },
  { featureId: 'b41ad0a3', categoryId: '2-2' },
  { featureId: 'f91ab64e', categoryId: '2-2' },
  { featureId: 'a53fe92b', categoryId: '2-2' },
  { featureId: 'b81ad74c', categoryId: '2-2' },
  { featureId: 'b41ad7r9', categoryId: '2-2' },
  { featureId: 'f87ac4d1', categoryId: '3' },
  { featureId: 'b92df63e', categoryId: '3' },
  { featureId: 'a51c28f7', categoryId: '3' },
  { featureId: 'd38fa92p', categoryId: '3' },
  { featureId: 'e91ab5c7', categoryId: '3' },
  { featureId: 'd38fa91b', categoryId: '3' },
  { featureId: 'f73bd91c', categoryId: '3' },
  { featureId: 'b68ad74e', categoryId: '3' },
  { featureId: 'c97fe82b', categoryId: '3' },
  { featureId: 'f84ab71d', categoryId: '3' },
  { featureId: 'a36cd92e', categoryId: '3' },
  { featureId: 'c85fe91b', categoryId: '3' },
  { featureId: 'e234csdf3wdd', categoryId: '3' },
  { featureId: 'f87ac4d1', categoryId: '4' },
  { featureId: 'b92df63e', categoryId: '4' },
  { featureId: 'a51c28f7', categoryId: '4' },
  { featureId: 'd38fa92p', categoryId: '4' },
  { featureId: 'e91ab5c7', categoryId: '4' },
  { featureId: 'd38fa91b', categoryId: '4' },
  { featureId: 'f73bd91c', categoryId: '4' },
  { featureId: 'b68ad74e', categoryId: '4' },
  { featureId: 'c97fe82b', categoryId: '4' },
  { featureId: 'f84ab71d', categoryId: '4' },
  { featureId: 'a36cd92e', categoryId: '4' },
  { featureId: 'c85fe91b', categoryId: '4' },
  { featureId: 'f87ac4d1', categoryId: '3-3' },
  { featureId: 'b92df63e', categoryId: '3-3' },
  { featureId: 'a51c28f7', categoryId: '3-3' },

  { featureId: 'f87ac4d1', categoryId: '4-3' },
  { featureId: 'b92df63e', categoryId: '4-3' },
  { featureId: 'a51c28f7', categoryId: '4-3' },

  { featureId: 'f87ac4d1', categoryId: '3-2' },
  { featureId: 'b92df63e', categoryId: '3-2' },
  { featureId: 'a51c28f7', categoryId: '3-2' },
  { featureId: 'd3Dss86y71b', categoryId: '3-2' },
  { featureId: 'f87ac4dDsfsd1', categoryId: '3-2' },
  { featureId: 'd38fa91b', categoryId: '3-2' },
  { featureId: 'f73bd91c', categoryId: '3-2' },
  { featureId: 'b68ad74e', categoryId: '3-2' },
  { featureId: 'c97fe82b', categoryId: '3-2' },
  { featureId: 'f84ab71d', categoryId: '3-2' },
  { featureId: 'a36cd92e', categoryId: '3-2' },
  { featureId: 'c85fe91b', categoryId: '3-2' },

  { featureId: 'f87ac4d1', categoryId: '4-2' },
  { featureId: 'b92df63e', categoryId: '4-2' },
  { featureId: 'a51c28f7', categoryId: '4-2' },
  { featureId: 'd3Dss86y71b', categoryId: '4-2' },
  { featureId: 'f87ac4dDsfsd1', categoryId: '4-2' },
  { featureId: 'd38fa91b', categoryId: '4-2' },
  { featureId: 'f73bd91c', categoryId: '4-2' },
  { featureId: 'b68ad74e', categoryId: '4-2' },
  { featureId: 'c97fe82b', categoryId: '4-2' },
  { featureId: 'f84ab71d', categoryId: '4-2' },
  { featureId: 'a36cd92e', categoryId: '4-2' },
  { featureId: 'c85fe91b', categoryId: '4-2' },

  { featureId: 'f87ac4d1', categoryId: '6' },
  { featureId: 'a51c28f7', categoryId: '6' },

  { featureId: 'f87ac4d1', categoryId: '5-1-1' },
]

const requestCategoryFeatures = [
  { featureId: 'f87ac4d1', categoryId: '1-1' },
  { featureId: 'b92df63e', categoryId: '1-1' },
  { featureId: 'a51c28f7', categoryId: '1-1' },
  { featureId: 'd38fa92p', categoryId: '1-1' },
  { featureId: 'f73bd91c', categoryId: '1-1' },
  { featureId: 'b68ad74e', categoryId: '1-1' },
  { featureId: 'e12ad83c', categoryId: '1-1' },
  { featureId: 'f84ab71d', categoryId: '1-1' },
  { featureId: 'a36cd92e', categoryId: '1-1' },
  { featureId: 'c85fe91b', categoryId: '1-1' },
  { featureId: 'd93ab82c', categoryId: '1-1' },
  { featureId: 'b4134ffe4333', categoryId: '1-1' },
  { featureId: 'b41dewew9824333', categoryId: '1-1' },
  { featureId: 'b41ad0a3', categoryId: '1-1' },
  { featureId: 'f91ab64e', categoryId: '1-1' },
  { featureId: 'a53fe92b', categoryId: '1-1' },
  { featureId: 'b81ad74c', categoryId: '1-1' },
  { featureId: 'b41ad7r9', categoryId: '1-1' },
  { featureId: '2d3acsdf333d1', categoryId: '1-1' },
  { featureId: 'b41fc83a', categoryId: '1-1' },
  { featureId: 'f89cd72e', categoryId: '1-1' },

  { featureId: 'f87ac4d1', categoryId: '2-1' },
  { featureId: 'b92df63e', categoryId: '2-1' },
  { featureId: 'a51c28f7', categoryId: '2-1' },
  { featureId: 'd38fa92p', categoryId: '2-1' },
  { featureId: 'f73bd91c', categoryId: '2-1' },
  { featureId: 'b68ad74e', categoryId: '2-1' },
  { featureId: 'e12ad83c', categoryId: '2-1' },
  { featureId: 'f84ab71d', categoryId: '2-1' },
  { featureId: 'a36cd92e', categoryId: '2-1' },
  { featureId: 'c85fe91b', categoryId: '2-1' },
  { featureId: 'd93ab82c', categoryId: '2-1' },
  { featureId: 'b4134ffe4333', categoryId: '2-1' },
  { featureId: 'b41dewew9824333', categoryId: '2-1' },
  { featureId: 'b41ad0a3', categoryId: '2-1' },
  { featureId: 'f91ab64e', categoryId: '2-1' },
  { featureId: 'a53fe92b', categoryId: '2-1' },
  { featureId: 'b81ad74c', categoryId: '2-1' },
  { featureId: 'b41ad7r9', categoryId: '2-1' },
  { featureId: '2d3acsdf333d1', categoryId: '2-1' },
  { featureId: 'b41fc83a', categoryId: '2-1' },
  { featureId: 'f89cd72e', categoryId: '2-1' },

  { featureId: 'f87ac4d1', categoryId: '2-3' },
  { featureId: 'b41ddsfs8ue8243wd333', categoryId: '2-3' },
  { featureId: 'b41ddsFer422224333', categoryId: '2-3' },
  { featureId: 'f87safe3d1', categoryId: '2-3' },
  { featureId: 'b41ddsfs8ue824333', categoryId: '2-3' },

  { featureId: 'b41ddsfssafsdse824333', categoryId: '5' },
  { featureId: 'b41ddsfs8ue8243wd333', categoryId: '5' },
  { featureId: 'f87safe3d1', categoryId: '5' },
  { featureId: 'b41ddsfs8ue824333', categoryId: '5' },

  { featureId: 'f87ac4d1', categoryId: '4' },
  { featureId: 'b92df63e', categoryId: '4' },
  { featureId: 'e234csdf3wdd', categoryId: '4' },
  { featureId: 'a51c28f7', categoryId: '4' },

  { featureId: 'f87ac4d1', categoryId: '3' },
  { featureId: 'b92df63e', categoryId: '3' },
  { featureId: 'e234csdf3wdd', categoryId: '3' },
  { featureId: 'a51c28f7', categoryId: '3' },
]

const manualData = [
  { propertyId: 'prop-1051', viewedDate: '2025-01-20T10:00:00.000Z' },
  { propertyId: 'prop-1052', viewedDate: '2025-01-20T11:30:00.000Z' },
  { propertyId: 'prop-1053', viewedDate: '2025-01-20T13:00:00.000Z' },
  { propertyId: 'prop-1054', viewedDate: '2025-01-20T14:30:00.000Z' },
  { propertyId: 'prop-1055', viewedDate: '2025-01-20T16:00:00.000Z' },
  { propertyId: 'prop-1056', viewedDate: '2025-01-20T17:30:00.000Z' },
  { propertyId: 'prop-1057', viewedDate: '2025-01-20T19:00:00.000Z' },
  { propertyId: 'prop-1058', viewedDate: '2025-01-20T20:30:00.000Z' },
  { propertyId: 'prop-1059', viewedDate: '2025-01-20T22:00:00.000Z' },
  { propertyId: 'prop-1060', viewedDate: '2025-01-20T23:30:00.000Z' },
  { propertyId: 'prop-1061', viewedDate: '2025-01-21T01:00:00.000Z' },
  { propertyId: 'prop-1062', viewedDate: '2025-01-21T02:30:00.000Z' },
  { propertyId: 'prop-1063', viewedDate: '2025-01-21T04:00:00.000Z' },
  { propertyId: 'prop-1064', viewedDate: '2025-01-21T05:30:00.000Z' },
  { propertyId: 'prop-1065', viewedDate: '2025-01-21T07:00:00.000Z' },
  { propertyId: 'prop-1066', viewedDate: '2025-01-21T08:30:00.000Z' },
  { propertyId: 'prop-1067', viewedDate: '2025-01-21T10:00:00.000Z' },
  { propertyId: 'prop-1068', viewedDate: '2025-01-21T11:30:00.000Z' },
  { propertyId: 'prop-1069', viewedDate: '2025-01-21T13:00:00.000Z' },
  { propertyId: 'prop-1070', viewedDate: '2025-01-21T14:30:00.000Z' },
  { propertyId: 'prop-1071', viewedDate: '2025-01-21T16:00:00.000Z' },
  { propertyId: 'prop-1072', viewedDate: '2025-01-21T17:30:00.000Z' },
  { propertyId: 'prop-1073', viewedDate: '2025-01-21T19:00:00.000Z' },
  { propertyId: 'prop-1074', viewedDate: '2025-01-21T20:30:00.000Z' },
  { propertyId: 'prop-1075', viewedDate: '2025-01-21T22:00:00.000Z' },
  { propertyId: 'prop-1076', viewedDate: '2025-01-21T23:30:00.000Z' },
  { propertyId: 'prop-1077', viewedDate: '2025-01-22T01:00:00.000Z' },
  { propertyId: 'prop-1078', viewedDate: '2025-01-22T02:30:00.000Z' },
  { propertyId: 'prop-1079', viewedDate: '2025-01-22T04:00:00.000Z' },
  { propertyId: 'prop-1080', viewedDate: '2025-01-22T05:30:00.000Z' },
  { propertyId: 'prop-1081', viewedDate: '2025-01-22T07:00:00.000Z' },
  { propertyId: 'prop-1082', viewedDate: '2025-01-22T08:30:00.000Z' },
  { propertyId: 'prop-1083', viewedDate: '2025-01-22T10:00:00.000Z' },
  { propertyId: 'prop-1084', viewedDate: '2025-01-22T11:30:00.000Z' },
  { propertyId: 'prop-1085', viewedDate: '2025-01-22T13:00:00.000Z' },
  { propertyId: 'prop-1086', viewedDate: '2025-01-22T14:30:00.000Z' },
  { propertyId: 'prop-1087', viewedDate: '2025-01-22T16:00:00.000Z' },
  { propertyId: 'prop-1088', viewedDate: '2025-01-22T17:30:00.000Z' },
  { propertyId: 'prop-1089', viewedDate: '2025-01-22T19:00:00.000Z' },
  { propertyId: 'prop-1090', viewedDate: '2025-01-22T20:30:00.000Z' },
  { propertyId: 'prop-1091', viewedDate: '2025-01-22T22:00:00.000Z' },
  { propertyId: 'prop-1092', viewedDate: '2025-01-22T23:30:00.000Z' },
  { propertyId: 'prop-1093', viewedDate: '2025-01-23T01:00:00.000Z' },
  { propertyId: 'prop-1094', viewedDate: '2025-01-23T02:30:00.000Z' },
  { propertyId: 'prop-1095', viewedDate: '2025-01-23T04:00:00.000Z' },
  { propertyId: 'prop-1096', viewedDate: '2025-01-23T05:30:00.000Z' },
  { propertyId: 'prop-1097', viewedDate: '2025-01-23T07:00:00.000Z' },
  { propertyId: 'prop-1098', viewedDate: '2025-01-23T08:30:00.000Z' },
  { propertyId: 'prop-1099', viewedDate: '2025-01-23T10:00:00.000Z' },
  { propertyId: 'prop-1100', viewedDate: '2025-01-23T11:30:00.000Z' },
  { propertyId: 'prop-1050', viewedDate: '2025-01-13T14:24:00.000Z' },
  { propertyId: 'prop-1049', viewedDate: '2025-01-12T21:50:24.000Z' },
  { propertyId: 'prop-1048', viewedDate: '2025-01-11T05:16:48.000Z' },
  { propertyId: 'prop-1047', viewedDate: '2025-01-10T12:43:12.000Z' },
  { propertyId: 'prop-1046', viewedDate: '2025-01-09T20:09:36.000Z' },
  { propertyId: 'prop-1045', viewedDate: '2025-01-08T10:30:00.000Z' },
  { propertyId: 'prop-1044', viewedDate: '2025-01-07T08:15:12.000Z' },
  { propertyId: 'prop-1043', viewedDate: '2025-01-06T16:45:32.000Z' },
  { propertyId: 'prop-1042', viewedDate: '2025-01-05T14:22:11.000Z' },
  { propertyId: 'prop-1041', viewedDate: '2025-01-04T09:33:44.000Z' },
  { propertyId: 'prop-1040', viewedDate: '2025-01-03T07:12:55.000Z' },
  { propertyId: 'prop-1039', viewedDate: '2025-01-02T18:19:27.000Z' },
  { propertyId: 'prop-1038', viewedDate: '2025-01-01T12:05:39.000Z' },
  { propertyId: 'prop-1037', viewedDate: '2024-12-31T10:45:01.000Z' },
  { propertyId: 'prop-1036', viewedDate: '2024-12-30T08:30:15.000Z' },
  { propertyId: 'prop-1035', viewedDate: '2024-12-29T16:20:45.000Z' },
  { propertyId: 'prop-1034', viewedDate: '2024-12-28T14:15:30.000Z' },
  { propertyId: 'prop-1033', viewedDate: '2024-12-27T11:10:25.000Z' },
  { propertyId: 'prop-1032', viewedDate: '2024-12-26T09:05:20.000Z' },
  { propertyId: 'prop-1031', viewedDate: '2024-12-25T07:00:10.000Z' },
  { propertyId: 'prop-1030', viewedDate: '2024-12-24T05:55:05.000Z' },
  { propertyId: 'prop-1029', viewedDate: '2024-12-23T04:50:00.000Z' },
  { propertyId: 'prop-1028', viewedDate: '2024-12-22T03:45:55.000Z' },
  { propertyId: 'prop-1027', viewedDate: '2024-12-21T02:40:50.000Z' },
  { propertyId: 'prop-1026', viewedDate: '2024-12-20T01:35:45.000Z' },
  { propertyId: 'prop-1025', viewedDate: '2024-12-19T00:30:40.000Z' },
  { propertyId: 'prop-1024', viewedDate: '2024-12-18T23:25:35.000Z' },
  { propertyId: 'prop-1023', viewedDate: '2024-12-17T22:20:30.000Z' },
  { propertyId: 'prop-1022', viewedDate: '2024-12-16T21:15:25.000Z' },
  { propertyId: 'prop-1021', viewedDate: '2024-12-16T20:10:20.000Z' },
  { propertyId: 'prop-1020', viewedDate: '2024-12-16T19:05:15.000Z' },
  { propertyId: 'prop-1019', viewedDate: '2024-12-16T18:00:10.000Z' },
  { propertyId: 'prop-1018', viewedDate: '2024-12-16T16:55:05.000Z' },
  { propertyId: 'prop-1017', viewedDate: '2024-12-16T15:50:00.000Z' },
  { propertyId: 'prop-1016', viewedDate: '2024-12-16T14:45:55.000Z' },
  { propertyId: 'prop-1015', viewedDate: '2024-12-16T13:40:50.000Z' },
  { propertyId: 'prop-1014', viewedDate: '2024-12-16T12:35:45.000Z' },
  { propertyId: 'prop-1013', viewedDate: '2024-12-16T11:30:40.000Z' },
  { propertyId: 'prop-1012', viewedDate: '2024-12-16T10:25:35.000Z' },
  { propertyId: 'prop-1011', viewedDate: '2024-12-16T09:20:30.000Z' },
  { propertyId: 'prop-1010', viewedDate: '2024-12-16T08:15:25.000Z' },
  { propertyId: 'prop-1009', viewedDate: '2024-12-16T07:10:20.000Z' },
  { propertyId: 'prop-1008', viewedDate: '2024-12-16T06:05:15.000Z' },
  { propertyId: 'prop-1007', viewedDate: '2024-12-16T05:00:10.000Z' },
  { propertyId: 'prop-1006', viewedDate: '2024-12-16T03:55:05.000Z' },
  { propertyId: 'prop-1005', viewedDate: '2024-12-16T02:50:00.000Z' },
  { propertyId: 'prop-1004', viewedDate: '2024-12-16T01:45:55.000Z' },
  { propertyId: 'prop-1003', viewedDate: '2024-12-16T00:40:50.000Z' },
  { propertyId: 'prop-1002', viewedDate: '2024-12-16T23:35:45.000Z' },
  { propertyId: 'prop-1001', viewedDate: '2024-12-16T22:30:40.000Z' },
]

const chartActivityData = [
  { propertyId: 'prop-1051', viewedDate: '2025-01-20T10:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1052', viewedDate: '2025-01-20T11:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1053', viewedDate: '2025-01-20T13:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1054', viewedDate: '2025-01-20T14:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1055', viewedDate: '2025-01-20T16:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1056', viewedDate: '2025-01-20T17:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1057', viewedDate: '2025-01-20T19:00:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1058', viewedDate: '2025-01-20T20:30:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1059', viewedDate: '2025-01-20T22:00:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1060', viewedDate: '2025-01-20T23:30:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1061', viewedDate: '2025-01-21T01:00:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1062', viewedDate: '2025-01-21T02:30:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1063', viewedDate: '2025-01-21T04:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1064', viewedDate: '2025-01-21T05:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1065', viewedDate: '2025-01-21T07:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1066', viewedDate: '2025-01-21T08:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1067', viewedDate: '2025-01-21T10:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1068', viewedDate: '2025-01-21T11:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1069', viewedDate: '2025-01-21T13:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1070', viewedDate: '2025-01-21T14:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1071', viewedDate: '2025-01-21T16:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1072', viewedDate: '2025-01-21T17:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1073', viewedDate: '2025-01-21T19:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1074', viewedDate: '2025-01-21T20:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1075', viewedDate: '2025-01-21T22:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1076', viewedDate: '2025-01-21T23:30:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1077', viewedDate: '2025-01-22T01:00:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1078', viewedDate: '2025-01-22T02:30:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1079', viewedDate: '2025-01-22T04:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1080', viewedDate: '2025-01-22T05:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1081', viewedDate: '2025-01-22T07:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1082', viewedDate: '2025-01-22T08:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1083', viewedDate: '2025-01-22T10:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1084', viewedDate: '2025-01-22T11:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1085', viewedDate: '2025-01-22T13:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1086', viewedDate: '2025-01-22T14:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1087', viewedDate: '2025-01-22T16:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1088', viewedDate: '2025-01-22T17:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1089', viewedDate: '2025-01-22T19:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1090', viewedDate: '2025-01-22T20:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1091', viewedDate: '2025-01-22T22:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1092', viewedDate: '2025-01-22T23:30:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1093', viewedDate: '2025-01-23T01:00:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1094', viewedDate: '2025-01-23T02:30:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1095', viewedDate: '2025-01-23T04:00:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1096', viewedDate: '2025-01-23T05:30:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1097', viewedDate: '2025-01-23T07:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1098', viewedDate: '2025-01-23T08:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1099', viewedDate: '2025-01-23T10:00:00.000Z', status: 'successful' },
  { propertyId: 'prop-1100', viewedDate: '2025-01-23T11:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1050', viewedDate: '2025-01-13T14:24:00.000Z', status: 'successful' },
  { propertyId: 'prop-1049', viewedDate: '2025-01-12T21:50:24.000Z', status: 'successful' },
  { propertyId: 'prop-1048', viewedDate: '2025-01-11T05:16:48.000Z', status: 'successful' },
  { propertyId: 'prop-1047', viewedDate: '2025-01-10T12:43:12.000Z', status: 'successful' },
  { propertyId: 'prop-1046', viewedDate: '2025-01-09T20:09:36.000Z', status: 'successful' },
  { propertyId: 'prop-1045', viewedDate: '2025-01-08T10:30:00.000Z', status: 'successful' },
  { propertyId: 'prop-1044', viewedDate: '2025-01-07T08:15:12.000Z', status: 'successful' },
  { propertyId: 'prop-1043', viewedDate: '2025-01-06T16:45:32.000Z', status: 'successful' },
  { propertyId: 'prop-1042', viewedDate: '2025-01-05T14:22:11.000Z', status: 'successful' },
  { propertyId: 'prop-1041', viewedDate: '2025-01-04T09:33:44.000Z', status: 'successful' },
  { propertyId: 'prop-1040', viewedDate: '2025-01-03T07:12:55.000Z', status: 'successful' },
  { propertyId: 'prop-1039', viewedDate: '2025-01-02T18:19:27.000Z', status: 'successful' },
  { propertyId: 'prop-1038', viewedDate: '2025-01-01T12:05:39.000Z', status: 'successful' },
  { propertyId: 'prop-1037', viewedDate: '2024-12-31T10:45:01.000Z', status: 'successful' },
  { propertyId: 'prop-1036', viewedDate: '2024-12-30T08:30:15.000Z', status: 'successful' },
  { propertyId: 'prop-1035', viewedDate: '2024-12-29T16:20:45.000Z', status: 'successful' },
  { propertyId: 'prop-1034', viewedDate: '2024-12-28T14:15:30.000Z', status: 'successful' },
  { propertyId: 'prop-1033', viewedDate: '2024-12-27T11:10:25.000Z', status: 'successful' },
  { propertyId: 'prop-1032', viewedDate: '2024-12-26T09:05:20.000Z', status: 'successful' },
  { propertyId: 'prop-1031', viewedDate: '2024-12-25T07:00:10.000Z', status: 'successful' },
  { propertyId: 'prop-1030', viewedDate: '2024-12-24T05:55:05.000Z', status: 'successful' },
  { propertyId: 'prop-1029', viewedDate: '2024-12-23T04:50:00.000Z', status: 'successful' },
  { propertyId: 'prop-1028', viewedDate: '2024-12-22T03:45:55.000Z', status: 'successful' },
  { propertyId: 'prop-1027', viewedDate: '2024-12-21T02:40:50.000Z', status: 'successful' },
  { propertyId: 'prop-1026', viewedDate: '2024-12-20T01:35:45.000Z', status: 'successful' },
  { propertyId: 'prop-1025', viewedDate: '2024-12-19T00:30:40.000Z', status: 'successful' },
  { propertyId: 'prop-1024', viewedDate: '2024-12-18T23:25:35.000Z', status: 'successful' },
  { propertyId: 'prop-1023', viewedDate: '2024-12-17T22:20:30.000Z', status: 'successful' },
  { propertyId: 'prop-1022', viewedDate: '2024-12-16T21:15:25.000Z', status: 'successful' },
  { propertyId: 'prop-1021', viewedDate: '2024-12-16T20:10:20.000Z', status: 'successful' },
  { propertyId: 'prop-1020', viewedDate: '2024-12-16T19:05:15.000Z', status: 'successful' },
  { propertyId: 'prop-1019', viewedDate: '2024-12-16T18:00:10.000Z', status: 'successful' },
  { propertyId: 'prop-1018', viewedDate: '2024-12-16T16:55:05.000Z', status: 'successful' },
  { propertyId: 'prop-1017', viewedDate: '2024-12-16T15:50:00.000Z', status: 'successful' },
  { propertyId: 'prop-1016', viewedDate: '2024-12-16T14:45:55.000Z', status: 'successful' },
  { propertyId: 'prop-1015', viewedDate: '2024-12-16T13:40:50.000Z', status: 'successful' },
  { propertyId: 'prop-1014', viewedDate: '2024-12-16T12:35:45.000Z', status: 'successful' },
  { propertyId: 'prop-1013', viewedDate: '2024-12-16T11:30:40.000Z', status: 'successful' },
  { propertyId: 'prop-1012', viewedDate: '2024-12-16T10:25:35.000Z', status: 'successful' },
  { propertyId: 'prop-1011', viewedDate: '2024-12-16T09:20:30.000Z', status: 'successful' },
  { propertyId: 'prop-1010', viewedDate: '2024-12-16T08:15:25.000Z', status: 'successful' },
  { propertyId: 'prop-1009', viewedDate: '2024-12-16T07:10:20.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1008', viewedDate: '2024-12-16T06:05:15.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1007', viewedDate: '2024-12-16T05:00:10.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1006', viewedDate: '2024-12-16T03:55:05.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1005', viewedDate: '2024-12-16T02:50:00.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1004', viewedDate: '2024-12-16T01:45:55.000Z', status: 'unsuccessful' },
  { propertyId: 'prop-1003', viewedDate: '2024-12-16T00:40:50.000Z', status: 'successful' },
  { propertyId: 'prop-1002', viewedDate: '2024-12-16T23:35:45.000Z', status: 'successful' },
  { propertyId: 'prop-1001', viewedDate: '2024-12-16T22:30:40.000Z', status: 'successful' },
]

const estates = [
  {
    id: '1',
    name: 'خاوری',
    city: 'تهران',
    location: getRandomLocation(35.75, 51.41, 0.02),
    address: ' ونک-خیابان 33',
    image: '/static/IMG-20240805-WA0098.jpg',
    housing: housing,
    userInfo: {
      fullName: 'محمد باقری',
      fatherName: 'جلیل باقری',
      notionalCode: '3497971073',
      businessLicense: 321456789,
      tradeLicense: 987654321,
      phoneNumber: '09123456789',
      businessLicenseImage: '/static/business-license.jpg',
      nationalCardBackImage: '/static/national-card-back.jpg',
      nationalCardFrontImage: '/static/national-card-front.jpg',
      birthCertificateImage: '/static/birth-certificate.jpg',
    },
    accountManage: [
      {
        id: '1',
        type: 'withdrawal',
        price: 900000,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'deposit',
        price: 1150000,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    ],
    marketerUser: [
      {
        id: '1',
        fullName: 'حسن باقرزاده',
        fatherName: 'علی',
        birthDate: '1380/03/1',
        notionalCode: '0482223344',
        idCode: '0482223344',
        gender: 'مرد',
        maritalStatus: 'مجرد',
        bankAccountNumber: '5864524485632214',
        marketerCode: '85221445',
        shabaNumber: 'IR4006800000000009515',
        city: 'دماوند',

        phoneNumber: '09125009830',
        email: 'hassanbagheri@hotmail.com',
        address: 'دماوند-خیابان اندیشه کوچه 12 واحد 4',
        activityChart: chartActivityData,
      },
    ],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
]

// Admin registration mock handlers
export const adminHandlers = [
  rest.post('/api/admin/register', (req, res, ctx) => {
    const { 
      role_type, 
      full_name, 
      phone_number, 
      email, 
      province, 
      city, 
      security_number, 
      profile_image,
      birth_date,
      gender,
      bank_card_number,
      iban,
      marital_status,
      address,
      national_id_image
    } = req.body as { 
      role_type: string, 
      full_name: string, 
      phone_number: string, 
      email: string, 
      province: string | { name: string }, 
      city: string | { name: string }, 
      security_number: string, 
      profile_image: string,
      birth_date: string,
      gender: string | { name: string },
      bank_card_number: string,
      iban: string,
      marital_status: string | { name: string },
      address: string,
      national_id_image: string
    }; // eslint-disable-line
    
    // Store the request in sessionStorage instead of localStorage to avoid persisting data across sessions
    // This helps ensure mock data doesn't interfere with the real system
    try {
      const requests = JSON.parse(sessionStorage.getItem('adminRequests') || '[]');
      const newRequest = {
        id: Date.now(),
        full_name,
        phone_number,
        email,
        province: typeof province === 'object' ? province.name : province || '',
        city: typeof city === 'object' ? city.name : city || '',
        role_type,
        security_number,
        status: 'pending', // 'pending', 'approved', 'rejected'
        created_at: new Date().toISOString(),
        profile_image: profile_image || null,
        birth_date: birth_date || '',
        gender: typeof gender === 'object' ? gender.name : gender || '',
        bank_card_number: bank_card_number || '',
        iban: iban || '',
        marital_status: typeof marital_status === 'object' ? marital_status.name : marital_status || '',
        address: address || '',
        national_id_image: national_id_image || null
      };
      
      requests.push(newRequest);
      sessionStorage.setItem('adminRequests', JSON.stringify(requests));
      
      // Return a successful response
      return res(
        ctx.status(201),
        ctx.json({
          success: true,
          message: 'درخواست شما با موفقیت ثبت شد.',
          data: newRequest
        })
      );
    } catch (error) {
      console.error('Error storing admin request:', error);
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: 'خطا در ثبت درخواست'
        })
      );
    }
  }),

  rest.get('/api/admin/requests', (req, res, ctx) => {
    try {
      const requests = JSON.parse(sessionStorage.getItem('adminRequests') || '[]');
      
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: requests
        })
      );
    } catch (error) {
      console.error('Error retrieving admin requests:', error);
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: 'خطا در دریافت درخواست‌ها'
        })
      );
    }
  }),

  rest.put('/api/admin/request/:id', (req, res, ctx) => {
    const { id } = req.params;
    const { status } = req.body as { status: string }; // eslint-disable-line
    
    try {
      const requests = JSON.parse(sessionStorage.getItem('adminRequests') || '[]');
      const updatedRequests = requests.map(request => 
        request.id === Number(id) ? { ...request, status } : request
      );
      
      sessionStorage.setItem('adminRequests', JSON.stringify(updatedRequests));
      
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: status === 'approved' ? 'درخواست با موفقیت تایید شد.' : 'درخواست رد شد.'
        })
      );
    } catch (error) {
      console.error('Error updating admin request:', error);
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: 'خطا در بروزرسانی درخواست'
        })
      );
    }
  })
];

export const handlers = [
  rest.post('/api/auth/send-code', async (req, res, ctx) => {
    const { phoneNumber } = await req.json<{ phoneNumber: string }>()

    if (!/^09[0-9]{9}$/.test(phoneNumber)) {
      return res(ctx.status(400), ctx.json({ message: 'شماره موبایل نامعتبر است' }))
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
    verificationCodes.set(phoneNumber, randomCode)
    return res(ctx.status(200), ctx.json({ message: 'کد تایید ارسال شد', code: randomCode }))
  }),

  // rest.post('/api/auth/verify-code', async (req, res, ctx) => {
  //   const { code, phoneNumber, role } = await req.json<{ code: string; phoneNumber: string; role: UserRoleType }>()

  //   const storedCode = verificationCodes.get(phoneNumber)

  //   if (!storedCode) {
  //     return res(ctx.status(401), ctx.json({ message: 'کد تایید منقضی شده است' }))
  //   }

  //   if (code !== storedCode) {
  //     return res(ctx.status(401), ctx.json({ message: 'کد تایید نادرست می‌باشد!', phoneNumber }))
  //   }
  //   const user: User = {
  //     id: generateUUID(), // تابعی برای تولید UUID
  //     phone_number: phoneNumber,
  //     role: role,
  //     userType: 'user',
  //     first_name: '',
  //     last_name: '',
  //     father_name: '',
  //     security_number: '',
  //     province: '',
  //     city: '',
  //     address: '',
  //     zip_code: '',
  //     subscription: undefined, // کاربر جدید هنوز اشتراک ندارد
  //   }

  //   users.set(phoneNumber, user)
  //   try {
  //     localStorage.setItem('user', JSON.stringify(user))
  //   } catch (error) {
  //     console.error('خطا در ذخیره اطلاعات کاربر در localStorage:', error)
  //     return res(ctx.status(500), ctx.json({ message: 'خطا در ذخیره اطلاعات کاربر' }))
  //   }
  //   verificationCodes.clear()

  //   return res(ctx.status(200), ctx.json({ message: 'ورود موفقیت‌آمیز بود', phoneNumber, role, user }))
  // }),

  // Handler for purchasing subscription
  rest.post('/api/subscription/purchase', async (req, res, ctx) => {
    const { phoneNumber, planType, planName } = await req.json<{
      phoneNumber: string
      planType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
      planName: string
    }>()

    // جستجوی کاربر از localStorage
    let user
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        user = JSON.parse(storedUser)
        // چک کردن تطابق شماره تلفن
        if (user.phoneNumber !== phoneNumber) {
          return res(ctx.status(404), ctx.json({ message: 'کاربر یافت نشد' }))
        }
      } else {
        return res(ctx.status(404), ctx.json({ message: 'کاربر یافت نشد' }))
      }
    } catch (error) {
      console.error('خطا در خواندن اطلاعات از localStorage:', error)
      return res(ctx.status(500), ctx.json({ message: 'خطا در دریافت اطلاعات کاربر' }))
    }

    // پیدا کردن پلن مورد نظر از آرایه
    const plan = subscriptionPlans.find((plan) => plan.duration === planType && plan.title === planName)

    if (!plan) {
      return res(ctx.status(404), ctx.json({ message: 'پلن مورد نظر یافت نشد' }))
    }

    const now = new Date()
    let endDate = new Date()

    switch (planType) {
      case 'MONTHLY':
        endDate.setMonth(now.getMonth() + 1)
        break
      case 'QUARTERLY':
        endDate.setMonth(now.getMonth() + 3)
        break
      case 'YEARLY':
        endDate.setFullYear(now.getFullYear() + 1)
        break
    }

    const updatedUser: User = {
      ...user,
      role: 'subscriber',
      subscription: {
        type: planType,
        remainingViews: plan.viewLimit,
        totalViews: plan.viewLimit,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        status: 'ACTIVE',
        viewedProperties: [],
      },
    }

    // ذخیره‌سازی اطلاعات به‌روزرسانی‌شده در localStorage
    try {
      localStorage.setItem('user', JSON.stringify(updatedUser))
      // به‌روزرسانی map users نیز در صورت نیاز
      users.set(phoneNumber, updatedUser)
    } catch (error) {
      console.error('خطا در ذخیره اطلاعات در localStorage:', error)
      return res(ctx.status(500), ctx.json({ message: 'خطا در ذخیره اطلاعات' }))
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'فروش اشتراک شما با موفقیت انجام شد.',
        data: updatedUser,
      })
    )
  }),

  rest.get('/api/properties/viewed-properties', async (req, res, ctx) => {
    const phoneNumber = req.url.searchParams.get('phoneNumber')

    if (!phoneNumber) {
      return res(ctx.status(400), ctx.json({ success: false, message: 'شماره تلفن الزامی است' }))
    }

    // // تولید دستی 15 آیتم با الگوی ثابت
    // const generateManualProperties = () => {
    //   const properties = []
    //   const baseDate = new Date()
    //   baseDate.setMonth(baseDate.getMonth() - 2) // شروع از دو ماه پیش

    //   // تولید 15 آیتم با تاریخ‌های مرتب و قابل پیش‌بینی
    //   for (let i = 1; i <= 100; i++) {
    //     const viewDate = new Date(baseDate)
    //     viewDate.setDate(viewDate.getDate() + i * 2) // هر 2 روز یکبار

    //     properties.push({
    //       propertyId: `prop-${1000 + i}`, // الگوی شماره‌ای منظم
    //       viewedDate: viewDate.toISOString(),
    //     })
    //   }

    //   return properties
    // }

    try {
      // همیشه کاربر را معتبر در نظر بگیریم
      // const data = generateManualProperties()

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: manualData.sort((a, b) => new Date(a.viewedDate).getTime() - new Date(b.viewedDate).getTime()),
        })
      )
    } catch (error) {
      console.error('خطا در پردازش درخواست:', error)
      return res(ctx.status(500), ctx.json({ success: false, message: 'خطای سرور' }))
    }
  }),

  // rest.get('/api/properties/viewed-properties', async (req, res, ctx) => {
  //   const phoneNumber = req.url.searchParams.get('phoneNumber')

  //   if (!phoneNumber) {
  //     return res(
  //       ctx.status(400),
  //       ctx.json({
  //         success: false,
  //         message: 'شماره تلفن الزامی است',
  //       })
  //     )
  //   }

  //   // خواندن اطلاعات کاربر از localStorage
  //   let user: User | null = null
  //   try {
  //     const storedUser = localStorage.getItem('user')
  //     if (storedUser) {
  //       const parsedUser = JSON.parse(storedUser)
  //       if (parsedUser.phoneNumber === phoneNumber) {
  //         user = parsedUser
  //       }
  //     }
  //   } catch (error) {
  //     console.error('خطا در خواندن اطلاعات از localStorage:', error)
  //   }

  //   if (!user) {
  //     return res(
  //       ctx.status(404),
  //       ctx.json({
  //         success: false,
  //         message: 'کاربر یافت نشد',
  //       })
  //     )
  //   }

  //   // تبدیل آرایه propertyIds به فرمت مورد نیاز
  //   const viewedProperties = (user.subscription?.viewedProperties || []).map(({ propertyId, viewedDate }) => ({
  //     propertyId,
  //     viewedDate, // در اینجا می‌توانید تاریخ واقعی بازدید را ذخیره کنید
  //   }))

  //   return res(
  //     ctx.status(200),
  //     ctx.json({
  //       success: true,
  //       data: viewedProperties,
  //     })
  //   )
  // }),

  // Handler for viewing a property (decrements remaining views)
  rest.post('/api/properties/view', async (req, res, ctx) => {
    const { phoneNumber, propertyId } = await req.json<{
      phoneNumber: string
      propertyId: string
    }>()

    // خواندن اطلاعات کاربر از localStorage
    let user: User | null = null
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.phoneNumber === phoneNumber) {
          user = parsedUser

          // تبدیل داده‌های قدیمی به فرمت جدید در صورت نیاز
          if (user.subscription?.viewedProperties) {
            if (
              user.subscription.viewedProperties.length > 0 &&
              typeof user.subscription.viewedProperties[0] === 'string'
            ) {
              user.subscription.viewedProperties = (user.subscription.viewedProperties as unknown as string[]).map(
                (propertyId) => ({
                  propertyId,
                  viewedDate: new Date().toISOString(),
                })
              )
            }
          }
        }
      }
    } catch (error) {
      console.error('خطا در خواندن اطلاعات از localStorage:', error)
    }

    if (!user) {
      return res(ctx.status(403), ctx.json({ message: 'کاربر یافت نشد' }))
    }

    if (!user.subscription || user.subscription.status !== 'ACTIVE') {
      return res(ctx.status(403), ctx.json({ message: 'اشتراک فعال یافت نشد' }))
    }

    // مقداردهی اولیه viewedProperties در صورت عدم وجود
    if (!user.subscription.viewedProperties) {
      user.subscription.viewedProperties = []
    }

    // بررسی بازدیدهای قبلی با فرمت جدید
    const hasViewed = user.subscription.viewedProperties.some((vp) => vp.propertyId === propertyId)
    if (hasViewed) {
      return res(
        ctx.status(200),
        ctx.json({
          message: 'این ملک قبلاً بازدید شده است',
          remainingViews: user.subscription.remainingViews,
          alreadyViewed: true,
        })
      )
    }

    if (user.subscription.remainingViews <= 0) {
      return res(
        ctx.status(403),
        ctx.json({
          message: 'تعداد بازدیدهای مجاز به پایان رسیده است',
        })
      )
    }

    // به‌روزرسانی اطلاعات با فرمت جدید
    const updatedUser: User = {
      ...user,
      subscription: {
        ...user.subscription,
        remainingViews: user.subscription.remainingViews - 1,
        viewedProperties: [
          ...user.subscription.viewedProperties,
          {
            propertyId,
            viewedDate: new Date().toISOString(),
          },
        ],
      },
    }

    // ذخیره اطلاعات به‌روزرسانی‌شده
    try {
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('خطا در ذخیره اطلاعات در localStorage:', error)
    }

    return res(
      ctx.status(200),
      ctx.json({
        status: 201,
        message: 'بازدید با موفقیت ثبت شد',
        data: {
          remainingViews: updatedUser.subscription.remainingViews,
          viewedDate: updatedUser.subscription.viewedProperties.slice(-1)[0].viewedDate,
        },
        alreadyViewed: false,
      })
    )
  }),

  rest.get('/api/subscription/status', async (req, res, ctx) => {
    const phoneNumber = req.url.searchParams.get('phoneNumber')

    if (!phoneNumber) {
      return res(ctx.status(400), ctx.json({ message: 'شماره تلفن الزامی است' }))
    }

    // بررسی اطلاعات از localStorage
    let user: User | null = null
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.phoneNumber === phoneNumber) {
          user = parsedUser
        }
      }
    } catch (error) {
      console.error('خطا در خواندن اطلاعات از localStorage:', error)
    }

    if (!user) {
      return res(ctx.status(404), ctx.json({ message: 'کاربر یافت نشد' }))
    }

    return res(
      ctx.status(200),
      ctx.json({
        data: user.subscription,
      })
    )
  }),

  rest.get('/api/subscriptions', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Success', data: subscriptionPlans }))
  }),

  rest.get('/api/all-housing', (req, res, ctx) => {
    const searchParams = req.url.searchParams
    const title = searchParams.get('title')
    const rawCategoryParam = searchParams.get('category')
    const categoryIds = rawCategoryParam ? rawCategoryParam.split(',').map((id) => id.trim()) : []

    const featureParam = searchParams.get('feature')
    const featureIds = featureParam ? featureParam.split(',') : []

    const status = searchParams.get('status')
    const drawnPointsRaw = searchParams.get('drawnPoints')
    const userCityParam = searchParams.get('userCity')
    const centerLat = parseFloat(searchParams.get('centerLat'))
    const centerLng = parseFloat(searchParams.get('centerLng'))

    let filteredHousing = [...housing]

    if (status) {
      filteredHousing = filteredHousing.filter((item) => item.status === parseInt(status))
    }

    if (!isNaN(centerLat) && !isNaN(centerLng)) {
      const radiusInKm = 10 // شعاع 10 کیلومتر
      const deg2rad = (deg) => deg * (Math.PI / 180)
      const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371 // شعاع زمین برحسب کیلومتر
        const dLat = deg2rad(lat2 - lat1)
        const dLon = deg2rad(lon2 - lon1)
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
      }

      filteredHousing = filteredHousing.filter((item) => {
        const distance = getDistanceFromLatLonInKm(centerLat, centerLng, item.location.lat, item.location.lng)
        return distance <= radiusInKm
      })
    }
    const userCity = JSON.parse(localStorage.getItem('userCity'))
    if (drawnPointsRaw && drawnPointsRaw.length > 0) {
      try {
        const rawPoints = JSON.parse(drawnPointsRaw)

        // تبدیل به [lng, lat]
        const polygonCoords = rawPoints.map(([lat, lng]) => [lng, lat])

        // بستن حلقه
        if (
          polygonCoords.length > 0 &&
          (polygonCoords[0][0] !== polygonCoords.at(-1)?.[0] || polygonCoords[0][1] !== polygonCoords.at(-1)?.[1])
        ) {
          polygonCoords.push(polygonCoords[0])
        }

        const turfPoly = turfPolygon([polygonCoords])

        filteredHousing = filteredHousing.filter((housing) => {
          const { lat, lng } = housing.location || {}
          if (!lat || !lng) return false
          const p = point([lng, lat])
          return booleanPointInPolygon(p, turfPoly)
        })
      } catch (err) {
        console.warn('Invalid drawnPoints', err)
      }
    }
    if (userCityParam == '1' && userCity?.coordinates?.length === 2) {
      console.log(userCityParam, ' passsssssssssssssssss')

      const [cityLat, cityLng] = userCity.coordinates
      const cityPoint = point([cityLng, cityLat])
      const radiusKm = 10

      filteredHousing = filteredHousing.filter((housing) => {
        const { lat, lng } = housing.location || {}
        if (!lat || !lng) return false
        const housingPoint = point([lng, lat])
        const d = distance(cityPoint, housingPoint, { units: 'kilometers' })
        return d <= radiusKm
      })
    }

    if (categoryIds.length > 0) {
      filteredHousing = filteredHousing.sort((a, b) => {
        const aMatch = categoryIds.includes(a.categoryId) ? 1 : 0
        const bMatch = categoryIds.includes(b.categoryId) ? 1 : 0
        return bMatch - aMatch // موارد منطبق رو بیاره بالا
      })
    }

    if (featureIds.length > 0) {
      filteredHousing = filteredHousing.sort((a, b) => {
        const aMatch = a.features?.some((f) => featureIds.includes(f.id)) ? 1 : 0
        const bMatch = b.features?.some((f) => featureIds.includes(f.id)) ? 1 : 0
        return bMatch - aMatch // موارد منطبق رو بیاره بالا
      })
    }

    if (title) {
      const normalizedTitle = normalizePersian(title.trim())

      filteredHousing.sort((a, b) => {
        const aTitle = normalizePersian(a.title || '')
        const bTitle = normalizePersian(b.title || '')

        // امتیاز مشابهت فازی
        const aFuzzy = getFuzzyScore(aTitle, normalizedTitle)
        const bFuzzy = getFuzzyScore(bTitle, normalizedTitle)

        // آیا ابتدای عنوان با سرچ مطابقت دارد؟
        const aStarts = aTitle.startsWith(normalizedTitle) ? 10 : 0
        const bStarts = bTitle.startsWith(normalizedTitle) ? 10 : 0

        // امتیاز نهایی ترکیبی
        const aScore = aFuzzy + aStarts
        const bScore = bFuzzy + bStarts

        return bScore - aScore // امتیاز بیشتر، بالاتر
      })
    }

    return res(ctx.status(200), ctx.json({ message: 'Success', data: filteredHousing }))
  }),

  rest.get('/api/estates', (req, res, ctx) => {
    const searchParams = req.url.searchParams
    const title = searchParams.get('title')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    // دریافت پارامترهای bounds در صورت وجود
    const swLat = searchParams.get('swLat')
    const swLng = searchParams.get('swLng')
    const neLat = searchParams.get('neLat')
    const neLng = searchParams.get('neLng')

    let filteredEstates = [...estates]

    // if (status) {
    //   filteredEstates = filteredEstates.filter((item) => item.status === parseInt(status))
    // }

    // فیلتر کردن بر اساس محدوده جغرافیایی در صورت ارسال پارامترها
    if (swLat && swLng && neLat && neLng) {
      const swLatNum = parseFloat(swLat)
      const swLngNum = parseFloat(swLng)
      const neLatNum = parseFloat(neLat)
      const neLngNum = parseFloat(neLng)

      filteredEstates = filteredEstates.filter((item) => {
        const lat = item.location.lat
        const lng = item.location.lng
        return lat >= swLatNum && lat <= neLatNum && lng >= swLngNum && lng <= neLngNum
      })
    }

    return res(ctx.status(200), ctx.json({ message: 'Success', data: filteredEstates }))
  }),

  rest.post('/api/housing/ad', async (req, res, ctx) => {
    const { category } = await req.json<AdFormValues>()
    // انتخاب یک آیتم تصادفی از housing
    const filteredHousing = housing.filter((item) => item.categoryId === category)
    const randomHousingItem = filteredHousing[Math.floor(Math.random() * filteredHousing.length)]
    randomHousingItem.status = 1
    // ذخیره آیتم در localStorage
    localStorage.setItem('addAdv', JSON.stringify([randomHousingItem]))

    return res(ctx.status(200), ctx.json({ message: 'با موفقیت انجام شد' }))
  }),

  rest.get('/api/housing/:adCode', (req, res, ctx) => {
    const { adCode } = req.params

    const data = housing.find((item) => item.adCode === adCode)

    return res(ctx.status(200), ctx.json(data))
  }),

  rest.get('/api/categories', (req, res, ctx) => {
    const searchParams = req.url.searchParams
    const name = searchParams.get('name')

    let filtered = [...categories]

    if (name) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(name.toLowerCase()))
    }

    return res(ctx.status(200), ctx.json({ message: 'Success', data: filtered }))
  }),

  rest.get('/api/category/:id', (req, res, ctx) => {
    const { id } = req.params

    // تابع بازگشتی برای یافتن دسته‌بندی و فرزندانش
    const findCategoryWithChildren = (categories, id) => {
      for (const category of categories) {
        if (category.id === id) {
          return category // دسته‌بندی پیدا شد
        }
        if (category.sub_categories) {
          const found = findCategoryWithChildren(category.sub_categories, id)
          if (found) {
            return found // دسته‌بندی در فرزندان یافت شد
          }
        }
      }
      return null // در هیچ جایی پیدا نشد
    }

    const category = findCategoryWithChildren(categories, id)

    if (!category) {
      return res(ctx.status(404), ctx.json({ message: `Category not found with id: ${id}` }))
    }

    return res(
      ctx.status(200),
      ctx.json({
        message: 'Success',
        data: category,
      })
    )
  }),

  rest.get('/api/features', (req, res, ctx) => {
    const searchParams = req.url.searchParams
    const name = searchParams.get('name')

    let filtered = [...features]

    if (name) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(name.toLowerCase()))
    }

    return res(ctx.status(200), ctx.json({ message: 'Success', data: filtered }))
  }),

  rest.get('/api/all-news', (req, res, ctx) => {
    const searchParams = req.url.searchParams
    const title = searchParams.get('title')

    let filtered = [...newsData]

    if (title) {
      filtered = filtered.filter((item) => item.title.toLowerCase().includes(title.toLowerCase()))
    }

    return res(ctx.status(200), ctx.json({ message: 'Success', data: filtered }))
  }),

  rest.get('/api/housings/category/:id', (req, res, ctx) => {
    const { id } = req.params

    // فیلتر کردن خانه‌ها بر اساس categoryId
    const filteredHousing = housing.filter((item) => item.categoryId === id)

    if (!filteredHousing.length) {
      return res(ctx.status(404), ctx.json({ message: `No housings found for category id: ${id}` }))
    }

    return res(
      ctx.status(200),
      ctx.json({
        message: 'Success',
        data: filteredHousing,
      })
    )
  }),

  rest.get('/api/features/by-category/:categoryId', (req, res, ctx) => {
    const { categoryId } = req.params

    const categoryFeatures = getFeaturesByCategory(categoryId as string)
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Success',
        data: categoryFeatures,
      })
    )
  }),

  rest.get('/api/request-features/by-category/:categoryId', (req, res, ctx) => {
    const { categoryId } = req.params

    const categoryFeatures = getFeaturesByCategory(categoryId as string)
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Success',
        data: categoryFeatures,
      })
    )
  }),

  rest.get('/api/requests', (req, res, ctx) => {
    const searchParams = req.url.searchParams
    const status = searchParams.get('status')

    let filtered = [...requests]

    if (status) {
      filtered = filtered.filter((item) => item.status === parseInt(status))
    }

    return res(ctx.status(200), ctx.json({ message: 'Success', data: filtered }))
  }),
  ...adminHandlers
]

// {
//   "media": {
//       "images": [
//           {}
//       ],
//       "videos": []
//   },
//   "features": {
//       "f87ac4d1": "1000",
//       "b92df63e": "1380",
//       "2d3acsdf333d1": "false",
//       "f73bd91c": "دارد",
//       "b68ad74e": "دارد",
//       "c97fe82b": "دارد",
//       "e12ad83c": "دارد",
//       "f84ab71d": "ندارد",
//       "a36cd92e": "ندارد",
//       "c85fe91b": "دارد",
//       "d93ab82c": "دارد",
//       "f91ab64e": "ندارد",
//       "a53fe92b": "ندارد",
//       "b81ad74c": "ندارد",
//       "b41ad7r9": "ندارد",
//       "b41ad0a3": "ندارد",
//       "b4134ffe4333": "ندارد",
//       "b41dewew9824333": "ندارد",
//       "a51c28f7": "بدون اتاق",
//       "d38fa91b": "1",
//       "e91ab5c7": "4",
//       "d38fa92p": "1",
//       "b41fc83a": "شمالی",
//       "f89cd72e": "کامپوزیت"
//   },
//   "title": "آگهی یک تست",
//   "rent": 1212,
//   "deposit": 1244444,
//   "location": {
//       "lat": 0,
//       "lng": 0
//   },
//   "category": "1-1",
//   "address": "ثبثس",
//   "postalCode": "2313131322",
//   "phoneNumber": "09014689030",
//   "convertible": false
// }

// Mock data for messages
const conversations = [
  {
    id: '1',
    participants: [
      {
        id: '1',
        fullName: 'محمد شادلو',
        role: 'admin',
        phoneNumber: '09334004040',
        image: '/static/IMG-20240805-WA0098.jpg',
        lastSeen: new Date().toISOString(),
        isOnline: true,
        cityTitle: 'ادمین شهر بجنورد'
      },
      {
        id: '2',
        fullName: 'علی الهی',
        role: 'user',
        phoneNumber: '09123456789',
        image: null,
        lastSeen: new Date(Date.now() - 30 * 60000).toISOString(),
        isOnline: false,
        cityTitle: 'ادمین شهر مشهد'
      }
    ],
    messages: [
      {
        id: '1',
        senderId: '2',
        receiverId: '1',
        text: 'سلام وقتتون بخیر، به مدیری بود. خواستم بپرسم درباره آگهی که به تازگی ثبت شده منطقه سجاد مشهد',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'delivered',
        isRead: true
      },
      {
        id: '2',
        senderId: '1',
        receiverId: '2',
        text: 'سلام ادمین محترم!',
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        status: 'delivered',
        isRead: true
      },
      {
        id: '3',
        senderId: '2',
        receiverId: '1',
        text: 'که اطلاعات مالک با مشخصات ارسال‌کننده نمی‌خونه. میشه کمک کنم تماس بگیرم یا مستقیم روش کنم؟',
        timestamp: new Date(Date.now() - 3400000).toISOString(),
        status: 'delivered',
        isRead: true
      },
      {
        id: '4',
        senderId: '1',
        receiverId: '2',
        text: 'اگر اطلاعات زیاد هست و مطمئن نیستی، حتما تماس بگیر. در صورت عدم پاسخ یا ابهام زیاد، روش کن و دلیل رو هم ذکر کن لطفا',
        timestamp: new Date(Date.now() - 3300000).toISOString(),
        status: 'delivered',
        isRead: true
      },
      {
        id: '5',
        senderId: '2',
        receiverId: '1',
        text: 'تشکر از همکاریتون.',
        timestamp: new Date(Date.now() - 3200000).toISOString(),
        status: 'delivered',
        isRead: true
      }
    ],
    lastMessage: {
      text: 'تشکر از همکاریتون.',
      timestamp: new Date(Date.now() - 3200000).toISOString(),
      senderId: '2'
    },
    unreadCount: 0
  },
  {
    id: '2',
    participants: [
      {
        id: '1',
        fullName: 'محمد شادلو',
        role: 'admin',
        phoneNumber: '09334004040',
        image: '/static/IMG-20240805-WA0098.jpg',
        lastSeen: new Date().toISOString(),
        isOnline: true,
        cityTitle: 'ادمین شهر بجنورد'
      },
      {
        id: '3',
        fullName: 'محمد شجاعی',
        role: 'user',
        phoneNumber: '09187654321',
        image: null,
        lastSeen: new Date(Date.now() - 120 * 60000).toISOString(),
        isOnline: false,
        cityTitle: 'بازاریاب تهران'
      }
    ],
    messages: [
      {
        id: '1',
        senderId: '3',
        receiverId: '1',
        text: 'سلام وقت بخیر، درباره درخواست افزایش سقف ثبت آگهی‌های ماهیانه خواستم صحبت کنم',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'delivered',
        isRead: true
      },
      {
        id: '2',
        senderId: '1',
        receiverId: '3',
        text: 'سلام، بله در خدمتم. چه کمکی از دستم بر میاد؟',
        timestamp: new Date(Date.now() - 86300000).toISOString(),
        status: 'delivered',
        isRead: true
      }
    ],
    lastMessage: {
      text: 'سلام، بله در خدمتم. چه کمکی از دستم بر میاد؟',
      timestamp: new Date(Date.now() - 86300000).toISOString(),
      senderId: '1'
    },
    unreadCount: 0
  },
  {
    id: '3',
    participants: [
      {
        id: '1',
        fullName: 'محمد شادلو',
        role: 'admin',
        phoneNumber: '09334004040',
        image: '/static/IMG-20240805-WA0098.jpg',
        lastSeen: new Date().toISOString(),
        isOnline: true,
        cityTitle: 'ادمین شهر بجنورد'
      },
      {
        id: '4',
        fullName: 'سعید رضازاده',
        role: 'user',
        phoneNumber: '09223344556',
        image: null,
        lastSeen: new Date(Date.now() - 240 * 60000).toISOString(),
        isOnline: false,
        cityTitle: 'بازاریاب تهران'
      }
    ],
    messages: [
      {
        id: '1',
        senderId: '4',
        receiverId: '1',
        text: 'سلام، میشه لطفا یکی از آگهی‌های من رو که اشتباهی وارد شده حذف کنید؟',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: 'delivered',
        isRead: true
      }
    ],
    lastMessage: {
      text: 'سلام، میشه لطفا یکی از آگهی‌های من رو که اشتباهی وارد شده حذف کنید؟',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      senderId: '4'
    },
    unreadCount: 1
  },
  {
    id: '4',
    participants: [
      {
        id: '1',
        fullName: 'محمد شادلو',
        role: 'admin',
        phoneNumber: '09334004040',
        image: '/static/IMG-20240805-WA0098.jpg',
        lastSeen: new Date().toISOString(),
        isOnline: true,
        cityTitle: 'ادمین شهر بجنورد'
      },
      {
        id: '5',
        fullName: 'علی الهی',
        role: 'user',
        phoneNumber: '09111222333',
        image: null,
        lastSeen: new Date(Date.now() - 300 * 60000).toISOString(),
        isOnline: false,
        cityTitle: 'ادمین شهر مشهد'
      }
    ],
    messages: [
      {
        id: '1',
        senderId: '1',
        receiverId: '5',
        text: 'سلام، آگهی شما با کد A10254 تایید شد و از امروز نمایش داده می‌شود.',
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        status: 'delivered',
        isRead: false
      }
    ],
    lastMessage: {
      text: 'سلام، آگهی شما با کد A10254 تایید شد و از امروز نمایش داده می‌شود.',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      senderId: '1'
    },
    unreadCount: 0
  },
  {
    id: '5',
    participants: [
      {
        id: '1',
        fullName: 'محمد شادلو',
        role: 'admin',
        phoneNumber: '09334004040',
        image: '/static/IMG-20240805-WA0098.jpg',
        lastSeen: new Date().toISOString(),
        isOnline: true,
        cityTitle: 'ادمین شهر بجنورد'
      },
      {
        id: '6',
        fullName: 'سعید رضازاده',
        role: 'user',
        phoneNumber: '09444555666',
        image: null,
        lastSeen: new Date(Date.now() - 400 * 60000).toISOString(),
        isOnline: false,
        cityTitle: 'بازاریاب تهران'
      }
    ],
    messages: [
      {
        id: '1',
        senderId: '6',
        receiverId: '1',
        text: 'سلام، من میخواستم یک سوال درباره نحوه ارسال مدارک داشته باشم',
        timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        status: 'delivered',
        isRead: true
      }
    ],
    lastMessage: {
      text: 'سلام، من میخواستم یک سوال درباره نحوه ارسال مدارک داشته باشم',
      timestamp: new Date(Date.now() - 432000000).toISOString(),
      senderId: '6'
    },
    unreadCount: 0
  },
  {
    id: '6',
    participants: [
      {
        id: '1',
        fullName: 'محمد شادلو',
        role: 'admin',
        phoneNumber: '09334004040',
        image: '/static/IMG-20240805-WA0098.jpg',
        lastSeen: new Date().toISOString(),
        isOnline: true,
        cityTitle: 'ادمین شهر بجنورد'
      },
      {
        id: '7',
        fullName: 'علی الهی',
        role: 'user',
        phoneNumber: '09777888999',
        image: null,
        lastSeen: new Date(Date.now() - 500 * 60000).toISOString(),
        isOnline: false,
        cityTitle: 'ادمین شهر مشهد'
      }
    ],
    messages: [
      {
        id: '1',
        senderId: '7',
        receiverId: '1',
        text: 'باسلام، آیا امکان تغییر نام کاربری وجود دارد؟',
        timestamp: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
        status: 'delivered',
        isRead: true
      }
    ],
    lastMessage: {
      text: 'باسلام، آیا امکان تغییر نام کاربری وجود دارد؟',
      timestamp: new Date(Date.now() - 604800000).toISOString(),
      senderId: '7'
    },
    unreadCount: 0
  }
];

// Message API handlers
rest.get('/api/admin/messages', (req, res, ctx) => {
  // Sort conversations by last message timestamp (newest first)
  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
  );
  
  return res(
    ctx.status(200),
    ctx.json({
      success: true,
      data: sortedConversations.map(conv => {
        // Find the other participant (not admin)
        const otherParticipant = conv.participants.find(p => p.id !== '1');
        return {
          id: conv.id,
          user: otherParticipant,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount
        };
      })
    })
  );
}),

rest.get('/api/admin/messages/:conversationId', (req, res, ctx) => {
  const { conversationId } = req.params;
  
  const conversation = conversations.find(conv => conv.id === conversationId);
  
  if (!conversation) {
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: 'گفتگو یافت نشد'
      })
    );
  }
  
  // Mark all messages as read
  conversation.messages.forEach(msg => {
    if (msg.receiverId === '1') {
      msg.isRead = true;
    }
  });
  conversation.unreadCount = 0;
  
  return res(
    ctx.status(200),
    ctx.json({
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          participants: conversation.participants,
          messages: conversation.messages
        }
      }
    })
  );
}),

rest.post('/api/admin/messages/:conversationId', async (req, res, ctx) => {
  const { conversationId } = req.params;
  const { text } = await req.json();
  
  const conversation = conversations.find(conv => conv.id === conversationId);
  
  if (!conversation) {
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: 'گفتگو یافت نشد'
      })
    );
  }
  
  const otherParticipant = conversation.participants.find(p => p.id !== '1');
  
  // Create new message
  const newMessage = {
    id: (conversation.messages.length + 1).toString(),
    senderId: '1',
    receiverId: otherParticipant.id,
    text,
    timestamp: new Date().toISOString(),
    status: 'sent',
    isRead: false
  };
  
  // Add to conversation
  conversation.messages.push(newMessage);
  
  // Update last message
  conversation.lastMessage = {
    text,
    timestamp: newMessage.timestamp,
    senderId: '1'
  };
  
  return res(
    ctx.status(201),
    ctx.json({
      success: true,
      data: {
        message: newMessage
      }
    })
  );
}),

rest.post('/api/admin/messages', async (req, res, ctx) => {
  const { userId, text } = await req.json();
  
  // Check if conversation already exists
  let conversation = conversations.find(
    conv => conv.participants.some(p => p.id === userId)
  );
  
  // Create a properly typed targetUser object
  const targetUser = {
    id: userId,
    fullName: 'کاربر جدید',
    role: 'user',
    phoneNumber: '091234567' + userId,
    image: null,
    lastSeen: new Date().toISOString(),
    isOnline: false,
    cityTitle: 'کاربر'
  };
  
  // Create new conversation if it doesn't exist
  if (!conversation) {
    conversation = {
      id: (conversations.length + 1).toString(),
      participants: [
        {
          id: '1',
          fullName: 'محمد شادلو',
          role: 'admin',
          phoneNumber: '09334004040',
          image: '/static/IMG-20240805-WA0098.jpg',
          lastSeen: new Date().toISOString(),
          isOnline: true,
          cityTitle: 'ادمین شهر بجنورد'
        },
        targetUser
      ],
      messages: [],
      lastMessage: null,
      unreadCount: 0
    };
    conversations.push(conversation);
  }
  
  // Create new message
  const newMessage = {
    id: (conversation.messages.length + 1).toString(),
    senderId: '1',
    receiverId: userId,
    text,
    timestamp: new Date().toISOString(),
    status: 'sent',
    isRead: false
  };
  
  // Add to conversation
  conversation.messages.push(newMessage);
  
  // Update last message
  conversation.lastMessage = {
    text,
    timestamp: newMessage.timestamp,
    senderId: '1'
  };
  
  return res(
    ctx.status(201),
    ctx.json({
      success: true,
      data: {
        conversation,
        message: newMessage
      }
    })
  );
}),

rest.delete('/api/admin/messages/:conversationId', (req, res, ctx) => {
  const { conversationId } = req.params;
  
  const conversationIndex = conversations.findIndex(conv => conv.id === conversationId);
  
  if (conversationIndex === -1) {
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: 'گفتگو یافت نشد'
      })
    );
  }
  
  // Remove conversation
  conversations.splice(conversationIndex, 1);
  
  return res(
    ctx.status(200),
    ctx.json({
      success: true,
      message: 'گفتگو با موفقیت حذف شد'
    })
  );
})
