import React, { useEffect, useState } from 'react'
import { useForm, Controller, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  ArrowLeftIcon,
  CheckIcon,
  HouseIcon,
  InfoCircleIcon,
  RepeatIcon,
  CalendarIcon,
  CalendarTickIcon,
  CalendarSearchIcon,
  ProfileAddIcon,
  CameraIcon,
  CameraSmIcon,
  PictureSmIcon,
  VideoSmIcon,
  VideoIcon,
  Cube3DSmIcon,
  Cube3DIcon,
} from '@/icons'
import { Button, CustomCheckbox, DisplayError, Modal, TextField, TextFiledPrice } from '@/components/ui'
import * as yup from 'yup'
import dynamic from 'next/dynamic'
import { useDisclosure } from '@/hooks'
import { Disclosure } from '@headlessui/react'
import {
  useGetCategoriesQuery,
  useGetFeaturesQuery,
  useGetMetaDataQuery,
} from '@/services'
import { useRouter } from 'next/router'
import { AdFormValues, Category, Feature, RequestFormValues } from '@/types'
import { validationRequestSchema, validationSchema } from '@/utils'
import { IoMdClose } from 'react-icons/io'
import { useLazyGetFeaturesByCategoryQuery } from '@/services/productionBaseApi'
const MapLocationPicker = dynamic(() => import('@/components/map/MapLocationPicker'), { ssr: false })

const RequestRegistrationForm: React.FC = () => {
  // ? Assets
  const { query } = useRouter()
 
  return (
    <div className="relative mb-44">
      درحال ادغام با بک اند
    </div>
  )
}

export default RequestRegistrationForm
