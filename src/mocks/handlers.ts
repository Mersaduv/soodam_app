import { rest } from 'msw'

const verificationCodes = new Map<string, string>()
const realEstateListings = [
  {
    id: '1',
    title: '۲۰۰ متر، محدوده ونک، بلوار دانش',
    location: 'تهران، ونک،',
    bedrooms: 3,
    bathrooms: 2,
    floors: 3,
    onFloor: 2,
    deposit: 600000000,
    rent: 5000000,
    created: '2024-12-07T09:21:45.625Z',
    updated: '2024-12-07T09:21:45.625Z',
    adId: 'A10002',
    parking: 1,
    warehouse: 1,
    elevator: 1,
    floorMaterial: 'سرامیک',
    bathroomType: 'فرنگی',
    coolingSystem: 'چیلر',
    heatingSystem: 'رادیاتور',
    homeAge: 'نوساز',
    geographicalLocation: 'شمالی',
    documentType: 'شخصی',
    securityFeatures: ' آیفون تصویری، درب ضدسرقت',
    otherFacilities: 'کمد دیوری، پنجره‌ها UPVC',
    visitingTime: '۷ صبح تا ۱۱ شب',
    views: 21,
    save: 0,
    images: ['/static/ads/Photo.jpg', '/static/ads/Photo (1).jpg','/static/ads/Photo (2).jpg'],
  }, 
  {
    id: '2',
    title: 'ویلای ساحلی در شمال',
    location: 'مازندران، متل قو',
    price: 15000000000,
    bedrooms: 4,
    bathrooms: 3,
    area: 300,
    description: 'ویلا با ویو دریا و استخر اختصاصی.',
    images: ['villa1.jpg', 'villa2.jpg'],
  },
]

export const handlers = [
  rest.post('/api/auth/send-code', async (req, res, ctx) => {
    const { phoneNumber } = await req.json<{ phoneNumber: string }>()

    if (!/^09[0-9]{9}$/.test(phoneNumber)) {
      return res(ctx.status(400), ctx.json({ message: 'شماره موبایل نامعتبر است' }))
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
    verificationCodes.set(phoneNumber, randomCode)
    console.log(verificationCodes, 'verificationCodes')
    return res(ctx.status(200), ctx.json({ message: 'کد تایید ارسال شد', code: randomCode }))
  }),

  rest.post('/api/auth/verify-code', async (req, res, ctx) => {
    const { code, phoneNumber, role } = await req.json<{ code: string; phoneNumber: string; role: string }>()

    const storedCode = verificationCodes.get(phoneNumber)
    console.log(verificationCodes, 'verificationCodes-storedCode', phoneNumber, 'phoneNumber')

    if (!storedCode) {
      return res(ctx.status(401), ctx.json({ message: 'کد تایید منقضی شده است' }))
    }

    if (code !== storedCode) {
      return res(ctx.status(401), ctx.json({ message: 'کد تایید نادرست می‌باشد!', phoneNumber }))
    }

    verificationCodes.clear()

    return res(ctx.status(200), ctx.json({ message: 'ورود موفقیت‌آمیز بود', phoneNumber, role }))
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'خروج با موفقیت انجام شد' }))
  }),

  rest.get('/api/real-estate', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(realEstateListings))
  }),
  
]
