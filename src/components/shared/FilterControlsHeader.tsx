import { ArrowLeftIcon, NotificationIcon } from '@/icons'
import { useRouter } from 'next/router'

interface Props {
  title: string
  isProfile?: boolean
}
const FilterControlsHeader: React.FC<Props> = ({ title,isProfile }) => {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <header className={`${isProfile ? "bg-[#D8DFF4] py-4" : "bg-white shadow-filter-control"} py-2 px-4 fixed z-[9999] w-full flex justify-between items-center`}>
      <div className="flex items-center gap-3 w-full text-lg font-medium">
        <button onClick={handleBack} className={` ${isProfile ? "bg-white rounded-full w-fit p-1" : "py-4"} -rotate-90 font-bold`}>
          <ArrowLeftIcon width="24px" height="24px"/>
        </button>
        {!isProfile && title}
      </div>
      <button type='button' className={`${isProfile ? "bg-white rounded-full w-fit p-1" : "py-4"}`}>
        <NotificationIcon  width="24px" height="24px"/>
      </button>
    </header>
  )
}

export default FilterControlsHeader
