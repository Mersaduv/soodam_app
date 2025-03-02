import { useAppDispatch, useAppSelector } from '@/hooks'
import { FrameIcon, HearthIcon, BedIcon, Grid2Icon, BulidingIcon } from '@/icons'
import { toggleSaveHouse } from '@/store'
import { Housing } from '@/types'
import { feature } from '@turf/turf'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  housing: Housing
}

const HousingCard: React.FC<Props> = (props) => {
  const { housing } = props
  const dispatch = useAppDispatch()

  const isSelling = housing.price > 0
  const isNew = (() => {
    const createdDate = new Date(housing.created)
    const today = new Date()
    const diffInDays = (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    return diffInDays <= 2
  })()

  const handleSaveClick = (event: React.MouseEvent<HTMLDivElement>, housing: Housing) => {
    event.preventDefault()
    event.stopPropagation()
    dispatch(toggleSaveHouse({ id: housing.id, savedTime: new Date().toISOString() }))
  }

  const isSaved = useAppSelector((state) => state.saveHouse.savedHouses.some((item) => item.id === housing.id))

  return (
    <Link href={`/housing/${housing.adCode}`} className="block w-[353px] bg-white rounded-2xl">
      <article className="flex flex-col flex-1 items-center justify-start rounded-2xl border-[1.5px] border-[#E3E3E7] h-full p-4 relative">
        <>
          <Image
            width={321}
            height={100}
            className="rounded-2xl h-[183px] object-cover"
            src={housing.images[0]}
            alt={housing.title}
          />
        </>
        {isNew && (
          <div className="top-[180px] -right-[8.4px] absolute">
            <div className=" flex-center -mr-[0.7px]  h-[31.32px] w-[89.03px]  bg-[#D52133] text-white text-xs px-3 py-1 rounded-lg rounded-br-[0.2px]">
              <FrameIcon width="17px" height="17px" />
              <span className="text-xs text-white font-bold">جدید</span>
            </div>
            <div className="triangle -mr-[0.75px] -mt-[0.2px]" />
          </div>
        )}
        <div className="w-full flex justify-between mt-9">
          <div className="flex-center gap-2">
            <div className={`h-3 w-3 rounded-full bg-[#17A586]`} />
            <div className="text-base font-medium text-[#5A5A5A] line-clamp-1 overflow-hidden text-ellipsis">
              {housing.title}
            </div>
          </div>
          <div className="-mt-2">
            <div
              id="saveHouse"
              className={`border-[1.5px] p-2 pt-[9.5px] rounded-full flex-center ${
                isSaved ? 'text-[#D52133]' : 'text-white'
              }`}
              onClick={(event) => handleSaveClick(event, housing)}
            >
              <HearthIcon width="15px" height="13px" />
            </div>
          </div>
        </div>
        <div className="w-full mt-3 text-right">
          {/* نمایش قیمت فروش یا رهن و اجاره */}
          {housing.price > 0 ? (
            <div className="text-[16px] farsi-digits text-[#1A1E25] font-extrabold flex gap-1">
              <div className="font-semibold"> {housing.price.toLocaleString('de-DE')}</div> تومان
            </div>
          ) : housing.deposit > 0 || housing.rent > 0 ? (
            <div className="text-[16px] farsi-digits text-[#1A1E25] font-extrabold">
              {housing.deposit > 0 && (
                <div className="flex gap-1">
                  {' '}
                  رهن: <div className="font-semibold">{housing.deposit.toLocaleString('de-DE')}</div> تومان{' '}
                </div>
              )}{' '}
              {housing.rent > 0 && (
                <div className="flex gap-1">
                  اجاره: <div className="font-semibold">{housing.rent.toLocaleString('de-DE')} </div>تومان
                </div>
              )}
            </div>
          ) : null}

          {/* نمایش درصد سود مالک و سازنده */}
          {(housing.ownerProfitPercentage > 0 || housing.producerProfitPercentage > 0) && (
            <div className="mt-2 text-sm text-[#7A7A7A]">
              {housing.ownerProfitPercentage > 0 && <p>سود مالک: {housing.ownerProfitPercentage}%</p>}
              {housing.producerProfitPercentage > 0 && <p>سود سازنده: {housing.producerProfitPercentage}%</p>}
            </div>
          )}

          {/* نمایش ظرفیت و نفرات اضافه */}
          {(housing.capacity > 0 || housing.extraPeople > 0 || (housing.rentalTerm && housing.rentalTerm.name)) && (
            <div className="mt-2 text-sm text-[#7A7A7A]">
              {housing.capacity > 0 && <p>ظرفیت: {housing.capacity} نفر</p>}
              {housing.extraPeople > 0 && <p>نفرات اضافه: {housing.extraPeople} نفر</p>}
              {housing.rentalTerm?.name && <p>نوع قرارداد: {housing.rentalTerm.name}</p>}
            </div>
          )}

          <hr className="border-[1px] border-[#E3E3E7] my-4" />
        </div>
        <div className="w-full text-right text-[#7A7A7A] text-sm flex justify-between">
          {housing.highlightFeatures &&
            housing.highlightFeatures.map((feature) => {
              return (
                <div key={feature.id} className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap">
                  {' '}
                  <img className="w-[16px]" src={feature.image} alt="" /> {feature.value}{' '}
                  <span className="font-medium text-[#7A7A7A] text-xs">{feature.title}</span>
                </div>
              )
            })}
          {/* <div className="flex-center gap-1.5 text-xs font-medium farsi-digits">
            <BedIcon width="21px" height="19px" /> {housing.bedrooms}{' '}
            <span className="font-medium text-[#7A7A7A] text-xs">اتاق خواب</span>
          </div>
          <div className="flex-center gap-1.5 font-medium text-xs farsi-digits">
            <Grid2Icon width="16px" height="16px" /> {housing.cubicMeters}{' '}
            <span className="font-medium text-[#7A7A7A] text-xs">متر مربع</span>
          </div>
          <div className="flex-center gap-1.5 font-medium text-xs farsi-digits">
            <BulidingIcon width="16px" height="17px" /> طبقه {housing.onFloor} از {housing.floors}
          </div> */}
        </div>
      </article>
    </Link>
  )
}

export default HousingCard
