import { useAppDispatch, useAppSelector } from '@/hooks'
import { ArrowLeftIcon, NotificationIcon } from '@/icons'
import { setAdConfirmExit, setMapMode, setRefetchMap } from '@/store'
import router, { useRouter } from 'next/router'

interface Props {
  title: string
  isProfile?: boolean
  isAdConfirmExit?: boolean
  handleRemoveFilters?: () => void
  isAdmin?: boolean
}
const FilterControlsHeader: React.FC<Props> = ({ title, isProfile, isAdConfirmExit, handleRemoveFilters, isAdmin }) => {
  const { back, push } = useRouter()
  const dispatch = useAppDispatch()
  const { adConfirmExit } = useAppSelector((state) => state.statesData)
  const handleBack = () => {
    // dispatch(setMapMode(true))
    if (isAdConfirmExit && adConfirmExit === '') {
      dispatch(setAdConfirmExit('0'))
      return
    }
    if (handleRemoveFilters) {
      push('/')
    } else {
      back()
    }
  }

  return (
    <header
      className={`${isProfile ? 'bg-[#D8DFF4] py-4' : `${isAdmin ? 'bg-[#F6F7FB]' : 'bg-white shadow-filter-control'} `} ${
        isAdmin ? 'bg-[#F6F7FB]' : ''
      } py-2 px-4 fixed z-[9999] w-full flex justify-between items-center`}
    >
      <div className="flex items-center gap-3 w-full text-lg font-medium">
        {adConfirmExit !== '0' && (
          <button
            onClick={handleBack}
            className={` ${isProfile ? 'bg-white rounded-full w-fit p-1' : 'py-4'} -rotate-90 font-bold`}
          >
            <ArrowLeftIcon width="24px" height="24px" />
          </button>
        )}

        {!isProfile && title}
      </div>
      {handleRemoveFilters ? (
        <button
          type="button"
          className={`bg-white rounded-full w-fit p-1 font-semibold whitespace-nowrap text-[#D52133] text-[16px]`}
          onClick={handleRemoveFilters}
        >
          حذف فیلتر ها
        </button>
      ) : (
        <button type="button" className={`${isProfile ? 'bg-white rounded-full w-fit p-1' : 'py-4'}`}>
          {!isAdmin && <NotificationIcon width="24px" height="24px" />}
        </button>
      )}
    </header>
  )
}

export default FilterControlsHeader
