import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { setIsShowLogin } from '@/store'
import { CalenderSmIcon, LocationSmIcon, RegisterAdIcon } from '@/icons'
import { useGetRequestsQuery } from '@/services'
import { DataStateDisplay } from '@/components/shared'
import { HousingSkeleton } from '@/components/skeleton'
import { EmptyCustomList } from '@/components/emptyList'
import { HousingCard } from '@/components/housing'
import { formatPriceLoc, getProvinceFromCoordinates } from '@/utils/stringFormatting'
import moment from 'moment-jalaali'
moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' })
const Requests: NextPage = () => {
  // ? Assets
  const { query, events, push } = useRouter()
  const dispatch = useAppDispatch()
  const { role } = useAppSelector((state) => state.auth)

  // ? Queries
  const { data: requestData, isLoading, isFetching, ...requestQueryProps } = useGetRequestsQuery({ status: '2' })

  // ? handlers
  const handleNavigate = (): void => {
    const logged = localStorage.getItem('loggedIn')
    if (role === 'User') {
      dispatch(setIsShowLogin(true))
    } else if (logged === 'true') {
      push('/requests/new')
    } else {
      push({
        pathname: '/authentication/login',
        query: { redirectTo: '/requests/new' },
      })
    }
  }
  // ? Render(s)
  return (
    <>
      <ClientLayout title="درخواست های ثبت شده">
        <main className="pt-[140px] px-4">
          <div className="absolute flex flex-col gap y-2.5 bottom-[88px] left-4 z-10">
            <div
              onClick={handleNavigate}
              className="bg-white hover:bg-gray-50 w-[159px] h-[56px] rounded-[59px] flex-center gap-2 shadow-icon cursor-pointer"
            >
              <RegisterAdIcon width="32px" height="32px" />
              <span className="font-semibold text-[16px] whitespace-nowrap">ثبت درخواست</span>
            </div>
          </div>

          <DataStateDisplay
            {...requestQueryProps}
            isFetching={isFetching}
            dataLength={requestData?.data ? requestData.data.length : 0}
            loadingComponent={<HousingSkeleton />}
            emptyComponent={<EmptyCustomList />}
          >
            {requestData && requestData.data.length > 0 && (
              <section className="space-y-4">
                {requestData.data.map((item) => {
                  const province = getProvinceFromCoordinates(item.location.lat, item.location.lng)
                  return (
                    <div className="bg-white rounded-2xl shadow-request" key={item.id}>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                          <div className="border-2 w-fit rounded-full border-[#D52133]">
                            {item.userInfo.image === null ? (
                              <img
                                className="w-[70px] h-[70px] rounded-full object-contain p-1"
                                src="/static/user.png"
                                alt={item.title}
                              />
                            ) : (
                              <img
                                className="w-[70px] h-[70px] rounded-full object-cover"
                                src={item.userInfo.image}
                                alt={item.title}
                              />
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <h1>{item.userInfo.fullName}</h1>
                            <div className="flex items-center gap-1.5">
                              <LocationSmIcon width="16px" height="16px" />
                              <div className="text-xs font-normal">{province}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <CalenderSmIcon />
                          <div className="text-[#5A5A5A] text-xs font-normal">
                            {moment(item.created).format('jDD jMMMM jYYYY')}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full bg-[#17A586]`} />
                          <div className="text-base font-medium text-[#1A1E25] line-clamp-1 overflow-hidden text-ellipsis">
                            {item.category}،{item.title}
                          </div>
                        </div>

                        <div className="mt-2">
                          {/* نمایش قیمت فروش یا رهن و اجاره */}
                          {item.highlightFeatures.length > 0 &&
                            item.highlightFeatures.map((feature) => (
                              <div className="text-sm farsi-digits text-[#5A5A5A] font-normal flex gap-1">
                                ویژگی: <div className="font-normal "> {feature.title}</div>
                              </div>
                            ))}
                          {item.price > 0 ? (
                            <div className="text-sm farsi-digits text-[#5A5A5A] font-normal flex gap-1">
                              قیمت: <div className="font-normal "> {formatPriceLoc(item.price)}</div>
                            </div>
                          ) : item.deposit > 0 || item.rent > 0 ? (
                            <div className="text-[16px] farsi-digits text-[#5A5A5A] font-normal space-y-2">
                              {item.deposit > 0 && (
                                <div className="flex gap-1 text-xs text-[#7A7A7A]">
                                  {' '}
                                  رهن: <div className="font-normal text-[#1A1E25]">
                                    {formatPriceLoc(item.deposit)}
                                  </div>{' '}
                                </div>
                              )}{' '}
                              {item.rent > 0 && (
                                <div className="flex gap-1 text-xs text-[#7A7A7A]">
                                  اجاره: <div className="font-normal text-[#1A1E25]">{formatPriceLoc(item.rent)} </div>
                                </div>
                              )}
                            </div>
                          ) : null}

                          {/* نمایش درصد سود مالک و سازنده */}
                          {(item.ownerProfitPercentage > 0 || item.producerProfitPercentage > 0) && (
                            <div className="text-[13px] space-y-1">
                              {item.ownerProfitPercentage > 0 && (
                                <div className="flex gap-1 text-xs text-[#7A7A7A]">
                                  سود مالک:{' '}
                                  <div className="font-normal text-[#1A1E25]">{item.ownerProfitPercentage} درصد</div>
                                </div>
                              )}
                              {item.producerProfitPercentage > 0 && (
                                <div className="flex gap-1 text-xs text-[#7A7A7A]">
                                  سود سازنده:{' '}
                                  <div className="font-normal text-[#1A1E25]">{item.producerProfitPercentage} درصد</div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* نمایش ظرفیت و نفرات اضافه */}
                          {(item.capacity > 0 || item.extraPeople > 0 || (item.rentalTerm && item.rentalTerm.name)) && (
                            <div className=" text-[13px] text-[#7A7A7A]">
                              {item.capacity > 0 && (
                                <div className="flex gap-1 text-xs text-[#7A7A7A]">
                                  ظرفیت: <div className="font-normal text-[#1A1E25]">{item.capacity} نفر</div>
                                </div>
                              )}
                              {/* {housing.extraPeople > 0 && <p>نفرات اضافه: {housing.extraPeople} نفر</p>} */}
                              {item.rentalTerm?.name && (
                                <div className="flex gap-1 text-xs text-[#7A7A7A]">
                                  نوع قرارداد: <div className="font-normal text-[#1A1E25]">{item.rentalTerm.name}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </section>
            )}
          </DataStateDisplay>
        </main>
      </ClientLayout>
    </>
  )
}

export default dynamic(() => Promise.resolve(Requests), { ssr: false })
