import React from 'react'
import Sidebar from './Sidebar'

const Header = () => {
  return (
    <header className='bg-white px-4'>
        <div>
          <Sidebar />
          {/* <Searchbar /> */}
          {/* <MapMode/> */}
        </div>
        {/* <FilterControlNavBar/> */}
    </header>
  )
}

export default Header