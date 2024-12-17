import { rest } from 'msw'

const verificationCodes = new Map<string, string>()
const getRandomLocation = (baseLat: number, baseLng: number, offset: number) => {
  const randomLat = baseLat + (Math.random() - 0.5) * offset
  const randomLng = baseLng + (Math.random() - 0.5) * offset
  return { lat: parseFloat(randomLat.toFixed(6)), lng: parseFloat(randomLng.toFixed(6)) }
}

const housing = [
  {
    id: '1',
    title: '۲۰۰ متر، محدوده ونک، بلوار دانش',
    slug: '2200-metr-mohadode-vanak',
    location: getRandomLocation(35.75, 51.41, 0.02),
    address: 'تهران، ونک،خیابان 33',
    bedrooms: 3,
    bathrooms: 2,
    floors: 7,
    onFloor: 2,
    deposit: 600000000,
    rent: 5000000,
    sellingPrice: 0,
    categoryId: '1-1',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    adId: 'A10001',
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
    images: ['/static/ads/Photo.png', '/static/ads/Photo (1).png', '/static/ads/Photo (2).png'],
    cubicMeters: 150,
  },
  {
    id: '2',
    title: '22۰۰ متر، محدوده ونک، بلوار دانش',
    slug: '2200-metr-mohadode-vanak22',
    location: getRandomLocation(35.75, 51.41, 0.02),
    address: 'تهران، ونک،خیابان 33',
    bedrooms: 3,
    bathrooms: 2,
    floors: 2,
    onFloor: 2,
    deposit: 0,
    rent: 0,
    sellingPrice: 10000000000,
    categoryId: '2-1',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
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
    images: ['/static/ads/Photo.png', '/static/ads/Photo (1).png', '/static/ads/Photo (2).png'],
    cubicMeters: 200,
  },
  {
    id: '3',
    title: '33۰۰ متر، محدوده ونک، بلوار دانش',
    slug: '2200-metr-mohadode-vanak333',
    location: getRandomLocation(35.75, 51.41, 0.02),
    address: 'تهران، ونک،خیابان 33',
    bedrooms: 3,
    bathrooms: 2,
    floors: 6,
    onFloor: 2,
    deposit: 600000000,
    rent: 5000000,
    sellingPrice: 0,
    categoryId: '1-1',
    created: '2024-12-07T09:21:45.625Z',
    updated: '2024-12-07T09:21:45.625Z',
    adId: 'A10003',
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
    images: ['/static/ads/Photo.png', '/static/ads/Photo (1).png', '/static/ads/Photo (2).png'],
    cubicMeters: 250,
  },
  {
    id: '4',
    title: '44۰۰ متر، محدوده ونک، بلوار دانش',
    slug: '2200-metr-mohadode-vanak4444',
    location: getRandomLocation(35.75, 51.41, 0.02),
    address: 'تهران، ونک،خیابان 33',
    bedrooms: 3,
    bathrooms: 2,
    floors: 4,
    onFloor: 2,
    deposit: 600000000,
    rent: 5000000,
    sellingPrice: 0,
    categoryId: '1-1',
    created: '2024-12-07T09:21:45.625Z',
    updated: '2024-12-07T09:21:45.625Z',
    adId: 'A10004',
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
    images: ['/static/ads/Photo.png', '/static/ads/Photo (1).png', '/static/ads/Photo (2).png'],
    cubicMeters: 300,
  },
]

const categories = [
  {
    id: '1',
    name: 'اجاره مسکونی',
    children: [
      { id: '1-1', name: 'اجاره آپارتمان' },
      { id: '1-2', name: 'اجاره خانه و ویلا' },
    ],
    imageUrl: '/category/house.png',
  },
  {
    id: '2',
    name: 'خرید مسکونی',
    children: [
      { id: '2-1', name: 'خرید آپارتمان' },
      { id: '2-2', name: 'خرید خانه و ویلا' },
    ],
    imageUrl: '/category/house.png',
  },
  {
    id: '3',
    name: 'خرید دفاتر اداری و تجاری',
    children: [],
    imageUrl: '/category/buildings.png',
  },
  {
    id: '4',
    name: 'اجاره دفاتر اداری و تجاری',
    children: [],
    imageUrl: '/category/buildings.png',
  },
  {
    id: '5',
    name: 'پروژه‌های ساخت و ساز',
    children: [],
    imageUrl: '/category/tr.png',
  },
  {
    id: '6',
    name: 'اجاره کوتاه مدت',
    children: [],
    imageUrl: '/category/buliding.png',
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

  rest.get('/api/all-housing', (req, res, ctx) => {
    const searchParams = req.url.searchParams
    const title = searchParams.get('title')
    const type = searchParams.get('type')

    let filteredHousing = [...housing]

    if (title) {
      filteredHousing = filteredHousing.filter((item) => item.title.toLowerCase().includes(title.toLowerCase()))
    }

    if (type === 'rent') {
      filteredHousing = filteredHousing.filter((item) => item.deposit > 0 || item.rent > 0)
    } else if (type === 'sale') {
      filteredHousing = filteredHousing.filter((item) => item.sellingPrice && item.sellingPrice > 0)
    }

    return res(ctx.status(200), ctx.json({ message: 'Success', data: filteredHousing }))
  }),

  rest.get('/api/housing/:slug', (req, res, ctx) => {
    const { slug } = req.params;

    // داده‌های شبیه‌سازی شده
    const mockedData = {
      slug,
      title: 'Mocked Housing Title',
      description: 'This is a mocked description.',
    };

    return res(
      ctx.status(200),
      ctx.json(mockedData)
    );
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
]
