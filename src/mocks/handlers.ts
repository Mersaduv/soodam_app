import { Feature,Category } from '@/types'
import { rest } from 'msw'

const verificationCodes = new Map<string, string>()
const getRandomLocation = (baseLat: number, baseLng: number, offset: number) => {
  const randomLat = baseLat + (Math.random() - 0.5) * offset
  const randomLng = baseLng + (Math.random() - 0.5) * offset
  return { lat: parseFloat(randomLat.toFixed(6)), lng: parseFloat(randomLng.toFixed(6)) }
}
function getFeaturesByCategory(categoryId: string): Feature[] {
  const categoryFeatures: Set<string> = new Set();

  // تابع بازگشتی برای جمع‌آوری ویژگی‌ها
  const collectFeatures = (category: Category | undefined): void => {
    if (!category) return;

    // اضافه کردن ویژگی‌های مرتبط با دسته‌بندی فعلی
    featureCategories
      .filter(fc => fc.categoryId === category.id)
      .forEach(fc => categoryFeatures.add(fc.featureId));

    // بازگشتی برای فرزندان
    if (category.children) {
      category.children.forEach(collectFeatures);
    }
  };

  // پیدا کردن دسته‌بندی سطح بالا
  const rootCategory = categories.find(cat => cat.id === categoryId);
  collectFeatures(rootCategory);

  // پیدا کردن و برگرداندن ویژگی‌ها
  return features.filter(feature => categoryFeatures.has(feature.id));
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
    cooligSystem: 'چیلر',
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
    deposit: 1600000000,
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
    id: "1",
    name: "اجاره مسکونی",
    children: [
      { id: "1-1", name: "اجاره آپارتمان", parentCategory: { id: "1", name: "اجاره مسکونی" } },
      { id: "1-2", name: "اجاره خانه و ویلا", parentCategory: { id: "1", name: "اجاره مسکونی" } },
    ],
    imageUrl: "/category/house.png",
  },
  {
    id: "2",
    name: "خرید مسکونی",
    children: [
      { id: "2-1", name: "خرید آپارتمان", parentCategory: { id: "2", name: "خرید مسکونی" } },
      { id: "2-2", name: "خرید خانه و ویلا", parentCategory: { id: "2", name: "خرید مسکونی" } },
      { id: "2-3", name: "خرید زمین و کلنگی", parentCategory: { id: "2", name: "خرید مسکونی" } },
    ],
    imageUrl: "/category/house.png",
  },
  {
    id: "3",
    name: "خرید دفاتر اداری و تجاری",
    children: [
      { id: "3-1", name: "خرید  دفتر کار، اداری و مطب", parentCategory: { id: "3", name: "خرید دفاتر اداری و تجاری" } },
      { id: "3-2", name: "خرید  مغازه و غرفه", parentCategory: { id: "3", name: "خرید دفاتر اداری و تجاری" } },
      { id: "3-3", name: "خرید  دفاتر صنعتی،کشاورزی و تجاری", parentCategory: { id: "3", name: "خرید دفاتر اداری و تجاری" } },
    ],
    imageUrl: "/category/buildings.png",
  },
  {
    id: "4",
    name: "اجاره دفاتر اداری و تجاری",
    children: [
      { id: "4-1", name: "اجاره دفتر کار ، اداری و مطب", parentCategory: { id: "4", name: "اجاره دفاتر اداری و تجاری" } },
      { id: "4-2", name: "اجاره مغازه و غرفه", parentCategory: { id: "4", name: "اجاره دفاتر اداری و تجاری" } },
      { id: "4-3", name: "اجاره دفاتر صنعتی،کشاورزی و تجاری", parentCategory: { id: "4", name: "اجاره دفاتر اداری و تجاری" } },
    ],
    imageUrl: "/category/buildings.png",
  },
  {
    id: "5",
    name: "پروژه‌های ساخت و ساز",
    children: [
      {
        id: "5-1",
        name: "مشارکت در ساخت املاک",
        parentCategory: { id: "5", name: "پروژه‌های ساخت و ساز" },
        children: [
          { id: "5-1-1", name: "مالک", parentCategory: { id: "5-1", name: "مشارکت در ساخت املاک" } },
          { id: "5-1-2", name: "سازنده", parentCategory: { id: "5-1", name: "مشارکت در ساخت املاک" } },
        ],
      },
      { id: "5-2", name: "پیش خرید", parentCategory: { id: "5", name: "پروژه‌های ساخت و ساز" } },
    ],
    imageUrl: "/category/tr.png",
  },
  {
    id: "6",
    name: "اجاره کوتاه مدت",
    children: [
      { id: "6-1", name: "اجاره کوتاه مدت آپارتمان و سوئیت", parentCategory: { id: "6", name: "اجاره کوتاه مدت" } },
      { id: "6-2", name: "اجاره کوتاه مدت باغ و ویلا", parentCategory: { id: "6", name: "اجاره کوتاه مدت" } },
      { id: "6-3", name: "اجاره کوتاه مدت دفتر کار و فضای آموزشی", parentCategory: { id: "6", name: "اجاره کوتاه مدت" } },
    ],
    imageUrl: "/category/buliding.png",
  },
];

