export function formatNumber(n: number): string {
  if (n) {
    const newNumber =  n.toString();
    return newNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',') 
  }
  return '';
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

export const formatPriceWithSuffix  = (price: number): string => {
  if (price >= 1_000_000_000) {
    return `${(price / 1_000_000_000).toFixed(3)} میلیارد`;
  } else if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(0)} میلیون`;
  } else {
    return `${price.toLocaleString()} تومان`;
  }
}

export const timeAgo = (dateString: string): string => {
  const now = new Date();
  const createdDate = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - createdDate.getTime()) / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInMinutes < 60) return "دقایقی پیش";
  if (diffInHours < 24) return "ساعاتی پیش";
  if (diffInDays < 30) return `${diffInDays} روز پیش`;
  if (diffInMonths < 12) return `${diffInMonths} ماه پیش`;
  
  return `${diffInYears} سال پیش`;
};