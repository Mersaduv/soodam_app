import { ClientLayout } from '@/components/layouts'
import { Button } from '@/components/ui'
import { useAppSelector } from '@/hooks'
import { BrushSmIcon, CircleMdIcon, Home22Icon, Home2Icon } from '@/icons'
import { getProvinceFromCoordinates } from '@/utils'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'

const Setting: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const { userCityLocation } = useAppSelector((state) => state.statesData)

  const city = getProvinceFromCoordinates(userCityLocation[0], userCityLocation[1])

  // ? State برای dropdown
  const [showDropdown, setShowDropdown] = useState(false)
  const [theme, setTheme] = useState('پیش فرض سیستم')

  // تابع تغییر وضعیت dropdown
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev)
  }

  // انتخاب تم و بستن dropdown
  const selectTheme = (selected: string) => {
    setTheme(selected)
    setShowDropdown(false)
  }
  return (
    <>
      <ClientLayout title="تنظیمات">
        <main className="py-[80px] relative">
          <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3 ">
            {/* ردیف شهر من */}
            <div className="flex justify-between p-4 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <Home22Icon width="24px" height="24px" />
                <div className="text-[#1A1E25]">شهر من</div>
              </div>
              <div className="text-[#7A7A7A]">{city}</div>
            </div>

            {/* ردیف ظاهر برنامه با dropdown */}
            <div className="relative">
              <div 
                className="flex justify-between p-4 rounded-2xl cursor-pointer"
                onClick={toggleDropdown}
              >
                <div className="flex items-center gap-2.5">
                  <BrushSmIcon width="24px" height="24px" />
                  <div className="text-[#1A1E25]">ظاهر برنامه</div>
                </div>
                <div className="text-[#7A7A7A]">{theme}</div>
              </div>
              {showDropdown && (
                <div className="absolute right-0 left-0 bg-white border border-[#E3E3E7] rounded-2xl mt-1 z-10">
                  <ul>
                    <li 
                      onClick={() => selectTheme("پیش فرض سیستم")}
                      className="p-4 hover:bg-gray-100 cursor-pointer rounded-2xl"
                    >
                      پیش فرض سیستم
                    </li>
                    <li 
                      onClick={() => selectTheme("روشن")}
                      className="p-4 hover:bg-gray-100 cursor-pointer rounded-2xl"
                    >
                      روشن
                    </li>
                    <li 
                      onClick={() => selectTheme("تاریک")}
                      className="p-4 hover:bg-gray-100 cursor-pointer rounded-2xl"
                    >
                      تاریک
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>
      </ClientLayout>
    </>
  )
}

export default Setting
