import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { Housing } from '@/types'
import { useEffect, useState } from 'react'
import { useGetHousingQuery } from '@/services'
import { ArchiveTickIcon, ArrowLeftIcon, HeartWithSlashFavIcon, LocationSmIcon, TrashGrayIcon } from '@/icons'
import { HousingCard } from '@/components/housing'
import { DataStateDisplay } from '@/components/shared'
import { HousingSkeleton } from '@/components/skeleton'
import { EmptyCustomList } from '@/components/emptyList'
import { Button } from '@/components/ui'
import { clearSavedHouses, setMapMode } from '@/store'
import { useAddFavoriteMutation, useGetFavoritesQuery } from '@/services/productionBaseApi'
import { formatPriceLoc } from '@/utils'
import Image from 'next/image'
import { PaginationMetadata } from '@/types'

// Define a type for the favorites pagination response structure
interface FavoritesPaginationMetadata {
  total: number
  page: number
  limit: number
  pages: number
  has_next: boolean
  has_prev: boolean
  filters: Record<string, any>
  sort: {
    field: string
    order: string
  }
}

const LeafletMap = dynamic(() => import('@/components/map/Map'), { ssr: false })
const Lists: NextPage = () => {
  // ? Assets
  const { savedHouses } = useAppSelector((state) => state.saveHouse)
  const { query, events, push } = useRouter()
  const map = useAppSelector((state) => state.map)
  const { housingMap } = useAppSelector((state) => state.statesData)
  const [saveHousingData, setSaveHousingData] = useState<Housing[]>([])
  const dispatch = useAppDispatch()
  const [addFavorite, { isLoading: isAddingFavorite, isSuccess: isAddedFavorite }] = useAddFavoriteMutation()
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(2)
  const [paginationMeta, setPaginationMeta] = useState<FavoritesPaginationMetadata | null>(null)
  const [isPaginationLoading, setIsPaginationLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const { data: favoritesData, isFetching: isFetchingFavorites } = useGetFavoritesQuery({
    page: currentPage,
    limit: pageSize,
  }, {
    refetchOnMountOrArgChange: true
  })

  useEffect(() => {
    if (favoritesData) {
      // Extract pagination metadata from favoritesData
      const { items, ...metadata } = favoritesData
      setPaginationMeta(metadata as FavoritesPaginationMetadata)
      setIsPaginationLoading(false)
      setInitialLoading(false)
    }
  }, [favoritesData])

  const handleHousingCardClick = (housing: Housing) => {
    push(`/housing/${housing.id}`)
  }

  const handleUnAddFavoriteClick = (event: React.MouseEvent<HTMLDivElement>, housing: Housing) => {
    event.preventDefault()
    event.stopPropagation()
    addFavorite({ id: housing.id })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setIsPaginationLoading(true)
    setCurrentPage(page)
  }

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setIsPaginationLoading(true)
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }
  console.log(favoritesData, 'favoritesData')

  // Only show loading skeleton on initial load, not during refetching after unfavorite action
  if (initialLoading)
    return (
      <div className="p-10">
        <HousingSkeleton />
      </div>
    )
  // ? Render(s)
  return (
    <>
      <ClientLayout title={`آگهی های مورد علاقه`}>
        {favoritesData?.items.length > 0 ? (
          <main className="py-[87px] relative">
            <div className="px-4 space-y-4">
              {favoritesData &&
                favoritesData?.items.length > 0 &&
                [...favoritesData?.items]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((housing) => {
                    return (
                      <div
                        key={housing.id}
                        className="bg-white rounded-lg p-4 pb-3 shadow w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col">
                          <Link href={`/housing/${housing.id}`} className="flex gap-2">
                            {housing.primary_image ? (
                              <div className=" bg-gray-200 rounded-[10px] mb-4">
                                <Image
                                  width={104}
                                  height={100}
                                  className="rounded-[10px] h-[104px] object-cover"
                                  src={`${
                                    housing.primary_image.startsWith('/')
                                      ? housing.primary_image
                                      : `/${housing.primary_image}`
                                  }`}
                                  alt={housing.title}
                                />
                              </div>
                            ) : (
                              <div className=" bg-gray-200 rounded-[10px] mb-4">
                                <img
                                  width={104}
                                  height={100}
                                  className="rounded-[10px] h-[104px] object-cover"
                                  src="/static/R.png"
                                  alt={housing.title}
                                />
                              </div>
                            )}
                            <div className="flex-1 flex flex-col">
                              <div className="flex justify-between">
                                <div className="flex items-center gap-1.5">
                                  <LocationSmIcon width="16px" height="16px" />
                                  <div className="text-xs font-normal">
                                    {housing.full_address && housing.full_address.province
                                      ? typeof housing.full_address.province === 'object' &&
                                        housing.full_address.province !== null
                                        ? (housing.full_address.province as { name: string }).name
                                        : String(housing.full_address.province)
                                      : 'نامشخص'}
                                  </div>
                                </div>
                                <div
                                  className={`cursor-pointer ${isAddingFavorite ? 'opacity-50' : ''}`}
                                  onClick={(event) => handleUnAddFavoriteClick(event, housing)}
                                >
                                  <HeartWithSlashFavIcon width="16px" height="16px" />
                                </div>
                              </div>

                              <div className="line-clamp-1 overflow-hidden text-ellipsis text-base font-normal mt-1">
                                {housing.title}
                              </div>
                              <div className="mt-2 space-y-2">
                                {/* نمایش قیمت */}
                                {housing.price && (
                                  <>
                                    {housing.price.deposit > 0 && (
                                      <div className="text-xs flex gap-1 text-[#5A5A5A] font-normal">
                                        رهن:{' '}
                                        <div className="font-normal">
                                          {formatPriceLoc(Number(housing.price.deposit))}
                                        </div>
                                      </div>
                                    )}
                                    {housing.price.rent > 0 && (
                                      <div className="text-xs flex gap-1 text-[#5A5A5A] font-normal">
                                        اجاره:{' '}
                                        <div className="font-normal">{formatPriceLoc(Number(housing.price.rent))}</div>
                                      </div>
                                    )}
                                    {housing.price.amount > 0 && (
                                      <div className="text-xs flex gap-1 text-[#5A5A5A] font-normal">
                                        قیمت فروش:{' '}
                                        <div className="font-normal">
                                          {formatPriceLoc(Number(housing.price.amount))}
                                        </div>
                                      </div>
                                    )}
                                    {housing.price.discount_amount > 0 && (
                                      <div className="text-xs flex gap-1 text-[#5A5A5A] font-normal">
                                        تخفیف:{' '}
                                        <div className="font-normal">
                                          {formatPriceLoc(Number(housing.price.discount_amount))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* نمایش درصد سود مالک و سازنده */}
                                {housing.attributes &&
                                  housing.attributes
                                    .filter(
                                      (item) =>
                                        item.key === 'text_owner_profit_percentage' ||
                                        item.key === 'text_producer_profit_percentage'
                                    )
                                    .map((item) => {
                                      return (
                                        <div key={item.key} className="text-[13px] space-y-1">
                                          {item.key === 'text_owner_profit_percentage' && (
                                            <p className="text-[#5A5A5A]">سود مالک: {item.value as string}%</p>
                                          )}
                                          {item.key === 'text_producer_profit_percentage' && (
                                            <p className="text-[#5A5A5A]">سود سازنده: {item.value as string}%</p>
                                          )}
                                        </div>
                                      )
                                    })}
                              </div>
                            </div>
                          </Link>

                          <div className="w-full text-right text-[#7A7A7A] text-sm flex justify-start gap-6">
                            {housing.highlight_attributes &&
                              housing.highlight_attributes.length > 0 &&
                              housing.highlight_attributes.map((feature) => {
                                return (
                                  <div
                                    key={feature.id}
                                    className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap"
                                  >
                                    {' '}
                                    <img className="w-[16px]" src={feature.icon} alt="" />{' '}
                                    {typeof feature.value === 'object' ? feature.value.value : feature.value}{' '}
                                    <span className="font-medium text-[#7A7A7A] text-xs">{feature.name}</span>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
            </div>

            {/* Pagination loading indicator */}
            {isPaginationLoading && (
              <div className="mt-4 flex justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-[#2C3E50] rounded-full animate-spin"></div>
              </div>
            )}

            {/* Add pagination controls */}
            {paginationMeta && paginationMeta.pages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!paginationMeta.has_prev}
                    className={`px-3 py-1 rounded-md ${
                      !paginationMeta.has_prev
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-[#2C3E50] text-white hover:bg-[#22303e]'
                    }`}
                  >
                    قبلی
                  </button>

                  <div className="flex gap-2">
                    {(() => {
                      const pageNumbers = []
                      const maxVisiblePages = 3 // Reduced number of visible pages

                      if (paginationMeta.pages <= maxVisiblePages) {
                        // Show all pages if total pages are less than or equal to maxVisiblePages
                        for (let i = 1; i <= paginationMeta.pages; i++) {
                          pageNumbers.push(i)
                        }
                      } else {
                        // Always show first page
                        pageNumbers.push(1)

                        // If current page is not first or last
                        if (currentPage > 1 && currentPage < paginationMeta.pages) {
                          // Add ellipsis after first page if needed
                          if (currentPage > 2) {
                            pageNumbers.push('...')
                          }

                          // Add current page
                          pageNumbers.push(currentPage)

                          // Add ellipsis before last page if needed
                          if (currentPage < paginationMeta.pages - 1) {
                            pageNumbers.push('...')
                          }
                        } else if (currentPage === 1 && paginationMeta.pages > 2) {
                          // If on first page, show page 2 and ellipsis
                          pageNumbers.push(2)
                          pageNumbers.push('...')
                        } else if (currentPage === paginationMeta.pages && paginationMeta.pages > 2) {
                          // If on last page, show ellipsis and second-to-last page
                          pageNumbers.push('...')
                          pageNumbers.push(paginationMeta.pages - 1)
                        }

                        // Always show last page
                        pageNumbers.push(paginationMeta.pages)
                      }

                      return pageNumbers.map((page, index) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-3 py-1">
                              ...
                            </span>
                          )
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-md ${
                              currentPage === page
                                ? 'bg-[#2C3E50] text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })
                    })()}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!paginationMeta.has_next}
                    className={`px-3 py-1 rounded-md ${
                      !paginationMeta.has_next
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-[#2C3E50] text-white hover:bg-[#22303e]'
                    }`}
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </main>
        ) : (
          <main className="pt-[87px] relative">
            <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] ">
              <div className="flex justify-center mt-8">
                <img className="w-[180px] h-[180px]" src="/static/Document_empty.png" alt="" />
              </div>
              <div className="mt-8 flex flex-col justify-center items-center gap-2">
                <h1 className="font-medium text-sm">شما تاکنون آگهی اضافه نکرده اید..</h1>
              </div>
              <div className="mx-4 mt-8 mb-7 flex gap-3">
                <Button
                  onClick={() => {
                    push('/')
                    dispatch(setMapMode(true))
                  }}
                  className="w-full rounded-[10px] font-bold text-sm"
                >
                  دیدن آگهی ها
                </Button>
              </div>
            </div>
          </main>
        )}
      </ClientLayout>
    </>
  )
}

export default Lists
