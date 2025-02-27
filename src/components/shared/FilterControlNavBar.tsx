import { useRouter } from 'next/router'

import { sorts } from '@/utils'

import { Check, Close, HomeIcon, SearchNormalIcon, Sort as SortIcon } from '@/icons'

import { useChangeRoute, useDebounce, useDisclosure } from '@/hooks'

import { Modal } from '@/components/ui'
import { useState, useRef, useEffect, useMemo } from 'react'
import { QueryParams } from '@/types'
import { useGetFeaturesQuery, useGetSingleCategoryQuery } from '@/services'

interface Props {}
const FilterControlNavBar: React.FC = () => {
  // ? Assets
  const { query, push } = useRouter()
  const type = query?.type?.toString() ?? ''

  const categoryId = query.category as string
  const { data } = useGetSingleCategoryQuery({ id: categoryId }, { skip: !categoryId })
  const { data: featuresData } = useGetFeaturesQuery({ pageSize: 9999 })
  const categoryName = data?.data.name
  const featureIdToName = useMemo(() => {
    if (!featuresData?.data) return {};
    return featuresData.data.reduce((acc, feature) => {
      acc[feature.id] = feature.name;
      return acc;
    }, {} as Record<string, string>);
  }, [featuresData]);
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

  // استخراج کلیدهای ویژگی‌های پویا
  const getFeatureKeys = () => {
    const featureKeys: Record<string, string[]> = {}
    Object.keys(query).forEach((key) => {
      const isStaticKey = Object.values(filterGroups).some((group) => group.includes(key))
      if (!isStaticKey) {
        if (key.endsWith('-From') || key.endsWith('-To')) {
          const baseKey = key.replace(/-From|-To/, '')
          if (!featureKeys[baseKey]) {
            featureKeys[baseKey] = []
          }
          featureKeys[baseKey].push(key)
        } else {
          featureKeys[key] = [key]
        }
      }
    })
    return featureKeys
  }

  const featureGroups = getFeatureKeys()
  const allFilterGroups = { ...filterGroups, ...featureGroups }

  // تولید متن نمایشی
  const getGroupDisplay = (groupName: string, groupKeys: string[]): string | null => {
    if (groupName === 'category' && query.category) {
      return categoryName as string
    } else if (groupName === 'priceRange') {
      const from = query.priceRangeFrom as string
      const to = query.priceRangeTo as string
      if (from || to) return 'قیمت'
    } else if (groupName === 'depositRange') {
      const from = query.depositRangeFrom as string
      const to = query.depositRangeTo as string
      if (from || to) return 'ودیعه'
    } else if (groupName === 'rent') {
      const from = query.rentFrom as string
      const to = query.rentTo as string
      if (from || to) return 'اجاره'
    } else if (groupName === 'capacity') {
      const from = query.capacityFrom as string
      const to = query.capacityTo as string
      if (from || to) return 'ظرفیت'
    } else if (groupName === 'extraPeople') {
      const from = query.extraPeopleFrom as string
      const to = query.extraPeopleTo as string
      if (from || to) return 'نفرات اضافه'
    } else if (groupName === 'producerProfit') {
      const from = query.producerProfitPercentageFrom as string
      const to = query.producerProfitPercentageTo as string
      if (from || to) return 'درصد سود'
    } else {
      // ویژگی‌های پویا
      const featureName = featureIdToName[groupName] || groupName; // اگر نام نبود، آیدی نمایش داده شود
      if (groupKeys.length === 2 && groupKeys[0].endsWith("-From") && groupKeys[1].endsWith("-To")) {
        const from = query[groupKeys[0]] as string;
        const to = query[groupKeys[1]] as string;
        if (from || to) {
          // return `${featureName}: ${from ? `از ${from}` : ""} ${to ? `تا ${to}` : ""}`.trim();
          return `${featureName}`.trim();
        }
      } else if (groupKeys.length === 1) {
        const value = query[groupKeys[0]] as string;
        if (value) {
          return `${featureName}`;
          // return `${featureName}: ${value}`;
        }
      }
    }
    return null
  }

  const removeFilterGroup = (groupKeys: string[]) => {
    const newQuery = { ...query }
    groupKeys.forEach((key) => delete newQuery[key])
    push({ query: newQuery })
  }

  const appliedFilterGroups = Object.entries(allFilterGroups)
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
    push({ pathname: '/filterControls', query })
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
    </div>
  )
}

export default FilterControlNavBar
