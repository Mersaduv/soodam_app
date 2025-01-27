import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { setIsShowLogin, updateUser } from '@/store'
import { ArrowLeftIcon, RegisterAdIcon, TicketStarIcon, InfoCircleMdIcon, TicketDiscountIcon } from '@/icons'
import { useEffect, useState } from 'react'
import { SubscriptionPlan } from '@/types'
import { SubscriptionCard } from '@/components/user'
import { useGetSubscriptionsQuery, useGetSubscriptionStatusQuery, usePurchaseSubscriptionMutation } from '@/services'
import { Button } from '@/components/ui'
import { toast } from 'react-toastify'

// try {
//   await purchaseSubscription({
//     phoneNumber,
//     planType: selectedPlan.duration,
//     planId: selectedPlan.id,
//     referralCode
//   }).unwrap()

//   dispatch(showAlert({
//     title: 'موفق',
//     message: 'اشتراک با موفقیت خریداری شد',
//     status: 'success'
//   }))

//   push('/')
// } catch (error) {
//   dispatch(showAlert({
//     title: 'خطا',
//     message: error.data?.message || 'خطا در خرید اشتراک',
//     status: 'error'
//   }))
// }

const SubscriptionPage: NextPage = () => {
  // ? Assets
  const { query, events, push } = useRouter()
  const dispatch = useAppDispatch()
  const { role, phoneNumber } = useAppSelector((state) => state.auth)
  // ? States
  const [referralCode, setReferralCode] = useState('')
  const [subscriptionStatus, setSubscriptionStatus] = useState('')
  // ? Queries
  const { data: statusData, error } = useGetSubscriptionStatusQuery(phoneNumber)
  const { data: subscriptionPlans, isLoading, isFetching } = useGetSubscriptionsQuery()
  const [purchaseSubscription, { isLoading: isPurchasing }] = usePurchaseSubscriptionMutation()
  // ? handlers
  const handleNavigate = (): void => {
    push('/requests/new')
  }

  const handlePurchase = async (plan: SubscriptionPlan) => {
    if (!plan || !phoneNumber) return
    try {
      const response = await purchaseSubscription({
        phoneNumber,
        planType: plan.duration,
        planName: plan.title,
        referralCode: referralCode || undefined,
      }).unwrap()

      console.log(response, 'response--selectedPlan')
      if (response.data) {
        // Update auth state or show success message
        dispatch(updateUser(response.data))
        toast.success(response.message)
        push('/')
      }
    } catch (error) {
      console.log(error, 'error')
      toast.error('خطا در خرید اشتراک')
    }
  }
  useEffect(() => {
    if (statusData && Object.keys(statusData).length > 0) {
      console.log(statusData, 'statusData--statusData')
      const now = new Date()
      const endDate = new Date(statusData.data.endDate)

      // تبدیل تاریخ‌ها به میلی‌ثانیه با استفاده از getTime()
      const timeDiff = endDate.getTime() - now.getTime() // تفاوت زمانی به میلی‌ثانیه

      if (timeDiff <= 0) {
        setSubscriptionStatus('منقضی شده')
        return
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) // محاسبه تعداد روزها
      setSubscriptionStatus(`${days} روز`)
    }
  }, [statusData])

  if (isLoading) return <div>loading ...</div>
  // ? Render(s)
  return (
    <>
      <ClientLayout title="خرید اشتراک">
        <main className="py-[100px] px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-[16px] p-4 relative border mb-6">
              <div className="flex justify-between items-start gap-4">
                <div className="p-1">
                  <h2 className="font-medium">اشتراک باقی مانده</h2>
                  <p className="text-red-500 mt-1 farsi-digits">{subscriptionStatus}</p>
                </div>
                <img src="/static/analyze-data.png" alt="subscription" className="w-24" />
              </div>
            </div>

            <div className="space-y-6">
              <SubscriptionSection
                title="اشتراک ماهیانه"
                plans={subscriptionPlans.data.filter((plan) => plan.duration === 'MONTHLY')}
                onSelect={handlePurchase}
              />

              <SubscriptionSection
                title="اشتراک سه ماهه"
                plans={subscriptionPlans.data.filter((plan) => plan.duration === 'QUARTERLY')}
                onSelect={handlePurchase}
              />

              <SubscriptionSection
                title="اشتراک سالانه"
                plans={subscriptionPlans.data.filter((plan) => plan.duration === 'YEARLY')}
                onSelect={handlePurchase}
              />
            </div>

            <div className="bg-white flex justify-between items-center rounded-[16px] h-[64px] px-4 relative border mt-6">
              <div className="flex-center gap-2">
                <div className="w-[32px] h-[32px] flex-center bg-[#FFF0F2] rounded-[10px]">
                  <InfoCircleMdIcon width="24px" height="24px" />
                </div>
                <div>اطلاعات بیشتر</div>
              </div>
              <ArrowLeftIcon width="24px" height="24px" className={`text-gray-700 rotate-90 transition-all`} />
            </div>

            <div className="bg-white flex flex-col rounded-[16px] p-4 border mt-6">
              <label htmlFor="referral-code" className="flex items-center justify-start gap-2 w-full">
                <div className="w-[32px] h-[32px] flex-center bg-[#FFF0F2] rounded-[10px]">
                  <TicketDiscountIcon width="24px" height="24px" />
                </div>
                <div className="text-[15px] font-medium">کد معرف</div>
              </label>
              <hr className="my-3 mb-4" />
              <div className="">
                <input
                  id="referral-code"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="کد معرف خود را وارد کنید."
                  className="w-full border rounded-lg p-2 placeholder:text-sm"
                />
              </div>
              <Button type="button" className="w-full text-white rounded-lg py-3 mt-4">
                تایید کد
              </Button>
            </div>
          </div>
        </main>
      </ClientLayout>
    </>
  )
}
const SubscriptionSection = ({ title, plans, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false)

  const discountedPlan = plans.find((plan) => plan.discount)
  return (
    <div className="bg-white rounded-[16px] p-4 pt-0 relative border">
      <div className="flex pt-4 rounded-lg justify-end items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <ArrowLeftIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      <div>
        {discountedPlan && (
          <div className="text-white bg-[#D52133] absolute -top-[14px] rounded-lg text-sm font-normal w-[94px] h-[24px] flex-center farsi-digits">
            {discountedPlan.discount} %<span className="mr-1 text-sm font-normal text-white">تخفیف</span>
          </div>
        )}
      </div>
      <div className="flex items-center w-full gap-3">
        <div className="w-[40px] h-[40px] bg-[#E0FBF5] flex-center rounded-lg px-2 py-1">
          <TicketStarIcon width="24px" height="25px" />
        </div>
        <div className="flex flex-col w-full">
          <h2 className={`font-bold ${isOpen && '-mb-4'} text-[14px] farsi-digits`}>{title}</h2>
          {!isOpen && <SubscriptionCard key={plans[0].id} plan={plans[0]} onSelect={onSelect} />}
          <div
            className={`space-y-2 transition-all duration-300 w-full overflow-hidden ${
              isOpen ? 'max-h-[1000px] mt-4' : 'max-h-0'
            }`}
          >
            {plans.map((plan) => (
              <SubscriptionCard key={plan.id} plan={plan} onSelect={onSelect} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(SubscriptionPage), { ssr: false })
