import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { setIsShowLogin } from '@/store'
import { RegisterAdIcon } from '@/icons'

const Requests: NextPage = () => {
  // ? Assets
  const { query, events, push } = useRouter()
  const dispatch = useAppDispatch()
  const { role } = useAppSelector((state) => state.auth)
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
      <ClientLayout>
        <main className="pt-[140px] px-4">
          <h1>درخاست ها</h1>
          <div className="absolute flex flex-col gap-y-2.5 bottom-[88px] left-4 z-10">
            <div
              onClick={handleNavigate}
              className="bg-white hover:bg-gray-50 w-[159px] h-[56px] rounded-[59px] flex-center gap-2 shadow-icon cursor-pointer"
            >
              <RegisterAdIcon width="32px" height="32px" />
              <span className="font-semibold text-[16px] whitespace-nowrap">ثبت درخواست</span>
            </div>
          </div>
        </main>
      </ClientLayout>
    </>
  )
}

export default dynamic(() => Promise.resolve(Requests), { ssr: false })
