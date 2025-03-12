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
import { useState } from 'react'
import { Button } from '@/components/ui'
moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' })
const Requests: NextPage = () => {
  // ? Assets
  const { query, events, push } = useRouter()
  const dispatch = useAppDispatch()
  const { role } = useAppSelector((state) => state.auth)

  // ? States
  const [contactShown, setContactShown] = useState(false)
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)
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

  const handleContactOwner = (phoneNumber: string) => {
    const role = localStorage.getItem('role')
    if (!role || role === 'user') {
      push('/authentication/login?role=memberUser')
      return
    }
    window.location.href = `tel:${phoneNumber}`
  }
  // ? Render(s)
  return (
    <>
      <ClientLayout title="درخواست های ثبت شده">
        <main className="py-[140px] px-4">
          <div className="fixed flex flex-col gap y-2.5 bottom-[88px] left-4 z-10">
            <div
              onClick={handleNavigate}
              className="bg-white hover:bg-gray-50 w-[159px] h-[56px] rounded-[59px] flex-center gap-2 shadow-icon cursor-pointer"
            >
              <RegisterAdIcon width="32px" height="32px" />
              <span className="font-semibold text-[16px] whitespace-nowrap">ثبت درخواست</span>
            </div>
          </div>

          <div>
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
                      <div className="bg-white rounded-2xl shadow-request p-4" key={item.id}>
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

                          <div className="mt-4 px-4">
                            {/* نمایش قیمت فروش یا رهن و اجاره */}
                            <div className="mb-1">
                              {item.highlightFeatures.length > 0 &&
                                item.highlightFeatures.map((feature) => (
                                  <div className="text-xs farsi-digits text-[#7A7A7A] font-normal flex gap-1">
                                    {feature.title}: <div className="font-normal text-[#1A1E25]"> {feature.value}</div>
                                  </div>
                                ))}
                            </div>
                            {item.price > 0 ? (
                              <div className="text-xs farsi-digits text-[#5A5A5A] font-normal flex gap-1">
                                قیمت: <div className="font-normal text-[#1A1E25]"> {formatPriceLoc(item.price)}</div>
                              </div>
                            ) : item.deposit > 0 || item.rent > 0 ? (
                              <div className="text-[16px] farsi-digits text-[#5A5A5A] font-normal space-y-1">
                                {item.deposit > 0 && (
                                  <div className="flex gap-1 text-xs text-[#7A7A7A]">
                                    رهن:{' '}
                                    <div className="font-normal text-[#1A1E25]">{formatPriceLoc(item.deposit)}</div>{' '}
                                  </div>
                                )}{' '}
                                {item.rent > 0 && (
                                  <div className="flex gap-1 text-xs text-[#7A7A7A]">
                                    اجاره:{' '}
                                    <div className="font-normal text-[#1A1E25]">{formatPriceLoc(item.rent)} </div>
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
                                    <div className="font-normal text-[#1A1E25]">
                                      {item.producerProfitPercentage} درصد
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* نمایش ظرفیت و نفرات اضافه */}
                            {(item.capacity > 0 ||
                              item.extraPeople > 0 ||
                              (item.rentalTerm && item.rentalTerm.name)) && (
                              <div className=" text-[13px] text-[#7A7A7A]">
                                {item.capacity > 0 && (
                                  <div className="flex gap-1 text-xs text-[#7A7A7A]">
                                    ظرفیت: <div className="font-normal text-[#1A1E25]">{item.capacity} نفر</div>
                                  </div>
                                )}
                                {/* {item.extraPeople > 0 && <p>نفرات اضافه: {item.extraPeople} نفر</p>} */}
                                {item.rentalTerm?.name && (
                                  <div className="flex gap-1 text-xs text-[#7A7A7A]">
                                    نوع قرارداد:{' '}
                                    <div className="font-normal text-[#1A1E25]">{item.rentalTerm.name}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mx-4 mt-4 relative">
                          {showCopiedTooltip && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-xs px-2 py-1 rounded shadow">
                              کپی شد!
                            </div>
                          )}
                          <Button
                            className="w-full rounded-[10px] farsi-digits"
                            onClick={() => handleContactOwner(item.userInfo.phoneNumber)}
                          >
                            تماس
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </section>
              )}
            </DataStateDisplay>
          </div>
        </main>
      </ClientLayout>
    </>
  )
}

export default dynamic(() => Promise.resolve(Requests), { ssr: false })
