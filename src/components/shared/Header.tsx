import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { SearchModal } from '../modals'
import MapMode from './MapMode'
import FilterControlNavBar from './FilterControlNavBar'
import { Close } from '@/icons'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { roles, userTypes } from '@/utils'
import { useRouter } from 'next/router'
import { setIsVisible } from '@/store'

const Header = ({ isEstateHeader }: { isEstateHeader?: boolean }) => {
  const { replace, query, push } = useRouter()

  const dispatch = useAppDispatch()
  const { zoomModal , isVisible } = useAppSelector((state) => state.statesData)
  const map = useAppSelector((state) => state.map)
  const handleInVisible = () => {
    dispatch(setIsVisible(false))
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    const userType = localStorage.getItem('userType')
    
    // If no userType is set or it's a basic user, show subscription message
    if (!userType) {
      dispatch(setIsVisible(true))
    }
    
    // If user is a member but has no subscription
    if (user && user.user_type === userTypes.MemberUser && user.subscription == undefined) {
      dispatch(setIsVisible(true))
    }
    
    // If user has subscription but it's not active
    if (user && user.subscription && user.subscription.status !== 'ACTIVE') {
      dispatch(setIsVisible(true))
    }
    
    // If user is a marketer but has no subscription
    if (user && user.user_type === userTypes.Marketer && user.subscription == undefined) {
      dispatch(setIsVisible(true))
    }
  }, [])

  const handleNavigate = () => {
    push('/subscription')
  }

  return (
    <header
      className={`${isEstateHeader && !map.mode ? '' : 'bg-white'} ${
        isEstateHeader && !map.mode ? '' : 'shadow-filter-control'
      } fixed z-[9999] w-full ${isEstateHeader && !map.mode && 'top-[70px]'}`}
    >
      <div className="flex gap-2.5 pt-4 w-full px-4">
        <Sidebar />
        <SearchModal />
        <MapMode />
      </div>
      <FilterControlNavBar isEstateHeader/>
      {zoomModal && (
        <div className="bg-[#222222]  relative pl-4">
          <div
            onClick={handleNavigate}
            className="text-xs text-white font-normal px-3.5 py-3 flex flex-wrap cursor-pointer"
          >
            {' '}
            شما زیاد از نقشه دور هستید لطفا نزدیک تر شوید.
          </div>
        </div>
      )}
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
