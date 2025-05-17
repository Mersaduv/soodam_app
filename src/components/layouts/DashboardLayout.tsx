import Link from 'next/link'
import { useState } from 'react'
import DashboardAdminAside from './DashboardAdminAside'
import { MenuAdminIcon } from '@/icons'
import { BottomNavigation, FilterControlsHeader } from '../shared'

interface Props {
  children: React.ReactNode
  showDetail?: boolean
  title?: string
}

const DashboardLayout: React.FC<Props> = ({ children, showDetail, title }) => {
  const [openRight, setOpenRight] = useState(false)
  return (
    <>
      {showDetail ? (
        <div className='fixed top-0 z-[90]'>

          <FilterControlsHeader
            title={title}
          />
        </div>
      ) : (
        <header className="w-full flex justify-between items-center shadow-filter-control h-[66px] fixed top-0 z-[90] bg-white px-3">
          <div className="flex items-center justify-start gap-3 ">
            <div className="rounded p-2 hover:bg-sky-100   cursor-pointer" onClick={() => setOpenRight(!openRight)}>
              <span className="block">
                <MenuAdminIcon width="24px" height="25px" />
              </span>
            </div>
            <Link className="" passHref href="/">
              <h1 className="text-lg font-medium">پنل مدیریت کل</h1>
            </Link>
          </div>
          <div>
            <div className="border-2 w-fit rounded-full border-[#D52133]">
              <img
                className="w-[35px] h-[35px] rounded-full object-contain p-1"
                src="/static/user.png"
                alt={'پروفایل ادمین'}
              />
            </div>
          </div>
        </header>
      )}

      <div className="flex mt-[75px] bg-[#f5f8fa] h-screen w-full">
        <div className="">
          <DashboardAdminAside setOpenRight={setOpenRight} openRight={openRight} />
        </div>
        <div className="w-full flex flex-col items-start max-w-screen-2xl  mx-auto">{children}</div>
      </div>
      <BottomNavigation />
    </>
  )
}

export default DashboardLayout
