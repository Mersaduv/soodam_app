import { IRAN_PROVINCES } from './constants'
import jalaali from 'jalaali-js'
export function formatNumber(n: number): string {
  if (n) {
    const newNumber = n.toString()
    return newNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  return ''
}

export function makeSlug(titleStr: string) {
  titleStr = titleStr.replace(/^\s+|\s+$/g, '')
  titleStr = titleStr.toLowerCase()
  // persian support
  titleStr = titleStr
    .replace(/[^a-z0-9_\s-ءاأإآؤئبتثجحخدذرزسشصضطظعغفقكلمنهويةى]#u/, '')
    // Collapse whitespace and replace by -
    .replace(/\s+/g, '-')
    // Replace slashes with spaces
    .replace(/\//g, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, '-')
    // Collapse dashes
    .replace(/-+/g, '-')

  return titleStr
}

export function truncate(str: string = '', len: number) {
  if (str.length > len && str.length > 0) {
    let newStr = `${str} `
    newStr = str.substring(0, len)
    newStr = str.substring(0, newStr.lastIndexOf(' '))
    newStr = newStr.length > 0 ? newStr : str.substring(0, len)
    return `${newStr}...`
  }
  return str
}

export const formatPrice = (price: number): string => {
  if (price >= 1_000_000_000) {
    return (price / 1_000_000_000).toFixed(3)
  } else if (price >= 1_000_000) {
    return (price / 1_000_000).toFixed(0)
  } else {
    return price.toString()
  }
}

export const formatPriceWithSuffix = (price: number): string => {
  if (price >= 1_000_000_000) {
    return `${(price / 1_000_000_000).toFixed(3)} میلیارد`
  } else if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(0)} میلیون`
  } else {
    return `${price.toLocaleString()} تومان`
  }
}

export const timeAgo = (dateString: string, format?: boolean): string => {
  const now = new Date()
  const createdDate = new Date(dateString)

  if (format) {
    const [datePart, timePartWithZone] = dateString.split(' ')
    const [jy, jm, jd] = datePart.split('-').map(Number)
  
    const timePart = timePartWithZone.split('-')[0] // فقط ساعت بدون timezone
    const [hh, mm, ss] = timePart.split(':').map(Number)
  
    // تبدیل شمسی به میلادی
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd)
  
    // ساخت تاریخ UTC از تاریخ میلادی (توجه: با توجه به منطقه زمانی -0400 باید 4 ساعت اضافه کنیم)
    const targetDateUTC = new Date(Date.UTC(gy, gm - 1, gd, hh + 4, mm, ss))
  
    const now = new Date()
  
    const diffMs = now.getTime() - targetDateUTC.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)
  
    if (diffMs < 0) return 'در آینده'
    if (diffSeconds < 60) return 'چند لحظه پیش'
    if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`
    if (diffHours < 24) return `${diffHours} ساعت پیش`
    if (diffDays < 30) return `${diffDays} روز پیش`
    if (diffMonths < 12) return `${diffMonths} ماه پیش`
    return `${diffYears} سال پیش`
  } else {
    // For past dates
    const diffInMilliseconds = now.getTime() - createdDate.getTime()
    const diffInMinutes = Math.floor(diffInMilliseconds / 60000)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    const diffInMonths = Math.floor(diffInDays / 30)
    const diffInYears = Math.floor(diffInDays / 365)

    if (diffInMinutes < 60) return 'دقایقی پیش'
    if (diffInHours < 24) return 'ساعاتی پیش'
    if (diffInDays < 30) return `${diffInDays} روز پیش`
    if (diffInMonths < 12) return `${diffInMonths} ماه پیش`
    return `${diffInYears} سال پیش`
  }
}

export const getProvinceFromCoordinates = (lat: number, lng: number) => {
  const province = IRAN_PROVINCES.find((province) => {
    const { bounds } = province
    return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng
  })
  return province ? province.name : 'نامشخص'
}

export const formatPriceLoc = (price: number): string => {
  if (price >= 1_000_000_000) {
    return `${(price / 1_000_000_000).toFixed(3)} میلیارد تومان`
  } else if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(0)} میلیون تومان`
  } else {
    return `${price.toLocaleString('en-US')} تومان`
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
