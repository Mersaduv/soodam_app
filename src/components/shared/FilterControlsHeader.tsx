import { ArrowLeftIcon, NotificationIcon } from '@/icons'
import { useRouter } from 'next/router'

const FilterControlsHeader = ({ title }) => {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <header className="bg-white py-2 shadow-filter-control px-4 fixed z-[9999] w-full flex justify-between items-center">
      <div className="flex items-center gap-3 w-full text-lg font-medium">
        <button onClick={handleBack} className="py-4 -rotate-90 font-bold">
          <ArrowLeftIcon width="24px" height="24px"/>
        </button>
        {title}
      </div>
      <NotificationIcon  width="24px" height="24px"/>
    </header>
  )
}

export default FilterControlsHeader
