import { useAppDispatch, useAppSelector } from '@/hooks'
import { FrameIcon, HearthIcon, BedIcon, Grid2Icon, BulidingIcon, LocationSmIcon, ArrowRedIcon } from '@/icons'
import { toggleSaveHouse } from '@/store'
import { Estate, Housing } from '@/types'
import { getProvinceFromCoordinates } from '@/utils'
import { feature } from '@turf/turf'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  estate: Estate
  onCardClick: (estate: Estate) => void
}

const EstateCard: React.FC<Props> = (props) => {
  const { estate, onCardClick } = props
  return (
    <div
      className="bg-white flex items-center rounded-2xl border border-[#E3E3E7] w-full h-[85px]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col justify-center w-full px-3">
        <Link href={`/estate-consultant/${estate.id}?estateName=${estate.name}`} className="flex items-center justify-between gap-2 h-full w-full">
          {estate.image && (
            <div className=" bg-gray-200 rounded-[10px] flex items-center justify-center  ">
              <Image
                width={104}
                height={100}
                className="rounded-[10px] min-w-[63px] max-w-[63px] h-[61px] object-cover"
                src={estate.image}
                alt={estate.name}
              />
            </div>
          )}
          <div className="flex justify-between gap-2 flex-1">
            <div className="flex flex-col gap-2 h-[61px]">
              <div className="flex items-center gap-1">
                <div className="line-clamp-1 overflow-hidden text-ellipsis text-base font-normal">
                  {estate.name}dasd as as asd as dsf svgdsf
                </div>
                <div className="text-sm font-normal text-[#7A7A7A] whitespace-nowrap farsi-digits">{`(تعداد فایل ${estate.housing.length} )`}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <LocationSmIcon width="16px" height="16px" />
                <div className="text-xs font-normal text-[#7A7A7A]">{estate.address}</div>
              </div>
            </div>
            <div className='-ml-0.5 mt-0.5'>
              <ArrowRedIcon width="24px" height="24px" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default EstateCard
