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

// تعریف موقعیت‌های جغرافیایی برای مناطق مختلف تهران
const tehranLocations = [
  { area: 'ونک', lat: 35.7551, lng: 51.4102 },
  { area: 'تجریش', lat: 35.8059, lng: 51.4329 },
  { area: 'جردن', lat: 35.7696, lng: 51.4194 },
  { area: 'نیاوران', lat: 35.8231, lng: 51.4571 },
  { area: 'پاسداران', lat: 35.7945, lng: 51.4627 },
  { area: 'سعادت آباد', lat: 35.7853, lng: 51.3776 },
  { area: 'شهرک غرب', lat: 35.7607, lng: 51.3571 },
  { area: 'میدان آرژانتین', lat: 35.7561, lng: 51.4177 },
];

// ایجاد آگهی‌های مسکن جدید با موقعیت‌های واقعی تهران
// ساختار برای ذخیره آگهی‌های مورد علاقه کاربران
interface FavoriteItem {
  userId: string;
  adId: string;
}

// آرایه برای ذخیره آگهی‌های مورد علاقه
const favoritesData: FavoriteItem[] = [
  { userId: 'user-123', adId: '102' },
  { userId: 'user-123', adId: '104' }
];

// تابع کمکی برای بررسی وجود آگهی در لیست علاقه‌مندی‌ها
const isFavorite = (userId: string, adId: string): boolean => {
  return favoritesData.some(item => item.userId === userId && item.adId === adId);
};

// تابع کمکی برای دریافت تمام آگهی‌های مورد علاقه یک کاربر
const getUserFavorites = (userId: string): string[] => {
  return favoritesData
    .filter(item => item.userId === userId)
    .map(item => item.adId);
};

