import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { ArrowLeftIcon } from '@/icons'

const Marketer: NextPage = () => {
  // ? Assets
  const { query, events, back } = useRouter()

  const handleBack = () => {
    back()
  }

  // ? Render(s)
  return (
    <>
      {' '}
      <main className="bg-white m-4 rounded-2xl border border-[#E3E3E7]">
        <div className="flex items-center gap-1 p-4">
          <button onClick={handleBack} className={`rounded-full w-fit p-1 -rotate-90 font-bold`}>
            <ArrowLeftIcon width="24px" height="24px" />
          </button>{' '}
          <h1 className="font-bold text-lg">مراحل فعالیت به عنوان بازاریاب</h1>
        </div>
        <div>ورود به عنوان بازاریاب</div>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(Marketer), { ssr: false })
