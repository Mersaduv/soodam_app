import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { SearchModal } from '../modals'
import MapMode from './MapMode'
import FilterControlNavBar from './FilterControlNavBar'
import { Close } from '@/icons'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { roles } from '@/utils'
import { useRouter } from 'next/router'

const Header = () => {
  const { replace, query, push } = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  const dispatch = useAppDispatch()

  const handleInVisible = () => {
    setIsVisible(false)
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    const role = localStorage.getItem('role')
    if (role === 'user' || !role) {
      setIsVisible(true)
    }
    if (user && user.role === 'memberUser' && user.subscription == undefined) {
      setIsVisible(true)
    }
    if (user && user.subscription && user.subscription.status !== 'ACTIVE') {
      setIsVisible(true)
    }
    if (user && user.role === 'marketer' && user.subscription == undefined) {
      setIsVisible(true)
    }
  }, [])

  const handleNavigate = () => {
    push('/subscription')
  }

  return (
    <header className="bg-white shadow-filter-control fixed z-[9999] w-full">
      <div className="flex gap-2.5 pt-4 w-full px-4">
        <Sidebar />
        <SearchModal />
        <MapMode />
      </div>
      <FilterControlNavBar />
      {isVisible && (
        <div className="bg-[#222222]  relative pl-4">
          <div
            onClick={handleInVisible}
            className="text-white border-white border cursor-pointer hover:bg-white hover:text-black -mt-2 ml-2 -mr-2 rounded-full absolute top-[18px] left-0.5"
          >
            <Close className="h-3 w-3" />
          </div>
          <div
            onClick={handleNavigate}
            className="text-xs text-white font-normal px-3.5 py-3 flex flex-wrap cursor-pointer"
          >
            {' '}
            برای دسترسی به آدرس دقیق و شماره تماس آگهی ها نیاز به{' '}
            <span className="underline inline-block mx-1 text-white ">اشتراک</span> دارید
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
