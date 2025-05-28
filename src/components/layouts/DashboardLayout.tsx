import Link from 'next/link'
import { useState } from 'react'
import DashboardAdminAside from './DashboardAdminAside'
import { MenuAdminIcon } from '@/icons'
import { AdminBottomNavigation, FilterControlsHeader } from '../shared'
import AdminHeader from '../shared/AdminHeader'

interface Props {
  children: React.ReactNode
  showDetail?: boolean
  title?: string
}

const DashboardLayout: React.FC<Props> = ({ children, showDetail, title }) => {
  const [openRight, setOpenRight] = useState(false)
  return (
    <div className={`${!showDetail ? 'bg-[#2C3E50]' : 'bg-[#F6F7FB]'} h-screen`}>
      {showDetail ? (
        <div className='fixed top-0 z-[90]'>

          <FilterControlsHeader
            title={title}
            isAdmin
          />
        </div>
      ) : (
        <AdminHeader title="پیشخوان" isDashboard />
      )}

      <div className="">
        <div className="">
          <DashboardAdminAside setOpenRight={setOpenRight} openRight={openRight} />
        </div>
        <div className="">{children}</div>
      </div>
      {!showDetail && <AdminBottomNavigation />}
    </div>
  )
}

export default DashboardLayout
