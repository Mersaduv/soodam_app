import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

import { useChangeRoute, useDebounce } from '@/hooks'

import { Button, CustomCheckbox, TextField } from '@/components/ui'

import { Category, QueryParams } from '@/types'
import { NextPage } from 'next'
import { ClientLayout } from '@/components/layouts'
import { useGetCategoriesQuery, useGetMetaDataQuery } from '@/services'
import { Disclosure } from '@headlessui/react'
import { ArrowLeftIcon } from '@/icons'
import { useFilters } from '@/hooks/use-filter'
import { useLazyGetFeaturesByCategoryQuery } from '@/services/productionBaseApi'
type FilterKeys =
  | 'priceRangeFrom'
  | 'priceRangeTo'
  | 'depositRangeFrom'
  | 'depositRangeTo'
  | 'rentFrom'
  | 'rentTo'
  | 'capacityFrom'
  | 'capacityTo'
  | 'extraPeopleFrom'
  | 'extraPeopleTo'
  | 'producerProfitPercentageFrom'
  | 'producerProfitPercentageTo'
  | 'ownerProfitPercentageFrom'
  | 'ownerProfitPercentageTo'

type FiltersType = Partial<Record<FilterKeys, string>>
const FilterControls: NextPage = (props) => {
  // ? Props

  return (
    <>
      <ClientLayout title="فیلتر" >
       <div>
        در حال ادغام با بک اند
       </div>
      </ClientLayout>
    </>
  )
}


export default FilterControls
