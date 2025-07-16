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
  headerButton?: React.ReactNode
  chatRoomBg?: boolean
  profile?: React.ReactNode
}

const DashboardLayout: React.FC<Props> = ({ children, showDetail, title, headerButton, chatRoomBg, profile }) => {
  const [openRight, setOpenRight] = useState(false)
  return (
    <div className={`${!showDetail ? 'bg-[#2C3E50]' : 'bg-[#F6F7FB]'} h-screen`}
    style={{
      backgroundImage: chatRoomBg ? "url('/static/Chat Container.png')" : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
    >
      {showDetail ? (
        <div className="fixed top-0 z-[90]">
            <FilterControlsHeader title={title} isAdmin headerButton={headerButton} profile={profile} />
            {/* {headerButton && <div className="ml-2">{headerButton}</div>} */}
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
