import React from 'react'
import Sidebar from './Sidebar'
import { SearchModal } from '../modals'
import MapMode from './MapMode'
import FilterControlNavBar from './FilterControlNavBar'

const Header = () => {
  return (
    <header className="bg-white shadow-filter-control fixed z-[9999] w-full">
      <div className='flex gap-2.5 pt-4 w-full px-4'>
        <Sidebar />
        <SearchModal />
        <MapMode />
      </div>
      <FilterControlNavBar />
    </header>
  )
}

export default Header