const mockHousing = [
  {
    id: '101',
    status: 2,
    title: 'آپارتمان لوکس ۱۵۰ متری در ونک',
    full_address: { 
      latitude: tehranLocations[0].lat, 
      longitude: tehranLocations[0].lng,
      province: {
        id: 1,
        name: 'تهران'
      },
      city: {
        id: 1,
        name: 'تهران'
      },
      street: 'خیابان ملاصدرا',
      address: 'تهران، ونک، خیابان ملاصدرا، کوچه شیراز'
    },
    highlight_attributes: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        icon: '/static/ads/Bed.png',
        name: 'تعداد اتاق',
        value: '3',
      },
      {
        id: '2',
        image: '/static/ads/grid-2.png',
        icon: '/static/ads/grid-2.png',
        name: 'متراژ',
        value: '150',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        icon: '/static/ads/buliding.png',
        name: 'سال ساخت',
        value: '1401',
      },
    ],
    attributes: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        key: 'text_room_count',
        name: 'تعداد اتاق',
        value: '3',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        key: 'text_parking',
        name: 'پارکینگ',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        key: 'text_storage',
        name: 'انباری',
        value: 'دارد',
      },
      {
        id: '4',
        image: '/static/ads/buliding.png',
        key: 'text_elevator',
        name: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '5',
        image: '/static/ads/buliding.png',
        key: 'text_facade',
        name: 'نمای ساختمان',
        value: 'سنگ و شیشه',
      },
      {
        id: '6',
        image: '/static/ads/grid-2.png',
        key: 'text_selling_price',
        name: 'قیمت',
        value: '28000000000',
      },
    ],
    price: {
      deposit: 0,
      rent: 0,
      amount: 28000000000,
      currency: 'IRT',
      is_negotiable: false,
      discount_amount: 0,
      original_amount: 28000000000,
      price_per_unit: 186666667,
      unit: 'متر مربع'
    },
    category: {
      id: '2-1',
      name: 'فروش آپارتمان',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expiry_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    primary_image: '/static/ads/pic1.jpg',
    images: [
      {
        url: '/static/ads/pic1.jpg',
        is_primary: true,
        order: 1,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      },
      {
        url: '/static/ads/pic2.jpg',
        is_primary: false,
        order: 2,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      },
      {
        url: '/static/ads/pic3.jpg',
        is_primary: false,
        order: 3,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      }
    ],
    user: {
      id: 'user-123',
      phone_number: '09121234567',
      full_name: 'علی رضایی',
      user_type: 2
    },
    statistics: {
      views: 45,
      favorites: 12,
      inquiries: 5,
      shares: 3,
      last_viewed_at: new Date().toISOString()
    },
    description: 'آپارتمان لوکس با نور و نقشه عالی، طبقه هشتم، دسترسی عالی به مترو و مراکز خرید',
  },
  {
    id: '102',
    status: 2,
    title: 'آپارتمان ۲۰۰ متری در تجریش',
    full_address: { 
      latitude: tehranLocations[1].lat, 
      longitude: tehranLocations[1].lng,
      province: {
        id: 1,
        name: 'تهران'
      },
      city: {
        id: 1,
        name: 'تهران'
      },
      street: 'خیابان ولیعصر',
      address: 'تهران، تجریش، خیابان ولیعصر، کوچه بهار'
    },
    highlight_attributes: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        icon: '/static/ads/Bed.png',
        name: 'تعداد اتاق',
        value: '4',
      },
      {
        id: '2',
        image: '/static/ads/grid-2.png',
        icon: '/static/ads/grid-2.png',
        name: 'متراژ',
        value: '200',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        icon: '/static/ads/buliding.png',
        name: 'سال ساخت',
        value: '1399',
      },
    ],
    attributes: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        key: 'text_room_count',
        name: 'تعداد اتاق',
        value: '4',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        key: 'text_parking',
        name: 'پارکینگ',
        value: 'دارد - دو پارکینگ',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        key: 'text_storage',
        name: 'انباری',
        value: 'دارد',
      },
      {
        id: '4',
        image: '/static/ads/buliding.png',
        key: 'text_elevator',
        name: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '5',
        image: '/static/ads/buliding.png',
        key: 'text_pool',
        name: 'استخر',
        value: 'دارد',
      },
      {
        id: '6',
        image: '/static/ads/buliding.png',
        key: 'text_sauna',
        name: 'سونا',
        value: 'دارد',
      },
      {
        id: '7',
        image: '/static/ads/grid-2.png',
        key: 'text_selling_price',
        name: 'قیمت',
        value: '35000000000',
      },
    ],
    price: {
      deposit: 0,
      rent: 0,
      amount: 35000000000,
      currency: 'IRT',
      is_negotiable: false,
      discount_amount: 0,
      original_amount: 35000000000,
      price_per_unit: 175000000,
      unit: 'متر مربع'
    },
    category: {
      id: '2-1',
      name: 'فروش آپارتمان',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expiry_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    primary_image: '/static/ads/pic2.jpg',
    images: [
      {
        url: '/static/ads/pic2.jpg',
        is_primary: true,
        order: 1,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      },
      {
        url: '/static/ads/pic3.jpg',
        is_primary: false,
        order: 2,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      },
      {
        url: '/static/ads/pic4.jpg',
        is_primary: false,
        order: 3,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      }
    ],
    user: {
      id: 'user-123',
      phone_number: '09121234567',
      full_name: 'علی رضایی',
      user_type: 2
    },
    statistics: {
      views: 32,
      favorites: 8,
      inquiries: 3,
      shares: 2,
      last_viewed_at: new Date().toISOString()
    },
    description: 'آپارتمان لوکس در منطقه تجریش با دید عالی به شهر، دارای استخر و سونا',
  },
  {
    id: '103',
    status: 2,
    title: 'آپارتمان ۸۵ متری در نیاوران',
    full_address: { 
      latitude: tehranLocations[2].lat, 
      longitude: tehranLocations[2].lng,
      province: {
        id: 1,
        name: 'تهران'
      },
      city: {
        id: 1,
        name: 'تهران'
      },
      street: 'خیابان نیاوران',
      address: 'تهران، نیاوران، خیابان جماران، کوچه یاس'
    },
    highlight_attributes: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        icon: '/static/ads/Bed.png',
        name: 'تعداد اتاق',
        value: '2',
      },
      {
        id: '2',
        image: '/static/ads/grid-2.png',
        icon: '/static/ads/grid-2.png',
        name: 'متراژ',
        value: '85',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        icon: '/static/ads/buliding.png',
        name: 'سال ساخت',
        value: '1395',
      },
    ],
    attributes: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        key: 'text_room_count',
        name: 'تعداد اتاق',
        value: '2',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        key: 'text_parking',
        name: 'پارکینگ',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        key: 'text_storage',
        name: 'انباری',
        value: 'دارد',
      },
      {
        id: '4',
        image: '/static/ads/buliding.png',
        key: 'text_elevator',
        name: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '5',
        image: '/static/ads/grid-2.png',
        key: 'text_mortgage_deposit',
        name: 'رهن',
        value: '400000000',
      },
      {
        id: '6',
        image: '/static/ads/grid-2.png',
        key: 'text_monthly_rent',
        name: 'اجاره',
        value: '15000000',
      },
    ],
    price: {
      deposit: 400000000,
      rent: 15000000,
      amount: 0,
      currency: 'IRT',
      is_negotiable: true,
      discount_amount: 0,
      original_amount: 0,
      price_per_unit: 0,
      unit: 'متر مربع'
    },
    category: {
      id: '1-2',
      name: 'رهن و اجاره آپارتمان',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expiry_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    primary_image: '/static/ads/pic3.jpg',
    images: [
      {
        url: '/static/ads/pic3.jpg',
        is_primary: true,
        order: 1,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      },
      {
        url: '/static/ads/pic4.jpg',
        is_primary: false,
        order: 2,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      }
    ],
    user: {
      id: 'user-456',
      phone_number: '09129876543',
      full_name: 'رضا محمدی',
      user_type: 2
    },
    statistics: {
      views: 27,
      favorites: 5,
      inquiries: 4,
      shares: 1,
      last_viewed_at: new Date().toISOString()
    },
    description: 'آپارتمان شیک و نوساز در منطقه نیاوران، نزدیک به پارک و مراکز خرید',
  },
  {
    id: '104',
    status: 2,
    title: 'آپارتمان دوبلکس ۲۵۰ متری در زعفرانیه',
    full_address: { 
      latitude: tehranLocations[3].lat, 
      longitude: tehranLocations[3].lng,
      province: {
        id: 1,
        name: 'تهران'
      },
      city: {
        id: 1,
        name: 'تهران'
      },
      street: 'خیابان زعفرانیه',
      address: 'تهران، زعفرانیه، خیابان مقدس اردبیلی، کوچه آرش'
    },
    highlight_attributes: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        icon: '/static/ads/Bed.png',
        name: 'تعداد اتاق',
        value: '5',
      },
      {
        id: '2',
        image: '/static/ads/grid-2.png',
        icon: '/static/ads/grid-2.png',
        name: 'متراژ',
        value: '250',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        icon: '/static/ads/buliding.png',
        name: 'سال ساخت',
        value: '1402',
      },
    ],
    attributes: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        key: 'text_room_count',
        name: 'تعداد اتاق',
        value: '5',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        key: 'text_parking',
        name: 'پارکینگ',
        value: 'دارد - سه پارکینگ',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        key: 'text_storage',
        name: 'انباری',
        value: 'دارد',
      },
      {
        id: '4',
        image: '/static/ads/buliding.png',
        key: 'text_elevator',
        name: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '5',
        image: '/static/ads/buliding.png',
        key: 'text_jacuzzi',
        name: 'جکوزی',
        value: 'دارد',
      },
      {
        id: '6',
        image: '/static/ads/grid-2.png',
        key: 'text_selling_price',
        name: 'قیمت',
        value: '75000000000',
      },
    ],
    price: {
      deposit: 0,
      rent: 0,
      amount: 75000000000,
      currency: 'IRT',
      is_negotiable: false,
      discount_amount: 0,
      original_amount: 75000000000,
      price_per_unit: 300000000,
      unit: 'متر مربع'
    },
    category: {
      id: '2-1',
      name: 'فروش آپارتمان',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expiry_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    primary_image: '/static/ads/pic4.jpg',
    images: [
      {
        url: '/static/ads/pic4.jpg',
        is_primary: true,
        order: 1,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      },
      {
        url: '/static/ads/pic5.jpg',
        is_primary: false,
        order: 2,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      },
      {
        url: '/static/ads/pic1.jpg',
        is_primary: false,
        order: 3,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      }
    ],
    user: {
      id: 'user-789',
      phone_number: '09123456789',
      full_name: 'محمد حسینی',
      user_type: 3
    },
    statistics: {
      views: 65,
      favorites: 20,
      inquiries: 12,
      shares: 8,
      last_viewed_at: new Date().toISOString()
    },
    description: 'آپارتمان لوکس دوبلکس در بهترین منطقه زعفرانیه، با چشم‌انداز عالی و امکانات رفاهی کامل',
  },
  {
    id: '105',
    status: 2,
    title: 'آپارتمان ۱۲۰ متری در پاسداران',
    full_address: { 
      latitude: tehranLocations[4].lat, 
      longitude: tehranLocations[4].lng,
      province: {
        id: 1,
        name: 'تهران'
      },
      city: {
        id: 1,
        name: 'تهران'
      },
      street: 'خیابان پاسداران',
      address: 'تهران، پاسداران، بوستان پنجم، پلاک ۱۵'
    },
    highlight_attributes: [
      {
        id: '1',
        image: '/static/ads/Bed.png',
        icon: '/static/ads/Bed.png',
        name: 'تعداد اتاق',
        value: '3',
      },
      {
        id: '2',
        image: '/static/ads/grid-2.png',
        icon: '/static/ads/grid-2.png',
        name: 'متراژ',
        value: '120',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        icon: '/static/ads/buliding.png',
        name: 'سال ساخت',
        value: '1398',
      },
    ],
    attributes: [
      {
        id: '1',
        image: '/static/ads/buliding.png',
        key: 'text_room_count',
        name: 'تعداد اتاق',
        value: '3',
      },
      {
        id: '2',
        image: '/static/ads/buliding.png',
        key: 'text_parking',
        name: 'پارکینگ',
        value: 'دارد',
      },
      {
        id: '3',
        image: '/static/ads/buliding.png',
        key: 'text_storage',
        name: 'انباری',
        value: 'دارد',
      },
      {
        id: '4',
        image: '/static/ads/buliding.png',
        key: 'text_elevator',
        name: 'آسانسور',
        value: 'دارد',
      },
      {
        id: '5',
        image: '/static/ads/grid-2.png',
        key: 'text_mortgage_deposit',
        name: 'رهن',
        value: '500000000',
      },
      {
        id: '6',
        image: '/static/ads/grid-2.png',
        key: 'text_monthly_rent',
        name: 'اجاره',
        value: '25000000',
      },
    ],
    price: {
      deposit: 500000000,
      rent: 25000000,
      amount: 0,
      currency: 'IRT',
      is_negotiable: true,
      discount_amount: 0,
      original_amount: 0,
      price_per_unit: 0,
      unit: 'متر مربع'
    },
    category: {
      id: '1-2',
      name: 'رهن و اجاره آپارتمان',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expiry_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    primary_image: '/static/ads/pic5.jpg',
    images: [
      {
        url: '/static/ads/pic5.jpg',
        is_primary: true,
        order: 1,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      },
      {
        url: '/static/ads/pic1.jpg',
        is_primary: false,
        order: 2,
        width: 800,
        height: 600,
        alt_text: 'تصویر آپارتمان'
      }
    ],
    user: {
      id: 'user-123',
      phone_number: '09121234567',
      full_name: 'علی رضایی',
      user_type: 2
    },
    statistics: {
      views: 38,
      favorites: 10,
      inquiries: 7,
      shares: 2,
      last_viewed_at: new Date().toISOString()
    },
    description: 'آپارتمان شیک با نورگیری عالی در منطقه پاسداران، دسترسی عالی به مترو و مراکز خرید',
  },
];

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
  // Authentication handlers
  rest.post('/api/auth/get_ver_code', async (req, res, ctx) => {
    const { phone_number } = await req.json()

    // Check if phone number is valid
    if (!/^09[0-9]{9}$/.test(phone_number)) {
      return res(
        ctx.status(400),
        ctx.json({ 
          success: false,
          message: 'شماره موبایل نامعتبر است'
        })
      )
    }

    // Generate a 6-digit verification code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
    verificationCodes.set(phone_number, randomCode)

    // Return success response
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'کد تایید ارسال شد',
        code: randomCode
      })
    )
  }),

  rest.post('/api/auth/see_ver_code', async (req, res, ctx) => {
    const { phone_number } = await req.json()

    // Check if phone number is valid
    if (!/^09[0-9]{9}$/.test(phone_number)) {
      return res(
        ctx.status(400),
        ctx.json({ 
          success: false,
          message: 'شماره موبایل نامعتبر است'
        })
      )
    }

    // Get the stored verification code
    const code = verificationCodes.get(phone_number) || Math.floor(100000 + Math.random() * 900000).toString()
    verificationCodes.set(phone_number, code)

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'کد تایید بازیابی شد',
        code
      })
    )
  }),

  rest.post('/api/auth/verify', async (req, res, ctx) => {
    const { phone_number, verify_code } = await req.json()
    
    // Check if code is valid
    const storedCode = verificationCodes.get(phone_number)
    
    if (!storedCode || verify_code !== storedCode) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          message: 'کد تایید نامعتبر است'
        })
      )
    }

    // Create or get user based on phone number
    let user = Array.from(users.values()).find(u => u.phone_number === phone_number)
    
    if (!user) {
      // Create a new user if not exists
      const newUser = {
        id: generateUUID(),
        phone_number: phone_number,
        first_name: '',
        last_name: '',
        is_verified: true,
        is_active: true,
        user_type: 1, // Default to NormalUser
        user_group: 1
      }
      users.set(newUser.id, newUser)
      user = newUser
    }

    // Remove verification code after successful verification
    verificationCodes.delete(phone_number)

    // Generate a mock token
    const token = `mock-token-${Date.now()}`

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'ورود موفقیت آمیز',
        token
      })
    )
  }),

  rest.get('/api/user/profile', (req, res, ctx) => {
    // Mock user data for profile
    return res(
      ctx.status(200),
      ctx.json({
        id: "user-123",
        first_name: "محمد",
        last_name: "محمدی",
        father_name: "علی",
        security_number: "0012345678",
        email: "mohammad@example.com",
        phone_number: "09123456789",
        is_verified: true,
        is_active: true,
        user_type: 1,
        user_group: 4,
        birthday: "1370/03/15",
        gender: "male",
        province: { id: 1, name: "تهران", slug: "tehran" },
        city: { id: 1, name: "تهران", slug: "tehran", province_id: 1 },
        user_wallet: { id: 1, balance: 0 },
        addresses: [
          {
            id: 1,
            province_id: 1,
            city_id: 1,
            street: "",
            address: "خیابان ولیعصر",
            zip_code: "1234567890",
            longitude: 51.389,
            latitude: 35.6892
          }
        ],
        avatar: null
      })
    )
  }),
  
  rest.put('/api/user/profile', async (req, res, ctx) => {
    const updatedUser = await req.json()
    
    // Store the updated user data in sessionStorage
    try {
      sessionStorage.setItem('updatedUserProfile', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Error storing updated user data:', error)
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'اطلاعات حساب کاربری با موفقیت بروز رسانی شد'
      })
    )
  }),

  rest.post('/api/user/avatar', async (req, res, ctx) => {
    // Mock avatar upload response
    return res(
      ctx.status(200),
      ctx.json({
        status: 'success',
        avatar: {
          path: '/uploads/avatars/user-123-avatar.jpg',
          url: '/media/uploads/avatars/user-123-avatar.jpg'
        }
      })
    )
  }),
  
  rest.get('/api/geolocation/get_provinces', (req, res, ctx) => {
    const provinces = [
      { id: 1, name: "تهران", slug: "tehran" },
      { id: 2, name: "اصفهان", slug: "esfahan" },
      { id: 3, name: "خراسان رضوی", slug: "khorasan-razavi" },
      { id: 4, name: "فارس", slug: "fars" },
      { id: 5, name: "خوزستان", slug: "khuzestan" },
      { id: 6, name: "آذربایجان شرقی", slug: "east-azerbaijan" },
      { id: 7, name: "آذربایجان غربی", slug: "west-azerbaijan" },
      { id: 8, name: "کرمان", slug: "kerman" },
      { id: 9, name: "مازندران", slug: "mazandaran" },
      { id: 10, name: "گیلان", slug: "gilan" }
    ]
    
    return res(
      ctx.status(200),
      ctx.json(provinces)
    )
  }),
  
  rest.get('/api/geolocation/get_cites_by_id/:provinceId', (req, res, ctx) => {
    const { provinceId } = req.params
    
    // Create different cities based on province ID
    let cities = []
    
    if (provinceId === '1') {
      cities = [
        { id: 1, name: "تهران", slug: "tehran", province_id: 1 },
        { id: 2, name: "شمیرانات", slug: "shemiranat", province_id: 1 },
        { id: 3, name: "اسلامشهر", slug: "eslamshahr", province_id: 1 },
        { id: 4, name: "پاکدشت", slug: "pakdasht", province_id: 1 }
      ]
    } else if (provinceId === '2') {
      cities = [
        { id: 5, name: "اصفهان", slug: "esfahan", province_id: 2 },
        { id: 6, name: "کاشان", slug: "kashan", province_id: 2 },
        { id: 7, name: "نجف آباد", slug: "najafabad", province_id: 2 }
      ]
    } else if (provinceId === '3') {
      cities = [
        { id: 8, name: "مشهد", slug: "mashhad", province_id: 3 },
        { id: 9, name: "نیشابور", slug: "neyshabur", province_id: 3 },
        { id: 10, name: "سبزوار", slug: "sabzevar", province_id: 3 }
      ]
    } else {
      cities = [
        { id: 11, name: "شهر 1", slug: "city-1", province_id: parseInt(provinceId as string) },
        { id: 12, name: "شهر 2", slug: "city-2", province_id: parseInt(provinceId as string) },
        { id: 13, name: "شهر 3", slug: "city-3", province_id: parseInt(provinceId as string) }
      ]
    }
    
    return res(
      ctx.status(200),
      ctx.json(cities)
    )
  }),

  // Existing handlers
  rest.post('/api/auth/send-code', async (req, res, ctx) => {
    const { phoneNumber } = await req.json<{ phoneNumber: string }>()

    if (!/^09[0-9]{9}$/.test(phoneNumber)) {
      return res(ctx.status(400), ctx.json({ message: 'شماره موبایل نامعتبر است' }))
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
    verificationCodes.set(phoneNumber, randomCode)
    return res(ctx.status(200), ctx.json({ message: 'کد تایید ارسال شد', code: randomCode }))
  }),
  
  // ... rest of your existing handlers

  // Add handlers for missing endpoints
  rest.get('/api/categories', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: categories,
      })
    )
  }),

  rest.get('/api/features', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: features,
      })
    )
  }),

  rest.get('/api/advertisements/favorites', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [],
      })
    )
  }),

  rest.get('/api/advertisements/nearby', (req, res, ctx) => {
    const longitude = parseFloat(req.url.searchParams.get('longitude') || '51.41')
    const latitude = parseFloat(req.url.searchParams.get('latitude') || '35.75')
    const radius = parseFloat(req.url.searchParams.get('radius') || '5')
    
    // Filter advertisements based on location and radius
    const nearbyAds = mockHousing.map(ad => {
      // Calculate distance from requested coordinates
      const distanceKm = Math.sqrt(
        Math.pow((ad.full_address.latitude - latitude) * 111, 2) + 
        Math.pow((ad.full_address.longitude - longitude) * 85, 2)
      )
      
      return {
        ...ad,
        distance: parseFloat(distanceKm.toFixed(1))
      }
    }).filter(ad => ad.distance <= radius)
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        items: nearbyAds,
        total: nearbyAds.length
      })
    )
  }),

  rest.get('/api/subscription/status', (req, res, ctx) => {
    // Return mock subscription status
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          type: 'MONTHLY',
          remainingViews: 95,
          totalViews: 100,
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(), // 23 days from now
          status: 'ACTIVE',
          viewedProperties: [],
        }
      })
    )
  }),

  // Handler for advertisements list
  rest.get('/api/advertisements', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page') || '1')
    const limit = parseInt(req.url.searchParams.get('limit') || '10')
    const categoryId = req.url.searchParams.get('categoryId')
    const userId = 'user-123' // استفاده از کاربر پیش‌فرض
    
    // Filter by category if provided
    let filteredAds = mockHousing
    if (categoryId) {
      filteredAds = mockHousing.filter(ad => ad.category.id === categoryId)
    }
    
    // Paginate results
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedAds = filteredAds.slice(startIndex, endIndex)
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        items: paginatedAds.map(ad => ({
          ...ad,
          isFavorite: isFavorite(userId, ad.id)
        })),
        total: filteredAds.length,
        page,
        limit,
        totalPages: Math.ceil(filteredAds.length / limit)
      })
    )
  }),
  // Handler for getting metadata (categories) for advertisement form
  rest.get('/api/advertisements/meta', (req, res, ctx) => {
    console.log('درخواست API دریافت متادیتا را دریافت کردم!');
    // ساخت لیست دسته‌بندی‌های آزمایشی برای فرم
    const metaData = {
      main_categories: [
        {
          id: '1',
          name: 'رهن و اجاره',
          image: 'static/OBJECTM.png',
          sub_categories: [
            {
              id: '1-1',
              name: 'رهن و اجاره آپارتمان',
              main_category: {
                id: '1',
                name: 'رهن و اجاره'
              }
            },
            {
              id: '1-2',
              name: 'رهن و اجاره خانه و ویلا',
              main_category: {
                id: '1',
                name: 'رهن و اجاره'
              }
            },
            {
              id: '1-3',
              name: 'رهن و اجاره دفتر کار و تجاری',
              main_category: {
                id: '1',
                name: 'رهن و اجاره'
              }
            }
          ]
        },
        {
          id: '2',
          name: 'فروش',
          image: 'static/OBJECTS.png',
          sub_categories: [
            {
              id: '2-1',
              name: 'فروش آپارتمان',
              main_category: {
                id: '2',
                name: 'فروش'
              }
            },
            {
              id: '2-2',
              name: 'فروش خانه و ویلا',
              main_category: {
                id: '2',
                name: 'فروش'
              }
            },
            {
              id: '2-3',
              name: 'فروش زمین و کلنگی',
              main_category: {
                id: '2',
                name: 'فروش'
              }
            },
            {
              id: '2-4',
              name: 'فروش دفتر کار و تجاری',
              main_category: {
                id: '2',
                name: 'فروش'
              }
            }
          ]
        },
        {
          id: '3',
          name: 'پروژه‌های ساختمانی',
          image: 'static/OBJECTM.png',
          sub_categories: [
            {
              id: '3-1',
              name: 'پیش فروش آپارتمان',
              main_category: {
                id: '3',
                name: 'پروژه‌های ساختمانی'
              }
            },
            {
              id: '3-2',
              name: 'مشارکت در ساخت',
              main_category: {
                id: '3',
                name: 'پروژه‌های ساختمانی'
              }
            }
          ]
        }
      ],
      features: [
        {
          id: 'common1',
          name: 'متراژ',
          key: 'text_area',
          type: 'text',
          required: true
        },
        {
          id: 'common2',
          name: 'تعداد اتاق',
          key: 'text_room_count',
          type: 'choice',
          required: false,
          value: [
            { id: '1', value: '1 اتاق' },
            { id: '2', value: '2 اتاق' },
            { id: '3', value: '3 اتاق' },
            { id: '4', value: '4 اتاق' },
            { id: '5', value: '5 اتاق یا بیشتر' }
          ]
        },
        {
          id: 'common3',
          name: 'سال ساخت',
          key: 'text_year_built',
          type: 'text',
          required: false
        },
        {
          id: 'common4',
          name: 'پارکینگ',
          key: 'bool_parking',
          type: 'bool',
          required: false
        },
        {
          id: 'common5',
          name: 'انباری',
          key: 'bool_storage',
          type: 'bool',
          required: false
        },
        {
          id: 'common6',
          name: 'آسانسور',
          key: 'bool_elevator',
          type: 'bool',
          required: false
        }
      ]
    };
    
    return res(
      ctx.status(200),
      ctx.json(metaData)
    );
  }),
  
  // Handler for advertisement details
  rest.get('/api/advertisements/:id', (req, res, ctx) => {
    const { id } = req.params
    const ad = mockHousing.find(ad => ad.id === id)
    const userId = 'user-123' // استفاده از کاربر پیش‌فرض
    
    if (!ad) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'آگهی یافت نشد'
        })
      )
    }
    
    // برای اطمینان از اینکه تمام فیلدهای مورد نیاز وجود دارند
    const enhancedAd = {
      ...ad,
      isFavorite: isFavorite(userId, ad.id),
      // اطمینان از وجود فیلدهای ضروری
      statistics: {
        views: ad.statistics?.views || 0,
        favorites: ad.statistics?.favorites || 0,
        inquiries: ad.statistics?.inquiries || 0,
        shares: ad.statistics?.shares || 0,
        last_viewed_at: ad.statistics?.last_viewed_at || new Date().toISOString()
      },
      contact_info: {
        phone_number: ad.user?.phone_number || ''
      },
      user: {
        ...ad.user,
        id: ad.user?.id || 'user-123',
        phone_number: ad.user?.phone_number || '09123456789',
        full_name: ad.user?.full_name || 'کاربر سودم',
        user_type: ad.user?.user_type || 2
      }
    }
    
    return res(
      ctx.status(200),
      ctx.json(enhancedAd)
    )
  }),
  
  // Handler for my advertisements
  rest.post('/api/advertisements/my_adv', (req, res, ctx) => {
    // Return first 3 advertisements as user's ads
    const userAds = mockHousing.slice(0, 3)
    
    return res(
      ctx.status(200),
      ctx.json({
        items: userAds,
        total: userAds.length
      })
    )
  }),
  
  // Handler for advertisement features by category
  rest.post('/api/advertisements/features', async (req, res, ctx) => {
    // Extract category info from request body
    const body = await req.json()
    const { sub_category_id, sub_category_level_two_id } = body
    
    // Return filtered features based on category
    const filteredFeatures = features.slice(0, 15) // Use first 15 features
    
    return res(
      ctx.status(200),
      ctx.json({
        features: filteredFeatures
      })
    )
  }),
  
  // Handler for categories
  rest.get('/api/categories', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: categories
      })
    )
  }),
  
  // Handler for advertisements by geolocation
  rest.get('/api/advertisements/by-geolocation', (req, res, ctx) => {
    const longitudeStr = req.url.searchParams.get('longitude') || '51.41'
    const latitudeStr = req.url.searchParams.get('latitude') || '35.75'
    const radiusStr = req.url.searchParams.get('radius') || '5'
    
    const longitude = parseFloat(longitudeStr)
    const latitude = parseFloat(latitudeStr)
    const radius = parseFloat(radiusStr)
    
    const userId = 'user-123' // استفاده از کاربر پیش‌فرض
    
    // Filter advertisements based on location and radius
    const geoAds = mockHousing.map(ad => {
      const distanceKm = Math.sqrt(
        Math.pow((ad.full_address.latitude - latitude) * 111, 2) + 
        Math.pow((ad.full_address.longitude - longitude) * 85, 2)
      )
      
      return {
        ...ad,
        distance: parseFloat(distanceKm.toFixed(1)),
        isFavorite: isFavorite(userId, ad.id)
      }
    }).filter(ad => ad.distance <= radius)
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: geoAds,
        total: geoAds.length
      })
    )
  }),
  
  // Handler for advertisement view increment
  rest.post('/api/advertisements/:id/view', (req, res, ctx) => {
    const { id } = req.params
    const ad = mockHousing.find(ad => ad.id === id)
    
    if (ad && ad.statistics) {
      ad.statistics.views += 1
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'بازدید با موفقیت ثبت شد'
      })
    )
  }),
  
  // Handler for uploading media files for advertisement
  rest.post('/api/media/upload', (req, res, ctx) => {
    // ساخت URL ساختگی برای فایل‌های آپلود شده
    // در MSW نمی‌توانیم مستقیماً به formData دسترسی داشته باشیم، پس داده‌های ساختگی می‌سازیم
    
    // ساخت پاسخ ساختگی برای آپلود فایل
    const numberOfFiles = Math.floor(Math.random() * 3) + 1; // بین 1 تا 3 فایل
    
    const responses = [];
    for (let i = 0; i < numberOfFiles; i++) {
      const isVideo = Math.random() > 0.8; // 20% احتمال اینکه فایل ویدئو باشد
      
      // ساخت آدرس ساختگی برای هر فایل
      let url;
      if (isVideo) {
        url = `/static/ads/video${i + 1}.mp4`;
      } else {
        // استفاده از یکی از تصاویر موجود برای هر فایل تصویری
        const imageOptions = ['/static/ads/pic1.jpg', '/static/ads/pic2.jpg', '/static/ads/pic3.jpg', '/static/ads/pic4.jpg', '/static/ads/pic5.jpg'];
        url = imageOptions[Math.floor(Math.random() * imageOptions.length)];
      }
      
      responses.push({ 
        url, 
        originalName: isVideo ? `video${i + 1}.mp4` : `image${i + 1}.jpg`, 
        type: isVideo ? 'video/mp4' : 'image/jpeg' 
      });
    }
    
    return res(
      ctx.status(200),
      ctx.json(responses)
    );
  }),
  

  
  // Handler for getting features for a category
  rest.post('*/api/advertisements/features', async (req, res, ctx) => {
    const { sub_category_id, sub_category_level_two_id } = await req.json();
    
    console.log('دریافت ویژگی‌های دسته‌بندی با شناسه:', sub_category_id, 'و زیرشاخه:', sub_category_level_two_id);
    
    // در اینجا بر اساس دسته‌بندی انتخاب شده، ویژگی‌های مختلفی را برمی‌گردانیم
    let features = [];
    
    // ویژگی‌های مشترک برای همه دسته‌بندی‌ها
    const commonFeatures = [
      {
        id: 'common1',
        name: 'متراژ',
        key: 'text_area',
        type: 'text',
        required: true
      },
      {
        id: 'common2',
        name: 'تعداد اتاق',
        key: 'text_room_count',
        type: 'choice',
        required: false,
        value: [
          { id: '1', value: '1 اتاق' },
          { id: '2', value: '2 اتاق' },
          { id: '3', value: '3 اتاق' },
          { id: '4', value: '4 اتاق' },
          { id: '5', value: '5 اتاق یا بیشتر' }
        ]
      },
      {
        id: 'common3',
        name: 'سال ساخت',
        key: 'text_year_built',
        type: 'text',
        required: false
      },
      {
        id: 'common4',
        name: 'پارکینگ',
        key: 'bool_parking',
        type: 'bool',
        required: false
      },
      {
        id: 'common5',
        name: 'انباری',
        key: 'bool_storage',
        type: 'bool',
        required: false
      },
      {
        id: 'common6',
        name: 'آسانسور',
        key: 'bool_elevator',
        type: 'bool',
        required: false
      }
    ];
    
    features = [...commonFeatures];
    
    // ویژگی‌های خاص برای هر دسته‌بندی
    if (String(sub_category_id).startsWith('1')) {
      // رهن و اجاره
      features.push(
        {
          id: 'rent1',
          name: 'مبلغ رهن',
          key: 'text_mortgage_deposit',
          type: 'text',
          required: true
        },
        {
          id: 'rent2',
          name: 'مبلغ اجاره ماهانه',
          key: 'text_monthly_rent',
          type: 'text',
          required: true
        },
        {
          id: 'rent3',
          name: 'قابل تبدیل',
          key: 'bool_convertible',
          type: 'bool',
          required: false
        },
        {
          id: 'rent4',
          name: 'طبقه',
          key: 'text_floor',
          type: 'text',
          required: false
        }
      );
    } else if (String(sub_category_id).startsWith('2')) {
      // فروش
      features.push(
        {
          id: 'sale1',
          name: 'قیمت فروش',
          key: 'text_selling_price',
          type: 'text',
          required: true
        },
        {
          id: 'sale2',
          name: 'تخفیف',
          key: 'text_discount',
          type: 'text',
          required: false
        },
        {
          id: 'sale3',
          name: 'طبقه',
          key: 'text_floor',
          type: 'text',
          required: false
        },
        {
          id: 'sale4',
          name: 'سند',
          key: 'bool_document',
          type: 'bool',
          required: false
        }
      );
    } else if (String(sub_category_id).startsWith('3')) {
      // پروژه‌های ساختمانی
      features.push(
        {
          id: 'project1',
          name: 'درصد سود مالک',
          key: 'text_owner_profit_percentage',
          type: 'text',
          required: true
        },
        {
          id: 'project2',
          name: 'درصد سود سازنده',
          key: 'text_producer_profit_percentage',
          type: 'text',
          required: true
        },
        {
          id: 'project3',
          name: 'متراژ زمین',
          key: 'text_land_area',
          type: 'text',
          required: true
        },
        {
          id: 'project4',
          name: 'پروانه ساخت',
          key: 'bool_building_permit',
          type: 'bool',
          required: false
        }
      );
    }
    
    // اضافه کردن ویژگی‌های خاص برای زیردسته‌بندی‌های خاص
    if (sub_category_id === '1-2' || sub_category_id === '2-2') {
      // ویژگی‌های اضافی برای خانه و ویلا
      features.push(
        {
          id: 'villa1',
          name: 'متراژ حیاط',
          key: 'text_yard_area',
          type: 'text',
          required: false
        },
        {
          id: 'villa2',
          name: 'تعداد طبقات',
          key: 'text_floors_count',
          type: 'text',
          required: false
        }
      );
    } else if (sub_category_id === '1-3' || sub_category_id === '2-4') {
      // ویژگی‌های اضافی برای دفتر کار و تجاری
      features.push(
        {
          id: 'office1',
          name: 'تعداد اتاق اداری',
          key: 'text_office_room_count',
          type: 'text',
          required: false
        },
        {
          id: 'office2',
          name: 'نوع کاربری',
          key: 'text_usage_type',
          type: 'choice',
          required: false,
          value: [
            { id: 'office', value: 'دفتر کار' },
            { id: 'shop', value: 'مغازه' },
            { id: 'restaurant', value: 'رستوران' },
            { id: 'other', value: 'سایر' }
          ]
        }
      );
    } else if (sub_category_id === '2-3') {
      // ویژگی‌های اضافی برای زمین و کلنگی
      features.push(
        {
          id: 'land1',
          name: 'متراژ بر زمین',
          key: 'text_frontage',
          type: 'text',
          required: false
        },
        {
          id: 'land2',
          name: 'کاربری زمین',
          key: 'text_land_type',
          type: 'choice',
          required: false,
          value: [
            { id: 'residential', value: 'مسکونی' },
            { id: 'commercial', value: 'تجاری' },
            { id: 'agricultural', value: 'کشاورزی' },
            { id: 'industrial', value: 'صنعتی' },
            { id: 'mixed', value: 'مختلط' }
          ]
        }
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        features: features
      })
    );
  }),
  
  // Handler for adding new advertisement
  rest.post('/api/advertisements', async (req, res, ctx) => {
    const adData = await req.json();
    
    // ساخت یک شناسه منحصر به فرد برای آگهی جدید
    const newAdId = `mock-ad-${Date.now()}`;
    
    // ساخت آگهی جدید با اطلاعات ارسال شده
    const newAd = {
      id: newAdId,
      status: 2, // وضعیت "در انتظار تایید"
      title: adData.title,
      full_address: adData.full_address,
      highlight_attributes: adData.attributes?.filter(attr => attr.type === 'text').slice(0, 3).map(attr => ({
        ...attr,
        icon: '/static/ads/grid-2.png',
        image: '/static/ads/grid-2.png'
      })),
      attributes: adData.attributes,
      price: adData.price,
      category: adData.category_id ? {
        id: adData.category_id,
        name: 'دسته‌بندی نمونه'
      } : {
        id: '1-1',
        name: 'رهن و اجاره آپارتمان'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expiry_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      primary_image: adData.images?.[0]?.url || '/static/ads/pic1.jpg',
      images: adData.images || [
        {
          url: '/static/ads/pic1.jpg',
          is_primary: true,
          order: 1,
          width: 800,
          height: 600,
          alt_text: adData.title || 'تصویر آگهی'
        }
      ],
      user: {
        id: 'user-123',
        phone_number: adData.phone_number_owner_building || '09121234567',
        full_name: 'کاربر آزمایشی',
        user_type: 2
      },
      statistics: {
        views: 0,
        favorites: 0,
        inquiries: 0,
        shares: 0,
        last_viewed_at: null
      },
      description: adData.description || 'توضیحات آگهی'
    };
    
    // اضافه کردن آگهی جدید به لیست آگهی‌ها
    mockHousing.unshift(newAd);
    
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: newAd,
        message: 'آگهی با موفقیت ثبت شد و در انتظار تایید است.'
      })
    );
  }),
  
  // Handler for updating an advertisement
  rest.put('/api/advertisements/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const updatedData = await req.json();
    
    // یافتن آگهی موجود
    const adIndex = mockHousing.findIndex(ad => ad.id === id);
    
    if (adIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'آگهی یافت نشد'
        })
      );
    }
    
    // به روز رسانی اطلاعات آگهی
    const updatedAd = {
      ...mockHousing[adIndex],
      title: updatedData.title || mockHousing[adIndex].title,
      full_address: updatedData.full_address || mockHousing[adIndex].full_address,
      attributes: updatedData.attributes || mockHousing[adIndex].attributes,
      highlight_attributes: updatedData.attributes?.filter(attr => attr.type === 'text').slice(0, 3).map(attr => ({
        ...attr,
        icon: '/static/ads/grid-2.png',
        image: '/static/ads/grid-2.png'
      })) || mockHousing[adIndex].highlight_attributes,
      price: updatedData.price || mockHousing[adIndex].price,
      description: updatedData.description || mockHousing[adIndex].description,
      updated_at: new Date().toISOString(),
      images: updatedData.images || mockHousing[adIndex].images,
      primary_image: updatedData.images?.[0]?.url || mockHousing[adIndex].primary_image,
    };
    
    // جایگزینی آگهی قدیمی با آگهی به روز شده
    mockHousing[adIndex] = updatedAd;
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: updatedAd,
        message: 'آگهی با موفقیت به روزرسانی شد'
      })
    );
  }),
  
  // Handler for getting user's favorite advertisements
  rest.get('/api/advertisements/favorites', (req, res, ctx) => {
    // استفاده از کاربر پیش‌فرض
    const userId = 'user-123'
    
    // دریافت آیدی آگهی‌های مورد علاقه کاربر
    const favoriteAdIds = getUserFavorites(userId)
    
    // دریافت آگهی‌های مورد علاقه کاربر
    const favoriteAds = mockHousing.filter(ad => favoriteAdIds.includes(ad.id))
    
    // پارامترهای صفحه‌بندی
    const page = parseInt(req.url.searchParams.get('page') || '1')
    const limit = parseInt(req.url.searchParams.get('limit') || '10')
    
    // صفحه‌بندی نتایج
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedAds = favoriteAds.slice(startIndex, endIndex)
    
    // پاسخ API به شکل مورد انتظار کامپوننت (items در سطح اول)
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        items: paginatedAds.map(ad => ({
          ...ad,
          isFavorite: true // همه آگهی‌ها در این لیست مورد علاقه هستند
        })),
        total: favoriteAds.length,
        page,
        limit,
        totalPages: Math.ceil(favoriteAds.length / limit)
      })
    )
  }),
  
  // Handler for adding advertisement to favorites (toggle functionality)
  rest.post('/api/advertisements/:id/favorite', (req, res, ctx) => {
    const { id } = req.params
    const userId = 'user-123' // استفاده از کاربر پیش‌فرض
    
    // بررسی وجود آگهی
    const ad = mockHousing.find(ad => ad.id === id)
    if (!ad) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'آگهی یافت نشد'
        })
      )
    }
    
    let message = '';
    let action = '';
    
    // رفتار toggle: اگر در علاقه‌مندی‌ها باشد، حذف کن؛ در غیر این صورت اضافه کن
    if (isFavorite(userId, id as string)) {
      // حذف از لیست علاقه‌مندی‌ها
      const index = favoritesData.findIndex(item => item.userId === userId && item.adId === id as string);
      if (index !== -1) {
        favoritesData.splice(index, 1);
      }
      message = 'آگهی از لیست علاقه‌مندی‌ها حذف شد';
      action = 'remove';
    } else {
      // اضافه کردن به لیست علاقه‌مندی‌ها
      favoritesData.push({ userId, adId: id as string });
      message = 'آگهی به لیست علاقه‌مندی‌ها اضافه شد';
      action = 'add';
    }
    
    // بروزرسانی آمار علاقه‌مندی‌ها در صورت وجود
    if (ad.statistics) {
      ad.statistics.favorites = action === 'add' ? 
        (ad.statistics.favorites || 0) + 1 : 
        Math.max((ad.statistics.favorites || 0) - 1, 0);
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: message,
        isFavorite: action === 'add',
        action: action
      })
    )
  }),
  
  // همان عملکرد را در هندلر اضافه کردن با رفتار toggle پیاده‌سازی کردیم
  // برای حفظ سازگاری با API، این هندلر را نگه می‌داریم اما همان عملکرد قبلی را اجرا می‌کند
  rest.delete('/api/advertisements/:id/favorite', (req, res, ctx) => {
    const { id } = req.params
    const userId = 'user-123' // استفاده از کاربر پیش‌فرض
    
    // حذف از لیست علاقه‌مندی‌ها
    const index = favoritesData.findIndex(item => item.userId === userId && item.adId === id)
    if (index !== -1) {
      favoritesData.splice(index, 1)
    }
    
    // بروزرسانی آمار علاقه‌مندی‌ها
    const ad = mockHousing.find(ad => ad.id === id)
    if (ad && ad.statistics) {
      ad.statistics.favorites = Math.max((ad.statistics.favorites || 0) - 1, 0)
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'آگهی از لیست علاقه‌مندی‌ها حذف شد',
        isFavorite: false,
        action: 'remove'
      })
    )
  }),
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
