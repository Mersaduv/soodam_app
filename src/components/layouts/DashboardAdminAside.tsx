import Link from 'next/link'

import { ArrowLeft } from '@/icons'

import { LogoutButton } from '@/components/user'
import { RiNotification2Line } from 'react-icons/ri'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { BsFillGrid1X2Fill, BsUiChecksGrid } from 'react-icons/bs'
import { Drawer } from '../shared'

interface ProfilePath {
  id: number
  name: string
  Icon: any
  subItem?: {
    id: number
    name: string
    Icon: any
    path: string[]
  }[]
  path?: string[]
  pathName?: string
}

function makeIdsUnique(arr: ProfilePath[]) {
  let idCounter = 1

  const recursiveIdUpdate = (arr: ProfilePath[]) => {
    arr.forEach((item: any) => {
      item.id = idCounter
      idCounter++

      if (item.subItem && Array.isArray(item.subItem)) {
        recursiveIdUpdate(item.subItem)
      }
    })
  }

  recursiveIdUpdate(arr)
  return arr
}

const profileData: ProfilePath[] = [
  { id: 1, name: 'آمارها', Icon: BsFillGrid1X2Fill, path: ['/admin'] },
  { id: 2, name: 'آگهی ها', Icon: BsUiChecksGrid, path: ['/admin/ads'] },
  {
    id: 3,
    name: 'اعلانات',
    Icon: RiNotification2Line,
    path: ['/admin/notifications'],
  },
]

const profilePaths = makeIdsUnique(profileData)
interface Props {
  openRight: boolean
  setOpenRight: Dispatch<SetStateAction<boolean>>
}
export default function DashboardAdminAside(props: Props) {
  const { openRight, setOpenRight } = props
  const router = useRouter()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    profilePaths.forEach((item) => {
      if (item.subItem) {
        item.subItem.forEach((subItem) => {
          if (subItem.path.includes(router.pathname)) {
            setOpenIndex(item.id)
          }
        })
      }
    })
  }, [router.pathname])

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const isPathActive = (paths: string[]) => paths.includes(router.pathname)

  const isParentPathActive = (subItems?: { path: string[] }[]) => {
    return subItems?.some((subItem) => isPathActive(subItem.path))
  }

  return (
    <div className="lg2:w-[265px]"> 

      {/* Mobile Drawer */}
      <Drawer open={openRight} side="right" setOpen={setOpenRight}>
        <aside
          className={`fixed top-[50px] w-[265px] bg-[#1e1e2d] z-50 h-screen transition-transform duration-300 ease-in-out ${
            openRight ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="py-5 flex flex-col justify-between h-full">
            <div className="overflow-auto">
              {profilePaths.map((item, index) => {
                const isItemActive = item.path?.includes(router.pathname)

                return item.path ? (
                  <Link href={item.path[0]} key={index}>
                    <div
                      className={`flex cursor-pointer hover:bg-[#1b1b28] justify-between items-center py-2.5 text-sm px-6 pl-4 w-full gap-3 text-[#9899ac] ${
                        isItemActive ? 'text-[#e90089] bg-[#1b1b28]' : 'text-gray-700'
                      }`}
                      onClick={() => handleToggle(item.id)}
                    >
                      <div className="flex gap-3 items-center">
                        <item.Icon className={`text-xl ${isItemActive ? 'text-[#e90089]' : 'text-[#5a6080]'}`} />
                        <span className={`ml-2 ${isItemActive ? 'text-white' : 'text-gray-400'}`}>{item.name}</span>
                      </div>
                      {item.subItem && item.subItem.length > 0 && (
                        <span className="text-white">
                          <ArrowLeft
                            className={`transition-all ease-in-out duration-500 ${
                              openIndex == item.id ? '-rotate-90' : ''
                            } text-3xl hover:shadow-xl rounded-full text-[#e90089]`}
                          />
                        </span>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div key={index}>
                    <div
                      className={`flex cursor-pointer hover:bg-[#1b1b28] justify-between items-center py-2.5 text-sm px-6 pl-4 w-full gap-3 text-[#9899ac] ${
                        item.pathName?.includes(router.pathname)
                          ? 'text-[#e90089] bg-[#1b1b28]'
                          : openIndex === item.id
                          ? 'bg-[#1b1b28]'
                          : 'text-gray-700'
                      }`}
                      onClick={() => handleToggle(item.id)}
                    >
                      <div className="flex gap-3 items-center">
                        <item.Icon className="text-xl text-[#5a6080]" />
                        <span className={`ml-2 ${isParentPathActive(item.subItem) ? 'text-white' : 'text-gray-400'}`}>
                          {item.name}
                        </span>
                      </div>
                      {item.subItem && item.subItem.length > 0 && (
                        <span className="text-white">
                          <ArrowLeft
                            className={`transition-all ease-in-out duration-500 ${
                              openIndex == item.id ? '-rotate-90' : ''
                            } text-3xl hover:shadow-xl rounded-full text-[#e90089]`}
                          />
                        </span>
                      )}
                    </div>

                    <div
                      className={`overflow-hidden w-full transition-all ease-in-out duration-500 ${
                        item.subItem && item.subItem.length > 0 && openIndex === item.id ? 'max-h-screen' : 'max-h-0'
                      }`}
                    >
                      {item.subItem?.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subItem.path[0]}
                          className="flex items-center hover:bg-[#1b1b28] py-2.5 text-sm px-6 w-full gap-3 text-[#9899ac]"
                        >
                          <subItem.Icon
                            className={`mr-4 text-sm ${
                              subItem.path?.includes(router.pathname) ? 'text-[#e90089]' : 'text-[#5a6080]'
                            }`}
                          />
                          <span
                            className={`${subItem.path?.includes(router.pathname) ? 'text-white' : 'text-gray-400'}`}
                          >
                            {subItem.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
              <LogoutButton isShowDrawer />
          </div>
        </aside>
      </Drawer>
    </div>
  )
}
