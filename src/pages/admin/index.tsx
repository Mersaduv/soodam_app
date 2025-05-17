import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'

import { DashboardLayout } from '@/components/layouts'
import { NextPage } from 'next'
import Link from 'next/link'
import {
  ChartAdmin,
  ClipBoardAdminIcon,
  NoteAdminIcon,
  PeopleIconAdmin,
  TaskSqAdminIcon,
  UserTickAdminIcon,
} from '@/icons'
const AdminPage: NextPage = () => {
  return (
    <div className="">
      <Head>
        <title>پیشخوان </title>
      </Head>
      <DashboardLayout>
        <section className="py-[90px] pt-1 px-4 w-full">
          <div className="bg-[#009E8E] w-full h-[145px] rounded-2xl flex items-center justify-between px-4">
            <div>
              <h1 className="text-base font-bold text-white">اپلیکیشن سودم</h1>
              <div className="flex items-center gap-1 mb-8 pt-1.5">
                <div className="text-sm font-medium text-white farsi-digits">128</div>
                <div className="text-white">بازاریاب فعال</div>
              </div>
              <Link href={'/admin'} className="text-xs font-medium text-[#8C7E89] bg-white rounded-lg p-1 px-3">
                مشاهده کاربران پرسود
              </Link>
            </div>
            <div>
              <img className="w-[134px] h-[109px]" src="/static/security-vault.png" alt="" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 gap-y-6 mt-6">
            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className="bg-dashed">
                <div className="bg-[#D52133] w-[74px] h-[74px] rounded-full flex items-center justify-center">
                  <ChartAdmin width="42px" height="42px" />
                </div>
              </div>
              <div className="text-[#5A5A5A] text-sm font-normal">آمار کاربران</div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className="bg-dashed flex justify-center">
                <div className="bg-[#D52133] w-[74px] h-[74px] rounded-full flex items-center justify-center">
                  <PeopleIconAdmin width="42px" height="42px" />
                </div>
              </div>
              <div className="text-[#5A5A5A] text-sm font-normal">تایید بازاریاب ها</div>
            </div>

            <Link href={`/admin/adv`} className="flex flex-col items-center justify-center gap-2.5">
              <div className="bg-dashed flex justify-end">
                <div className="bg-[#D52133] w-[74px] h-[74px] rounded-full flex items-center justify-center">
                  <ClipBoardAdminIcon width="42px" height="42px" />
                </div>
              </div>
              <div className="text-[#5A5A5A] text-sm font-normal">تایید آگهی ها</div>
            </Link>

            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className="bg-dashed flex justify-start items-end">
                <div className="bg-[#D52133] w-[74px] h-[74px] rounded-full flex items-center justify-center">
                  <TaskSqAdminIcon width="42px" height="42px" />
                </div>
              </div>
              <div className="text-[#5A5A5A] text-sm font-normal">تایید درخواست ها</div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className="bg-dashed flex justify-center items-end">
                <div className="bg-[#D52133] w-[74px] h-[74px] rounded-full flex items-center justify-center">
                  <NoteAdminIcon width="42px" height="42px" />
                </div>
              </div>
              <div className="text-[#5A5A5A] text-sm font-normal">تایید خبر ها</div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className="bg-dashed flex justify-end items-end">
                <div className="bg-[#D52133] w-[74px] h-[74px] rounded-full flex items-center justify-center">
                  <UserTickAdminIcon width="42px" height="42px" />
                </div>
              </div>
              <div className="text-[#5A5A5A] text-sm font-normal">افزودن ادمین</div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className="bg-dashed flex justify-end items-end">
                <div className="bg-[#D52133] w-[74px] h-[74px] rounded-full flex items-center justify-center">
                  <UserTickAdminIcon width="42px" height="42px" />
                </div>
              </div>
              <div className="text-[#5A5A5A] text-sm font-normal">ادمین شهر</div>
            </div>
          </div>
        </section>
      </DashboardLayout>
    </div>
  )
}

export default dynamic(() => Promise.resolve(AdminPage), { ssr: false })
