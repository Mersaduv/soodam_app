import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'

type QueryParams = Record<string, string | number | boolean | undefined | null | string[]>

export function useFilters() {
  const router = useRouter()
  const { pathname, query } = router

  const cleanQueryValue = useCallback((value: any): string | undefined => {
    if (Array.isArray(value)) return value[0]
    if (value === undefined || value === null || value === '' || value === 'undefined') {
      return undefined
    }
    return String(value)
  }, [])

  const updateFilters = useCallback(
    (newFilters: QueryParams) => {
      const cleanedNewFilters = Object.fromEntries(
        Object.entries(newFilters).map(([key, value]) => [
          key,
          Array.isArray(value) ? value[0] : value
        ])
      )

      const mergedQuery = {
        ...query,
        ...cleanedNewFilters,
        page: 1
      }

      const cleanedQuery = Object.fromEntries(
        Object.entries(mergedQuery)
          .map(([key, value]) => [key, cleanQueryValue(value)])
          .filter(([_, value]) => value !== undefined) // فقط undefined حذف می‌شه، چون cleanQueryValue خالی‌ها رو به undefined تبدیل می‌کنه
      ) as ParsedUrlQuery

      router.replace(
        { pathname, query: cleanedQuery },
        undefined,
        { shallow: true, scroll: false }
      )
    },
    [pathname, query, router, cleanQueryValue]
  )

  return {
    filters: query,
    updateFilters
  }
}