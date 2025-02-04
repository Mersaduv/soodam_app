import { useEffect } from 'react'
import Link from 'next/link'

import { useAppDispatch, useDisclosure } from '@/hooks'

import { Disclosure } from '@headlessui/react'
import {
  AddCircleIcon,
  ArrowLeftIcon,
  CardTrickIcon,
  CloseCircleIcon,
  MenuIcon,
  NoteFavIcon,
  SmsEditIcon,
  NoteTxIcon,
  PeopleIcon,
  UserEdit,
} from '@/icons'
import { useRouter } from 'next/router'
import { setIsShowLogin } from '@/store'

export default function Sidebar() {
  const [isSidebar, sidebarHandlers] = useDisclosure()
  const { query, push } = useRouter()
  const dispatch = useAppDispatch()

  const handleClickNewAdAsMarketerNav = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user && user.role !== 'marketer') {
      push('/marketer')
    } else {
      push('/soodam')
    }
  }

  const handleClickNewAdNav = () => {
    // const user = JSON.parse(localStorage.getItem('user'))
    const role = localStorage.getItem('role')
    if (role === null || role === 'user') {
      dispatch(setIsShowLogin(true))
    } else {
      push('/housing/ad/new')
    }
  }

  useEffect(() => {
    if (isSidebar) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [isSidebar])

  return (
    <>
      <button
        className="border-[0.8px] border-[#E3E3E7] bg-[#F2F2F3] rounded-lg h-[48px] px-[9.4px]"
        type="button"
        onClick={sidebarHandlers.open}
      >
        <MenuIcon width="24px" height="24px" />
      </button>
      <div className={`fixed top-0 z-[1000] h-screen w-full duration-200  ${isSidebar ? 'right-0' : '-right-full'}`}>
        <div
          className={`${
            isSidebar ? 'visible opacity-100 delay-200 duration-300' : 'invisible opacity-0'
          } z-[1000] h-full w-full bg-[#1A1E2599]`}
          onClick={sidebarHandlers.close}
        />
        <div className="absolute right-0 top-0 z-[1000] h-screen w-3/4 max-w-sm overflow-y-auto bg-white py-4 px-5 pt-10">
          <button className="float-left -mt-4" onClick={sidebarHandlers.close}>
            <CloseCircleIcon width="24px" height="24px" />
          </button>
          <div className="space-y-1">
            <h1 className="text-[#D52133] font-extrabold text-xl">سودم</h1>
            <h5 className="font-light text-[#D52133] text-[11px]">سرمایه،وقت،درآمد،مدیریت</h5>
          </div>
          <hr className="mt-7 mb-4" />

          <div className="flex flex-col gap-y-3.5">
            {menuItems.map((item, index) => {
              if (item.subItems.length === 0) {
                if (item.title === 'ثبت نام به عنوان بازاریاب') {
                  return (
                    <div
                      key={index}
                      onClick={handleClickNewAdAsMarketerNav}
                      className="!mt-0 flex w-full items-center justify-between py-2 cursor-pointer"
                    >
                      <div className="flex gap-x-2.5 items-end">
                        {item.icon}
                        <span className="pl-3 whitespace-nowrap font-medium text-sm tracking-wide text-[#1A1E25]">
                          {item.title}
                        </span>
                      </div>
                      <ArrowLeftIcon width="24px" height="24px" className="text-gray-700 rotate-90 transition-all" />
                    </div>
                  )
                } else if (item.title === 'ثبت آگهی') {
                  return (
                    <div
                      key={index}
                      onClick={handleClickNewAdNav}
                      className="!mt-0 flex w-full items-center justify-between py-2 cursor-pointer"
                    >
                      <div className="flex gap-x-2.5 items-end">
                        {item.icon}
                        <span className="pl-3 whitespace-nowrap font-medium text-sm tracking-wide text-[#1A1E25]">
                          {item.title}
                        </span>
                      </div>
                      <ArrowLeftIcon width="24px" height="24px" className="text-gray-700 rotate-90 transition-all" />
                    </div>
                  )
                } else {
                  return (
                    <Link key={index} href={item.path} className="!mt-0 flex w-full items-center justify-between py-2">
                      <div className="flex gap-x-2.5 items-end">
                        {item.icon}
                        <span className="pl-3 whitespace-nowrap font-medium text-sm tracking-wide text-[#1A1E25]">
                          {item.title}
                        </span>
                      </div>
                      <ArrowLeftIcon width="24px" height="24px" className="text-gray-700 rotate-90 transition-all" />
                    </Link>
                  )
                }
              }
              return (
                <Disclosure key={index}>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="!mt-0 flex w-full items-center justify-between py-2">
                        <div className="flex gap-x-2.5 items-end">
                          {item.icon}
                          <span className="pl-3 whitespace-nowrap font-medium text-sm tracking-wide text-[#1A1E25]">
                            {item.title}
                          </span>
                        </div>
                        <ArrowLeftIcon
                          width="24px"
                          height="24px"
                          className={`${open ? 'text-red-400' : 'text-gray-700 rotate-90'} transition-all`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="">
                        {item.subItems.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.path}
                            className="mb-6 flex w-full items-center justify-between pr-[34px]"
                          >
                            {subItem.icon}
                            <span className="font-light text-sm text-[#1A1E25]">{subItem.title}</span>
                          </Link>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
const menuItems = [
  {
    title: 'مدیریت حساب من',
    icon: <CardTrickIcon width="24px" height="24px" />,
    subItems: [
      { title: 'آگهی‌های من', icon: null, path: '/' },
      { title: 'پرداختی‌های من', icon: null, path: '/' },
      { title: 'علاقمندی ها', icon: null, path: '/lists' },
      { title: 'آمار بازدید', icon: null, path: '/visitStatistics' },
      { title: 'پنل املاک من', icon: null, path: '/' },
    ],
  },
  {
    title: 'ثبت درخواست',
    icon: <NoteFavIcon width="24px" height="24px" />,
    subItems: [],
    path: '/requests/new',
  },
  {
    title: 'ثبت آگهی',
    icon: <AddCircleIcon width="24px" height="24px" />,
    subItems: [],
    path: '/housing/ad',
  },
  {
    title: 'ثبت نام به عنوان بازاریاب',
    icon: <UserEdit width="24px" height="24px" />,
    subItems: [],
    path: '/housing/ad/new?role=Marketer',
  },
  {
    title: 'مشاورین املاک',
    icon: <PeopleIcon width="24px" height="24px" />,
    subItems: [],
    path: '/',
  },
  {
    title: 'مجله خبر',
    icon: <NoteTxIcon width="24px" height="24px" />,
    subItems: [],
    path: '/news',
  },
  {
    title: 'ارتباط ما',
    icon: <SmsEditIcon width="24px" height="24px" />,
    subItems: [],
    path: '/contacts',
  },
]