const features = [
  // type empty (newer dates)
  {
    id: "f87ac4d1",
    name: "متراژ",
    placeholder:"مثال : 100 متر",
    type: "",
    values: [],
    created: "2024-03-15T10:30:00Z",
    updated: "2024-06-20T14:45:00Z"
  },
  {
    id: "f87ac4dDsfsd1",
    name: "متراژ نیم طبقه",
    placeholder:"مثال : 100 متر",
    type: "",
    values: [],
    created: "2024-03-10T09:20:00Z",
    updated: "2024-06-15T11:30:00Z"
  },
  {
    id: "b92df63e",
    name: "سال ساخت",
    placeholder:"مثال : 1394 ",
    type: "",
    values: [],
    created: "2024-02-25T08:15:00Z",
    updated: "2024-05-30T16:20:00Z"
  },
  {
    id: "b41ddsFer422224333",
    name: "متراژ بر ملک",
    placeholder:"متراژ بر ملک را وارد کنید",
    type: "",
    values: [],
    created: "2024-02-20T11:45:00Z",
    updated: "2024-05-25T13:10:00Z"
  },
  {
    id: "b41ddsfssafsdse824333",
    name: "متراژ زمین",
    placeholder:"مثال : 100 متر",
    type: "",
    values: [],
    created: "2024-02-15T13:25:00Z",
    updated: "2024-05-20T15:40:00Z"
  },
  {
    id: "f87safe3d1",
    name: "گذر",
    placeholder:"متراژ گذر را تایپ کنید",
    type: "",
    values: [],
    created: "2024-01-30T15:50:00Z",
    updated: "2024-04-25T10:15:00Z"
  },
  {
    id: "2d3acsdf333d1",
    name: "بازسازی شده است.",
    type: "check",
    values: [],
    created: "2024-01-30T15:50:00Z",
    updated: "2024-04-25T10:15:00Z"
  },
  {
    id: "e234csdf3wdd",
    name: "سند",
    type: "check",
    values: [],
    created: "2024-01-30T15:50:00Z",
    updated: "2024-04-25T10:15:00Z"
  },
  
  // type selective (medium dates)
  {
    id: "a51c28f7",
    name: "تعداد اتاق",
    type: "selective",
    values: [
      { id: "c73fa8b4", name: "بدون اتاق" },
      { id: "e15bd9a6", name: "1" },
      { id: "f84cd72e", name: "2" },
      { id: "a29de8f4", name: "3" },
      { id: "d93fa5b8", name: "4" },
      { id: "b64ef27c", name: "5" },
      { id: "f72ce81a", name: "7 اتاق یا بیشتر" }
    ],
    created: "2023-09-25T14:30:00Z",
    updated: "2023-12-20T09:45:00Z"
  },
  {
    id: "e91ab5c7",
    name: "تعداد کل طبقات ساختمان",
    type: "selective",
    values: [
      { id: "c27bd94e", name: "1" },
      { id: "f83ad72b", name: "2" },
      { id: "b51cd83f", name: "3" },
      { id: "e76fa91c", name: "4" },
      { id: "a54bd32f", name: "7 طبقه یا بیشتر" }
    ],
    created: "2023-09-20T13:30:00Z",
    updated: "2023-12-15T10:45:00Z"
  },
  {
    id: "d38fa91b",
    name: "طبقه",
    type: "selective",
    values: [
      { id: "f12ce98d", name: "همکف" },
      { id: "c89ab73f", name: "1" },
      { id: "a34df82b", name: "2" },
      { id: "b71ce64d", name: "3" },
      { id: "e95ad83c", name: "20 طبقه یا بیشتر" }
    ],
    created: "2023-09-15T11:30:00Z",
    updated: "2023-12-10T08:45:00Z"
  },
  {
    id: "d3Dss86y71b",
    name: "نیم طبقه",
    type: "selective",
    values: [
      { id: "c89ab73f", name: "1" },
      { id: "a34df82b", name: "2" },
      { id: "b71ce64d", name: "3" },
    ],
    created: "2023-09-10T10:30:00Z",
    updated: "2023-12-05T15:45:00Z"
  },
  {
    id: "d38fa92p",
    name: "تعداد واحد در طبقه",
    type: "selective",
    values: [
      { id: "f12ce98d", name: "همکف" },
      { id: "c89ab73f", name: "1" },
      { id: "a34df82b", name: "2" },
      { id: "b71ce64d", name: "3" },
      { id: "b71ce64d", name: "4" },
      { id: "b71ce64d", name: "5" },
      { id: "b71ce64d", name: "6" },
      { id: "e95ad83c", name: "20 واحد یا بیشتر" }
    ],
    created: "2023-09-05T09:30:00Z",
    updated: "2023-11-30T14:45:00Z"
  },
  {
    id: "b41fc83a",
    name: "جهت ساختمان",
    type: "selective",
    values: [
      { id: "c57de92a", name: "شمالی" },
      { id: "e34bf71d", name: "جنوبی" },
      { id: "f69ad83c", name: "شرقی" },
      { id: "a23fe61b", name: "غربی" }
    ],
    created: "2023-08-25T08:30:00Z",
    updated: "2023-11-25T13:45:00Z"
  },
  {
    id: "f89cd72e",
    name: "نمای ساختمان",
    type: "selective",
    values: [
      { id: "b52ad74f", name: "سنگ" },
      { id: "c61fb83d", name: "کامپوزیت" },
      { id: "e78cd91b", name: "آجر" }
    ],
    created: "2023-08-20T07:30:00Z",
    updated: "2023-11-20T12:45:00Z"
  },
  {
    id: "b41ddsfs8ue8243wd333",
    name: "وضعیت بر ملک",
    type: "selective",
    values: [
      { id: "c73fasdds8b4", name: "دو نبش" },
      { id: "e15dsfre33339a6", name: "سه نبش" },
      { id: "csdcdssc3", name: "دو کله" },
      { id: "a29sdde333de8f4", name: "تک بر" },
    ],
    created: "2023-08-15T06:30:00Z",
    updated: "2023-11-15T11:45:00Z"
  },

  // type radio (older dates)
  {
    id: "f73bd91c",
    name: "آسانسور",
    type: "radio",
    values: [],
    created: "2023-03-25T08:45:00Z",
    updated: "2023-06-20T13:15:00Z"
  },
  {
    id: "b68ad74e",
    name: "پارکینگ",
    type: "radio",
    values: [],
    created: "2023-03-20T07:45:00Z",
    updated: "2023-06-15T12:15:00Z"
  },
  {
    id: "c97fe82b",
    name: "انباری",
    type: "radio",
    values: [],
    created: "2023-03-15T06:45:00Z",
    updated: "2023-06-10T11:15:00Z"
  },
  {
    id: "e12ad83c",
    name: "بالکن",
    type: "radio",
    values: [],
    created: "2023-03-10T05:45:00Z",
    updated: "2023-06-05T10:15:00Z"
  },
  {
    id: "f84ab71d",
    name: "سیستم خنک کننده",
    type: "radio",
    values: [],
    created: "2023-03-05T04:45:00Z",
    updated: "2023-05-30T09:15:00Z"
  },
  {
    id: "a36cd92e",
    name: "سیستم گرم کننده",
    type: "radio",
    values: [],
    created: "2023-02-28T03:45:00Z",
    updated: "2023-05-25T08:15:00Z"
  },
  {
    id: "c85fe91b",
    name: "آبگرمکن",
    type: "radio",
    values: [],
    created: "2023-02-25T02:45:00Z",
    updated: "2023-05-20T07:15:00Z"
  },
  {
    id: "d93ab82c",
    name: "سرویس بهداشتی (فرنگی)",
    type: "radio",
    values: [],
    created: "2023-02-20T01:45:00Z",
    updated: "2023-05-15T06:15:00Z"
  },
  {
    id: "e45cd73f",
    name: "کابینت (MDF)",
    type: "radio",
    values: [],
    created: "2023-02-15T00:45:00Z",
    updated: "2023-05-10T05:15:00Z"
  },
  {
    id: "f91ab64e",
    name: "روف گاردن (باغچه پشت بام)",
    type: "radio",
    values: [],
    created: "2023-02-10T23:45:00Z",
    updated: "2023-05-05T04:15:00Z"
  },
  {
    id: "a53fe92b",
    name: "استخر",
    type: "radio",
    values: [],
    created: "2023-02-05T22:45:00Z",
    updated: "2023-04-30T03:15:00Z"
  },
  {
    id: "b81ad74c",
    name: "وان و جکوزی (حمام)",
    type: "radio",
    values: [],
    created: "2023-02-01T21:45:00Z",
    updated: "2023-04-25T02:15:00Z"
  },
  {
    id: "b41ad7r9",
    name: "سونا",
    type: "radio",
    values: [],
    created: "2023-01-25T20:45:00Z",
    updated: "2023-04-20T01:15:00Z"
  },
  {
    id: "b41ad0a3",
    name: "لاندری (اتاق لباسشویی)",
    type: "radio",
    values: [],
    created: "2023-01-20T19:45:00Z",
    updated: "2023-04-15T00:15:00Z"
  },
  {
    id: "b4134ffe4333",
    name: "مستر (حمام والدین)",
    type: "radio",
    values: [],
    created: "2023-01-15T18:45:00Z",
    updated: "2023-04-10T23:15:00Z"
  },
  {
    id: "b41dewew9824333",
    name: "کلوزت (اتاق لباس)",
    type: "radio",
    values: [],
    created: "2023-01-10T17:45:00Z",
    updated: "2023-04-05T22:15:00Z"
  },
  {
    id: "b41ddsfs8ue824333",
    name: "بافت فرسوده",
    type: "radio",
    values: [],
    created: "2023-01-05T16:45:00Z",
    updated: "2023-04-01T21:15:00Z"
  }
];

