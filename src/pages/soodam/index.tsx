import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { LogoutButton } from '@/components/user'

const Soodam: NextPage = () => {
  // ? Assets
  const { query, events } = useRouter()
  // ? Render(s)
  return (
    <>
      <ClientLayout>
        <main className="pt-[150px] px-4">
          <h1>حساب کاربری</h1>
          <LogoutButton />
           </main>
      </ClientLayout>
    </>
  )
}

export default dynamic(() => Promise.resolve(Soodam), { ssr: false })
