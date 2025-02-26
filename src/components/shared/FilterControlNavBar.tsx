import { useRouter } from 'next/router'

import { sorts } from '@/utils'

import { Check, Close, HomeIcon, SearchNormalIcon, Sort as SortIcon } from '@/icons'

import { useChangeRoute, useDebounce, useDisclosure } from '@/hooks'

import { Modal } from '@/components/ui'
import { useState, useRef, useEffect } from 'react'
import { QueryParams } from '@/types'
import { useGetSingleCategoryQuery } from '@/services'

interface Props {}
const FilterControlNavBar: React.FC = () => {
  // ? Assets
  const { query, push } = useRouter()
  const type = query?.type?.toString() ?? ''

  // const getCategoryName = (id: string): string => {
  //   const { data } = useGetSingleCategoryQuery({ id })
  //   return data?.data.name
  // }
  // const categoryId = query.category as string
  // const categoryName = categoryId ? getCategoryName(categoryId) : null
  const categoryId = query.category as string
  const { data } = useGetSingleCategoryQuery({ id: categoryId }, { skip: !categoryId })
  const categoryName = data?.data.name

  const filterGroups: Record<string, string[]> = {
    category: ['category'],
    priceRange: ['priceRangeFrom', 'priceRangeTo'],
    depositRange: ['depositRangeFrom', 'depositRangeTo'],
    rent: ['rentFrom', 'rentTo'],
    capacity: ['capacityFrom', 'capacityTo'],
    extraPeople: ['extraPeopleFrom', 'extraPeopleTo'],
    producerProfit: ['producerProfitPercentageFrom', 'producerProfitPercentageTo'],
    ownerProfit: ['ownerProfitPercentageFrom', 'ownerProfitPercentageTo'],
  }

  // تابع تولید متن نمایشی برای هر گروه فیلتر
  const getGroupDisplay = (groupName: string, groupKeys: string[]): string | null => {
    if (groupName === 'category' && categoryName) {
      return categoryName
    } else if (groupName === 'priceRange') {
      const from = query.priceRangeFrom as string
      const to = query.priceRangeTo as string
      if (from && to) return `قیمت`
      else if (from) return `قیمت`
      else if (to) return `قیمت`
    } else if (groupName === 'depositRange') {
      const from = query.depositRangeFrom as string
      const to = query.depositRangeTo as string
      if (from && to) return `ودیعه`
      else if (from) return `ودیعه`
      else if (to) return `ودیعه`
    } else if (groupName === 'rent') {
      const from = query.rentFrom as string
      const to = query.rentTo as string
      if (from && to) return `اجاره`
      else if (from) return `اجاره`
      else if (to) return `اجاره`
    } else if (groupName === 'capacity') {
      const from = query.capacityFrom as string
      const to = query.capacityTo as string
      if (from && to) return `ظرفیت`
      else if (from) return `ظرفیت`
      else if (to) return `ظرفیت`
    } else if (groupName === 'extraPeople') {
      const from = query.extraPeopleFrom as string
      const to = query.extraPeopleTo as string
      if (from && to) return `نفرات اضافه`
      else if (from) return `نفرات اضافه`
      else if (to) return `نفرات اضافه`
    }
    // می‌توانید برای سایر گروه‌ها (مانند capacity، extraPeople و غیره) موارد مشابه را اضافه کنید
    return null
  }

  const removeFilterGroup = (groupKeys: string[]) => {
    const newQuery = { ...query }
    groupKeys.forEach((key) => delete newQuery[key])
    push({ query: newQuery })
  }

  const appliedFilterGroups = Object.entries(filterGroups)
    .filter(([_, groupKeys]) => groupKeys.some((key) => key in query))
    .map(([groupName, groupKeys]) => ({
      groupName,
      groupKeys,
      displayText: getGroupDisplay(groupName, groupKeys),
    }))
    .filter(({ displayText }) => displayText !== null)

  // ? Ref
  const containerRef = useRef<HTMLDivElement>(null)

  // ? Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current
    if (!container) return

    let startX = e.pageX - container.offsetLeft
    let scrollLeft = container.scrollLeft

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX - container.offsetLeft
      const walk = (x - startX) * 1 // سرعت اسکرول
      container.scrollLeft = scrollLeft - walk
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleNavigate = () => {
    push('/filterControls')
  }

  // ? Render(s)
  return (
    <div ref={containerRef} className="flex gap-x-2 hide-scrollbar cursor-grab pr-4" onMouseDown={handleMouseDown}>
      <div
        onClick={handleNavigate}
        className={`w-fit ${
          appliedFilterGroups.length > 0 && 'bg-[#D52133] text-white farsi-digits'
        } cursor-pointer whitespace-nowrap my-[12px] flex-center px-4 font-normal text-[16px] border rounded-[59px] h-[40px] text-[#7A7A7A]`}
      >
        {appliedFilterGroups.length > 0 && appliedFilterGroups.length} فیلتر ها
      </div>
      {appliedFilterGroups.map(({ groupName, groupKeys, displayText }) => (
        <div
          key={groupName}
          className="cursor-pointer w-fit my-[12px] flex-center gap-1 px-4 pl-2 font-normal text-sm border rounded-[59px] h-[40px] bg-[#D52133] text-white"
        >
          <span className="font-normal whitespace-nowrap text-[16px] text-white">{displayText}</span>
          <button onClick={() => removeFilterGroup(groupKeys)} className="text-white font-bold">
            <Close className=" text-white text-2xl" />
          </button>
        </div>
      ))}

      {/* <div
        className={`cursor-pointer w-fit my-[12px] flex-center gap-1 px-4 font-normal text-sm border rounded-[59px] h-[40px]`}
      >
        <span className={`font-normal whitespace-nowrap text-[16px] text-[#7A7A7A]`}>فیلتر یک</span>
      </div>
      <div
        className={`cursor-pointer w-fit my-[12px] flex-center gap-1 px-4 font-normal text-sm border rounded-[59px] h-[40px]`}
      >
        <span className={`font-normal whitespace-nowrap text-[16px] text-[#7A7A7A]`}>فیلتر دو</span>
      </div> */}
    </div>
  )
}

export default FilterControlNavBar
