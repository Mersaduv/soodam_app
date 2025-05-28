import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  EmailAdmIcon,
  HomeAdmIcon,
  HomeIcon,
  SearchAdmIcon,
  SearchIcon,
  SettingAdmIcon,
  SettingSmIcon,
  SmsEditIcon,
} from '@/icons'

const AdminBottomNavigation: React.FC = () => {
  const router = useRouter()
  const { pathname } = router

  const navItems = [
    { href: '/admin/settings', icon: <SettingAdmIcon width="25px" height="24px" />, label: 'تنظیمات' },
    { href: '/admin/messages', icon: <EmailAdmIcon width="25px" height="20px" />, label: 'پیام‌ها' },
    { href: '/admin/search', icon: <SearchAdmIcon width="24px" height="22px" />, label: 'جستجو' },
    { href: '/admin', icon: <HomeAdmIcon width="22px" height="20px" />, label: 'خانه' },
  ]

  return (
    <nav className="fixed z-[999] bottom-0 left-0 right-0 bg-white shadow-nav border-t border-gray-200 h-[67px] flex items-center w-full">
      <ul className="flex flex-row-reverse justify-between items-start px-2 w-full">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex flex-col px-1 items-center py-3 ${
                pathname === item.href ? '' : 'border-white'
              }`}
              passHref
            >
              <div className={`${pathname === item.href ? 'bg-[#2C3E50]' : 'bg-white'} h-[36px] rounded-full min-w-[75px] xxsss:min-w-[85px] flex items-center`}>
                <div className=' flex items-center justify-center gap-2.5 w-full'>
                  <span
                    className={`text-[10px] font-semibold pt-[1px] ${
                      pathname === item.href ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {item.label}
                  </span>
                  {React.cloneElement(item.icon, {
                    className: `text-xl ${pathname === item.href ? 'text-white' : 'text-[#898989]'}`,
                  })}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default AdminBottomNavigation
