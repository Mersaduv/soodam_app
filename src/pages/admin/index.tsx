import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'

import { DashboardLayout } from '@/components/layouts'
import { NextPage } from 'next'
const AdminPage: NextPage = () => {
  return (
      <div className="">
        <Head>
          <title>پیشخوان </title>
        </Head>
        <DashboardLayout>
              <section className="py-20 flex mx-6 gap-8 justify-center w-full">
                <div className="flex flex-col gap-4 farsi-digits">
                    <div>
                        درحال انتظار : 120
                    </div>
                    <div>
                        تایید شده : 400
                    </div>
                    <div>
                        رد شده : 22
                    </div>
                </div>
              </section>
        </DashboardLayout>
      </div>
  )
}

export default dynamic(() => Promise.resolve(AdminPage), { ssr: false })