const featureCategories = [
  { featureId: "f87ac4d1", categoryId: "1" },
  { featureId: "b92df63e", categoryId: "1" },
  { featureId: "a51c28f7", categoryId: "1" },
  { featureId: "d38fa92p", categoryId: "1" },
  { featureId: "e91ab5c7", categoryId: "1" },
  { featureId: "d38fa91b", categoryId: "1" },
  { featureId: "f89cd72e", categoryId: "1" },
  { featureId: "f73bd91c", categoryId: "1" },
  { featureId: "b68ad74e", categoryId: "1" },
  { featureId: "c97fe82b", categoryId: "1" },
  { featureId: "e12ad83c", categoryId: "1" },
  { featureId: "f84ab71d", categoryId: "1" },
  { featureId: "a36cd92e", categoryId: "1" },
  { featureId: "c85fe91b", categoryId: "1" },
  { featureId: "d93ab82c", categoryId: "1" },
  { featureId: "2d3acsdf333d1", categoryId: "1" },
  { featureId: "b4134ffe4333", categoryId: "1" },
  { featureId: "b41dewew9824333", categoryId: "1" },
  { featureId: "b41ad0a3", categoryId: "1" },
  { featureId: "f91ab64e", categoryId: "1" },
  { featureId: "a53fe92b", categoryId: "1" },
  { featureId: "b81ad74c", categoryId: "1" },
  { featureId: "b41ad7r9", categoryId: "1" },
  { featureId: "f87ac4d1", categoryId: "1-2" },
  { featureId: "b92df63e", categoryId: "1-2" },
  { featureId: "a51c28f7", categoryId: "1-2" },
  { featureId: "b41fc83a", categoryId: "1-2" },
  { featureId: "f89cd72e", categoryId: "1-2" },
  { featureId: "b68ad74e", categoryId: "1-2" },
  { featureId: "c97fe82b", categoryId: "1-2" },
  { featureId: "e12ad83c", categoryId: "1-2" },
  { featureId: "f84ab71d", categoryId: "1-2" },
  { featureId: "a36cd92e", categoryId: "1-2" },
  { featureId: "c85fe91b", categoryId: "1-2" },
  { featureId: "d93ab82c", categoryId: "1-2" },
  { featureId: "b4134ffe4333", categoryId: "1-2" },
  { featureId: "b41dewew9824333", categoryId: "1-2" },
  { featureId: "b41ad0a3", categoryId: "1-2" },
  { featureId: "f91ab64e", categoryId: "1-2" },
  { featureId: "a53fe92b", categoryId: "1-2" },
  { featureId: "b81ad74c", categoryId: "1-2" },
  { featureId: "b41ad7r9", categoryId: "1-2" },
  { featureId: "b41ddsfssafsdse824333", categoryId: "5" },
  { featureId: "b41ddsfs8ue8243wd333", categoryId: "5" },
  { featureId: "b41ddsFer422224333", categoryId: "5" },
  { featureId: "f87safe3d1", categoryId: "5" },
  { featureId: "b41ddsfs8ue824333", categoryId: "5" },
  { featureId: "f87ac4d1", categoryId: "2-3" },
  { featureId: "b41ddsfs8ue8243wd333", categoryId: "2-3" },
  { featureId: "b41ddsFer422224333", categoryId: "2-3" },
  { featureId: "f87safe3d1", categoryId: "2-3" },
  { featureId: "b41ddsfs8ue824333", categoryId: "2-3" },
  { featureId: "f87ac4d1", categoryId: "2-2" },
  { featureId: "b92df63e", categoryId: "2-2" },
  { featureId: "a51c28f7", categoryId: "2-2" },
  { featureId: "b41fc83a", categoryId: "2-2" },
  { featureId: "c97fe82b", categoryId: "2-2" },
  { featureId: "e12ad83c", categoryId: "2-2" },
  { featureId: "f84ab71d", categoryId: "2-2" },
  { featureId: "a36cd92e", categoryId: "2-2" },
  { featureId: "c85fe91b", categoryId: "2-2" },
  { featureId: "d93ab82c", categoryId: "2-2" },
  { featureId: "b4134ffe4333", categoryId: "2-2" },
  { featureId: "b41dewew9824333", categoryId: "2-2" },
  { featureId: "b41ad0a3", categoryId: "2-2" },
  { featureId: "f91ab64e", categoryId: "2-2" },
  { featureId: "a53fe92b", categoryId: "2-2" },
  { featureId: "b81ad74c", categoryId: "2-2" },
  { featureId: "b41ad7r9", categoryId: "2-2" },
  { featureId: "f87ac4d1", categoryId: "3" },
  { featureId: "b92df63e", categoryId: "3" },
  { featureId: "a51c28f7", categoryId: "3" },
  { featureId: "d38fa92p", categoryId: "3" },
  { featureId: "e91ab5c7", categoryId: "3" },
  { featureId: "d38fa91b", categoryId: "3" },
  { featureId: "f73bd91c", categoryId: "3" },
  { featureId: "b68ad74e", categoryId: "3" },
  { featureId: "c97fe82b", categoryId: "3" },
  { featureId: "f84ab71d", categoryId: "3" },
  { featureId: "a36cd92e", categoryId: "3" },
  { featureId: "c85fe91b", categoryId: "3" },
  { featureId: "e234csdf3wdd", categoryId: "3" },
  { featureId: "f87ac4d1", categoryId: "4" },
  { featureId: "b92df63e", categoryId: "4" },
  { featureId: "a51c28f7", categoryId: "4" },
  { featureId: "d38fa92p", categoryId: "4" },
  { featureId: "e91ab5c7", categoryId: "4" },
  { featureId: "d38fa91b", categoryId: "4" },
  { featureId: "f73bd91c", categoryId: "4" },
  { featureId: "b68ad74e", categoryId: "4" },
  { featureId: "c97fe82b", categoryId: "4" },
  { featureId: "f84ab71d", categoryId: "4" },
  { featureId: "a36cd92e", categoryId: "4" },
  { featureId: "c85fe91b", categoryId: "4" },
  { featureId: "f87ac4d1", categoryId: "3-3" },
  { featureId: "b92df63e", categoryId: "3-3" },
  { featureId: "a51c28f7", categoryId: "3-3" },
  
  { featureId: "f87ac4d1", categoryId: "4-3" },
  { featureId: "b92df63e", categoryId: "4-3" },
  { featureId: "a51c28f7", categoryId: "4-3" },
  
  { featureId: "f87ac4d1", categoryId: "3-2" },
  { featureId: "b92df63e", categoryId: "3-2" },
  { featureId: "a51c28f7", categoryId: "3-2" },
  { featureId: "d3Dss86y71b", categoryId: "3-2" },
  { featureId: "f87ac4dDsfsd1", categoryId: "3-2" },
  { featureId: "d38fa91b", categoryId: "3-2" },
  { featureId: "f73bd91c", categoryId: "3-2" },
  { featureId: "b68ad74e", categoryId: "3-2" },
  { featureId: "c97fe82b", categoryId: "3-2" },
  { featureId: "f84ab71d", categoryId: "3-2" },
  { featureId: "a36cd92e", categoryId: "3-2" },
  { featureId: "c85fe91b", categoryId: "3-2" },

  { featureId: "f87ac4d1", categoryId: "4-2" },
  { featureId: "b92df63e", categoryId: "4-2" },
  { featureId: "a51c28f7", categoryId: "4-2" },
  { featureId: "d3Dss86y71b", categoryId: "4-2" },
  { featureId: "f87ac4dDsfsd1", categoryId: "4-2" },
  { featureId: "d38fa91b", categoryId: "4-2" },
  { featureId: "f73bd91c", categoryId: "4-2" },
  { featureId: "b68ad74e", categoryId: "4-2" },
  { featureId: "c97fe82b", categoryId: "4-2" },
  { featureId: "f84ab71d", categoryId: "4-2" },
  { featureId: "a36cd92e", categoryId: "4-2" },
  { featureId: "c85fe91b", categoryId: "4-2" },

  { featureId: "f87ac4d1", categoryId: "6" },
  { featureId: "a51c28f7", categoryId: "6" },

  { featureId: "f87ac4d1", categoryId: "5-1-1" },
];


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
    const { slug } = req.params

    // داده‌های شبیه‌سازی شده
    const mockedData = {
      slug,
      title: 'Mocked Housing Title',
      description: 'This is a mocked description.',
    }

    return res(ctx.status(200), ctx.json(mockedData))
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

  rest.get('/api/features', (req, res, ctx) => {
    const searchParams = req.url.searchParams
    const name = searchParams.get('name')

    let filtered = [...features]

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

  rest.get('/api/features/by-category/:categoryId', (req, res, ctx) => {
    const { categoryId } = req.params;
    
    const categoryFeatures = getFeaturesByCategory(categoryId as string);
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Success',
        data: categoryFeatures
      })
    );
  }),
]
