import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'

const VisitStatistics: NextPage = () => {
  // ? Assets
  const { query, events } = useRouter()
  // ? Render(s)
  return (
    <>
      <ClientLayout>
        <main className="">
    امار
        </main>
      </ClientLayout>
    </>
  )
}

export default dynamic(() => Promise.resolve(VisitStatistics), { ssr: false })
