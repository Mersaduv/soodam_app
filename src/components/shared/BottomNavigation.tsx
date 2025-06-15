import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Home2Icon, MoreIcon, ProfileNoTick, ProfileTick, ProfileTickGreen, SearchIcon, SquareTaskIcon } from '@/icons'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { setIsShowLogin } from '@/store'
import { userTypes } from '@/utils/constants'

const BottomNavigation: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { pathname } = router
  const { phoneNumber, user } = useAppSelector((state) => state.auth)
  const userType = localStorage.getItem('userType')

  const navItems = [
    { href: '/', icon: <SearchIcon width="24px" height="24px" />, label: 'جستجو' },
    { href: '/myCity', icon: <Home2Icon width="24px" height="24px" />, label: 'شهر من' },
    { href: '/requests', icon: <SquareTaskIcon width="24px" height="24px" />, label: 'درخواست‌ها' },
    {
      href: '/marketer',
      icon:
        userType === userTypes.NormalUser.toString() || !userType ? (
          <ProfileNoTick width="24px" height="24px" />
        ) : user && user.subscription ? (
          <ProfileTickGreen width="24px" height="24px" />
        ) : (
          <ProfileTick width="24px" height="24px" />
        ),
      label: 'عضویت',
    },
    { href: '/soodam', icon: <MoreIcon width="24px" height="24px" />, label: 'سودم' },
  ]

  const handleShowModalClick = () => {
    dispatch(setIsShowLogin(true))
  }

  return (
    <nav className="fixed z-[999] bottom-0 left-0 right-0 bg-white shadow-nav border-t border-gray-200 h-[68px] flex items-start w-full">
      <ul className="flex flex-row-reverse justify-between items-start px-5 w-full">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex flex-col pt-2.5 px-1 items-center border-t-[3px] ${
                pathname === item.href ? 'border-[#D52133]' : 'border-white'
              }`}
              passHref
              onClick={(e) => {
                const userType = localStorage.getItem('userType')
                if (item.href === '/soodam') {
                  if (!userType) {
                    e.preventDefault()
                    handleShowModalClick()
                  }
                }
                if (item.href === '/marketer') {
                  e.preventDefault()
                  handleShowModalClick()
                }
              }}
            >
              <div className="flex flex-col items-center">
                {React.cloneElement(item.icon, {
                  className: `text-xl ${pathname === item.href ? 'text-[#D52133]' : 'text-gray-600'}`,
                })}
                <span
                  className={`text-[10px] font-bold pt-1 ${
                    pathname === item.href ? 'text-[#D52133]' : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default BottomNavigation
