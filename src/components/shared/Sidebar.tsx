import { useEffect } from 'react'
import Link from 'next/link'

import { useDisclosure } from '@/hooks'

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

export default function Sidebar() {
  const [isSidebar, sidebarHandlers] = useDisclosure();

  useEffect(() => {
    if (isSidebar) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isSidebar]);

  return (
    <>
      <button
        className="border-[0.8px] border-[#E3E3E7] bg-[#F2F2F3] rounded-lg h-[48px] px-[9.4px]"
        type="button"
        onClick={sidebarHandlers.open}
      >
        <MenuIcon />
      </button>
      <div
        className={`fixed top-0 z-[1000] h-screen w-full duration-200  ${
          isSidebar ? 'right-0' : '-right-full'
        }`}
      >
        <div
          className={`${
            isSidebar
              ? 'visible opacity-100 delay-200 duration-300'
              : 'invisible opacity-0'
          } z-[1000] h-full w-full bg-[#1A1E2599]`}
          onClick={sidebarHandlers.close}
        />
        <div className="absolute right-0 top-0 z-[1000] h-screen w-3/4 max-w-sm overflow-y-auto bg-white py-4 px-5 pt-10">
          <button className="float-left -mt-4" onClick={sidebarHandlers.close}>
            <CloseCircleIcon />
          </button>
          <div className="space-y-1">
            <h1 className="text-[#D52133] font-extrabold text-xl">سودم</h1>
            <h5 className="font-light text-[#D52133] text-[11px]">
              سرمایه،وقت،درآمد،مدیریت
            </h5>
          </div>
          <hr className="mt-7 mb-4" />

        <div className="flex flex-col gap-y-3.5">
        {menuItems.map((item, index) => (
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
                      className={`${
                        open ? 'text-red-400' : 'text-gray-700 rotate-90'
                      } transition-all`}
                    />
                  </Disclosure.Button>
                  {item.subItems.length > 0 && (
                    <Disclosure.Panel className="">
                      {item.subItems.map((subItem, subIndex) => (
                        <div
                          key={subIndex}
                          className="mb-6 flex w-full items-center justify-between pr-[34px]"
                        >
                          {subItem.icon}
                          <span className="font-light text-sm text-[#1A1E25]">
                            {subItem.title}
                          </span>
                        </div>
                      ))}
                    </Disclosure.Panel>
                  )}
                </>
              )}
            </Disclosure>
          ))}
        </div>
        </div>
      </div>
    </>
  );
}

const menuItems = [
  {
    title: 'مدیریت حساب من',
    icon: <CardTrickIcon />,
    subItems: [
      { title: 'آگهی‌های من', icon: null },
      { title: 'پرداختی‌های من', icon: null },
      { title: 'آگهی‌های ذخیره شده', icon: null },
      { title: 'آمار بازدید', icon: null },
    ],
  },
  {
    title: 'ثبت درخواست',
    icon: <NoteFavIcon />,
    subItems: [],
  },
  {
    title: 'ثبت آگهی',
    icon: <AddCircleIcon />,
    subItems: [],
  },
  {
    title: 'ثبت نام به عنوان بازاریاب',
    icon: <UserEdit />,
    subItems: [],
  },
  {
    title: 'مشاورین املاک',
    icon: <PeopleIcon />,
    subItems: [],
  },
  {
    title: 'مجله خبر',
    icon: <NoteTxIcon />,
    subItems: [],
  },
  {
    title: 'ارتباط ما',
    icon: <SmsEditIcon />,
    subItems: [],
  },
]
