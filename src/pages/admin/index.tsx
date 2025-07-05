import dynamic from 'next/dynamic'
import Head from 'next/head'

import { NextPage } from 'next'
import {
  BlueUsersIcon,
  BlueWalletIcon,
  CircleGreenIcon,
  DocsPurpleIcon,
  FilterAdminIcon,
  GuardUserOrgIcon,
  MegaPhoneIcon,
  OrangeLocationIcon,
  RedUserIcon,
  UserBlueTickIcon,
} from '@/icons'
import AdminHeader from '@/components/shared/AdminHeader'
import { AdminVisitStatistics } from '@/components/user'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import Link from 'next/link'
const AdminPage: NextPage = () => {
  return (
    <DashboardLayout>
      <div className="">
        <Head>
          <title>پیشخوان </title>
        </Head>
        <section className="">
          <div className="bg-[#F6F7FB] rounded-t-[40px] h-screen mt-3 pb-[80px]">
            <div className="px-5 pt-6 py-4 flex items-center justify-between">
              <div className="font-medium text-[#353535]">آمار کلی</div>
              <div className="cursor-pointer">
                <FilterAdminIcon width="20px" height="20px" />
              </div>
            </div>

            <div>
              <AdminVisitStatistics />
            </div>

            <div className="px-4">
              <div className="grid grid-cols-3 gap-[12px] justify-center w-full">
                <div className="flex justify-center items-center">
                  <Link
                    href="/admin/requests"
                    className={
                      'gap-3 bg-white min-w-[100px] xxss:min-w-[112px] h-[106px] rounded-[15px] flex flex-col items-center justify-center'
                    }
                  >
                    <UserBlueTickIcon width="40px" height="40px" />
                    <div className="text-[#2C3E50] text-sm font-medium">ثبت نام ها</div>
                  </Link>
                </div>

                <div className="flex justify-center items-center">
                  <Link
                    href="/admin/advertisements"
                    className={
                      'gap-3 bg-white min-w-[100px] xxss:min-w-[112px] h-[106px] rounded-[15px] flex flex-col items-center justify-center'
                    }
                  >
                    <MegaPhoneIcon width="40px" height="40px" />
                    <div className="text-[#2C3E50] text-sm font-medium">آگهی ها</div>
                  </Link>
                </div>

                <div className="flex justify-center items-center">
                  <div
                    className={
                      'gap-3 bg-white min-w-[100px] xxss:min-w-[112px] h-[106px] rounded-[15px] flex flex-col items-center justify-center'
                    }
                  >
                    <GuardUserOrgIcon width="40px" height="40px" />
                    <div className="text-[#2C3E50] text-sm font-medium">ادمین ها</div>
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <div
                    className={
                      'gap-3 bg-white min-w-[100px] xxss:min-w-[112px] h-[106px] rounded-[15px] flex flex-col items-center justify-center'
                    }
                  >
                    <DocsPurpleIcon width="40px" height="40px" />
                    <div className="text-[#2C3E50] text-sm font-medium">خبر ها</div>
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <div
                    className={
                      'gap-3 bg-white min-w-[100px] xxss:min-w-[112px] h-[106px] rounded-[15px] flex flex-col items-center justify-center'
                    }
                  >
                    <CircleGreenIcon width="40px" height="40px" />
                    <div className="text-[#2C3E50] text-sm font-medium">بازاریاب ها</div>
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <div
                    className={
                      'gap-3 bg-white min-w-[100px] xxss:min-w-[112px] h-[106px] rounded-[15px] flex flex-col items-center justify-center'
                    }
                  >
                    <OrangeLocationIcon width="40px" height="40px" />
                    <div className="text-[#2C3E50] text-sm font-medium">استان ها</div>
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <div
                    className={
                      'gap-3 bg-white min-w-[100px] xxss:min-w-[112px] h-[106px] rounded-[15px] flex flex-col items-center justify-center'
                    }
                  >
                    <RedUserIcon width="40px" height="40px" />
                    <div className="text-[#2C3E50] text-sm font-medium">کاربران</div>
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <div
                    className={
                      'gap-3 bg-white min-w-[100px] xxss:min-w-[112px] h-[106px] rounded-[15px] flex flex-col items-center justify-center'
                    }
                  >
                    <BlueUsersIcon width="40px" height="40px" />
                    <div className="text-[#2C3E50] text-sm font-medium">تخلفات</div>
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <div
                    className={
                      'gap-3 bg-white min-w-[100px] xxss:min-w-[112px] h-[106px] rounded-[15px] flex flex-col items-center justify-center'
                    }
                  >
                    <BlueWalletIcon width="40px" height="40px" />
                    <div className="text-[#2C3E50] text-sm font-medium">کیف پول</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default dynamic(() => Promise.resolve(AdminPage), { ssr: false })
