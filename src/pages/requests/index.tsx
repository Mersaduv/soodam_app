import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { setIsShowLogin } from '@/store'
import { RegisterAdIcon } from '@/icons'
import { useGetRequestsQuery } from '@/services'
import { DataStateDisplay } from '@/components/shared'
import { HousingSkeleton } from '@/components/skeleton'
import { EmptyCustomList } from '@/components/emptyList'
import { HousingCard } from '@/components/housing'

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

          {/* <DataStateDisplay
            {...requestQueryProps}
            isFetching={isFetching}
            dataLength={requestData?.data ? requestData.data.length : 0}
            loadingComponent={<HousingSkeleton />}
            emptyComponent={<EmptyCustomList />}
          >
            {requestData && requestData.data.length > 0 && (
              <section className="flex flex-wrap justify-center gap-3">
                {requestData.data.map((item) => (
                  <HousingCard housing={item} key={item.id} />
                ))}
              </section>
            )}
          </DataStateDisplay> */}
        </main>
      </ClientLayout>
    </>
  )
}

export default dynamic(() => Promise.resolve(Requests), { ssr: false })
