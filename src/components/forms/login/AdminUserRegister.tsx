import React, { useEffect, useState } from 'react'
import { useForm, Controller, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/router'
import { Button, DisplayError, Combobox, TextField } from '@/components/ui'
import { ArrowLeftIcon, CameraIcon } from '@/icons'
import { AdminRegisterForm } from '@/types'
import { adminFormValidationSchema } from '@/utils/validation'
import { getToken, NEXT_PUBLIC_API_URL } from '@/utils'
import axios from 'axios'
import Link from 'next/link'
import Image from 'next/image'

const AdminUserRegister: React.FC = () => {
  const { push, back, query } = useRouter()
  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdminRegisterForm>({
    resolver: yupResolver(adminFormValidationSchema) as unknown as Resolver<AdminRegisterForm>,
    mode: 'onChange',
  })
  const selectedProvince = watch('province')

  useEffect(() => {
    // For demo purposes, use mock data for provinces
    const mockProvinces = [
      { id: 1, name: 'تهران' },
      { id: 2, name: 'اصفهان' },
      { id: 3, name: 'خراسان رضوی' },
      { id: 4, name: 'فارس' },
      { id: 5, name: 'مازندران' },
    ]
    setProvinces(mockProvinces)
  }, [])

  useEffect(() => {
    if (selectedProvince?.id) {
      // For demo purposes, use mock data for cities
      const mockCities = {
        1: [
          { id: 101, name: 'تهران', province_id: 1 },
          { id: 102, name: 'شهریار', province_id: 1 },
          { id: 103, name: 'اسلامشهر', province_id: 1 },
        ],
        2: [
          { id: 201, name: 'اصفهان', province_id: 2 },
          { id: 202, name: 'کاشان', province_id: 2 },
          { id: 203, name: 'نجف‌آباد', province_id: 2 },
        ],
        3: [
          { id: 301, name: 'مشهد', province_id: 3 },
          { id: 302, name: 'نیشابور', province_id: 3 },
          { id: 303, name: 'سبزوار', province_id: 3 },
        ],
        4: [
          { id: 401, name: 'شیراز', province_id: 4 },
          { id: 402, name: 'مرودشت', province_id: 4 },
          { id: 403, name: 'کازرون', province_id: 4 },
        ],
        5: [
          { id: 501, name: 'ساری', province_id: 5 },
          { id: 502, name: 'بابل', province_id: 5 },
          { id: 503, name: 'آمل', province_id: 5 },
        ],
      }
      
      setCities(mockCities[selectedProvince.id] || [])
      setValue('city', { name: '', id: 0 })
    } else {
      setCities([])
      setValue('city', { name: '', id: 0 })
    }
  }, [selectedProvince, setValue])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)
    
    try {
      setIsLoading(true)
      
      // Create a local preview of the image as base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        setProfileImage(imageUrl) // Store base64 image directly
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to safely save to localStorage
  const safeSetItem = (key: string, value: string): boolean => {
    try {
      // Clear localStorage if it's getting too large (over 4MB)
      if (JSON.stringify(localStorage).length > 4000000) {
        // Only clear adminRequests, not everything
        localStorage.removeItem('adminRequests');
      }
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error('LocalStorage error:', e);
      // Show an alert instead of throwing error
      alert('حافظه محلی پر شده است. برخی داده‌های قدیمی پاک می‌شوند.');
      try {
        // Try again after clearing
        localStorage.removeItem('adminRequests');
        localStorage.setItem(key, value);
        return true;
      } catch (e2) {
        console.error('Failed after cleanup:', e2);
        return false;
      }
    }
  }

  const onSubmit = async (data: AdminRegisterForm) => {
    try {
      setIsLoading(true)
      
      const requestData = {
        id: Date.now(), // Use timestamp as ID
        full_name: data.full_name || '',
        phone_number: data.phone_number || '',
        email: data.email || '',
        province: data.province?.name || '',
        city: data.city?.name || '',
        role_type: query.role || 'admin_city',
        status: 'pending',
        created_at: new Date().toISOString(),
        profile_image: profileImage,
        security_number: data.security_number || ''
      }
      
      // Save to mock storage in localStorage
      try {
        // Get existing requests
        let adminRequests = [];
        try {
          adminRequests = JSON.parse(localStorage.getItem('adminRequests') || '[]');
        } catch (e) {
          console.error('Error parsing existing requests:', e);
          adminRequests = [];
        }
        
        // Add new request
        adminRequests.push(requestData);
        
        // Save back to localStorage with error handling
        if (safeSetItem('adminRequests', JSON.stringify(adminRequests))) {
          push('/admin/authentication/register/success');
        } else {
          alert('ثبت درخواست با خطا مواجه شد. لطفاً مجدداً تلاش نمایید.');
        }
      } catch (error) {
        console.error('Error storing data in localStorage:', error);
        alert('مشکلی در ذخیره‌سازی اطلاعات رخ داده است.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleBack = () => {
    back()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pb-10">
      <div className="m-4 pt-7 px-1">
        <div className="space-y-2">
          <h1 className="font-bold text-lg">خوش آمدید!</h1>
          <p className="text-sm">برای درخواست ثبت نام اطلاعات خود را وارد کنید.</p>
        </div>

        {/* Profile Image Upload */}
        <div className="flex justify-center mt-6 mb-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-[#2C3E50]"
          >
            {profileImage ? (
              <div className="w-full h-full relative">
                <Image src={profileImage} alt="Profile" layout="fill" objectFit="cover" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <CameraIcon className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">آپلود تصویر</span>
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className=" mt-5 space-y-4">
          <Controller
            name="full_name"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                adminHeight
                placeholder="نام و نام خانوادگی"
                {...field}
                control={control}
                errors={errors.full_name}
              />
            )}
          />

          <Controller
            name="phone_number"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                adminHeight
                type="number"
                {...field}
                control={control}
                errors={errors.phone_number}
                placeholder="شماره موبایل"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                adminHeight
                type="email"
                placeholder="ایمیل"
                {...field}
                control={control}
                errors={errors.email}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                adminHeight
                placeholder="رمز عبور"
                type="password"
                {...field}
                control={control}
                errors={errors.password}
              />
            )}
          />

          <Controller
            name="confirm_password"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                adminHeight
                type="password"
                placeholder="تکرار رمز عبور"
                {...field}
                control={control}
                errors={errors.confirm_password}
              />
            )}
          />

          <div className="space-y-1">
            <Combobox control={control} name="province" list={provinces} placeholder="استان" adminHeight />
            {errors.province?.name && <DisplayError errors={errors.province?.name} />}
          </div>
          <div className="space-y-1">
            <Combobox control={control} name="city" list={cities} placeholder="شهر" adminHeight />
            {errors.city?.name && <DisplayError errors={errors.city?.name} />}
          </div>

          <Controller
            name="security_number"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                adminHeight
                placeholder="کد ملی"
                {...field}
                control={control}
                errors={errors.security_number}
              />
            )}
          />
        </div>
      </div>

      <div className="px-4 mt-10">
        <Button 
          type="submit" 
          className="w-full py-[14px] font-bold text-sm rounded-lg bg-[#2C3E50]"
          disabled={isLoading}
        >
          {isLoading ? 'در حال ثبت...' : 'ثبت نام درخواست'}
        </Button>
      </div>
      <div className="px-4 mt-6 pb-10 flex justify-center items-center gap-1">
        <p className="text-sm">قبلا حساب ساخته اید؟</p>
        <Link href="/admin/authentication/login" className="text-blue-600 text-[13px] font-semibold">
          وارد شوید
        </Link>
      </div>
    </form>
  )
}

export default AdminUserRegister
