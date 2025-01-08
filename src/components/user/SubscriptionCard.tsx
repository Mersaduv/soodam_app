import { SmallArrowLeftIcon } from '@/icons'
import { SubscriptionPlan } from '@/types'
import { Button } from '../ui'

interface SubscriptionCardProps {
  plan: SubscriptionPlan
  onSelect: (plan: SubscriptionPlan) => void
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ plan, onSelect }) => {
  return (
    <div onClick={() => onSelect(plan)} className="bg-white rounded-lg hover:bg-slate-50 cursor-pointer">
      {/* <div className="flex justify-between items-center absolute">
        {plan.discount && <span className="text-red-500 text-sm">تخفیف {plan.discount}%</span>}
      </div> */}
      <div className="flex items-center justify-between w-full">
        <p className="text-[#7A7A7A] font-normal text-[12px] farsi-digits">
          بازدید {plan.viewLimit === -1 ? 'نامحدود' : plan.viewLimit} فایل (
          {new Intl.NumberFormat('fa-IR').format(plan.price)} تومان)
        </p>
        <button className="w-[32px] h-[32px] flex-center bg-[#D52133] rounded-full">
        <SmallArrowLeftIcon />
      </button>
      </div>
    </div>
  )
}

export default SubscriptionCard
