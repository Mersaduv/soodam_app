import { useAppDispatch, useAppSelector } from '@/hooks'
import { FrameIcon, HearthIcon, BedIcon, Grid2Icon, BulidingIcon, LocationRedSmIcon, ArrowRedIcon } from '@/icons'
import { toggleSaveHouse } from '@/store'
import { Housing } from '@/types'
import { formatPriceLoc, getProvinceFromCoordinates } from '@/utils'
import { feature } from '@turf/turf'
import Image from 'next/image'

interface Props {
  housing: Housing
  onCardClick: (housing: Housing) => void
  inEstate?: boolean
}

const HousingCard: React.FC<Props> = (props) => {
  const { housing, onCardClick, inEstate } = props
  const dispatch = useAppDispatch()

  const isNew = (() => {
    const createdDate = new Date(housing.created_at)
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
    <>
      {inEstate ? (
        <div className="block w-full bg-white rounded-2xl cursor-pointer" onClick={() => onCardClick(housing)}>
          <article className="flex flex-col items-center justify-start rounded-2xl border-[1.5px] border-[#E3E3E7] h-full p-4 relative">
            <div className="flex gap-3 w-full">
              <>
                {housing.medias && housing.medias.length > 0 ? (
                  <div className=" bg-gray-200 rounded-[10px] mb-4">
                    <Image
                      width={321}
                      height={100}
                      className="rounded-2xl h-[104px] min-w-[104px] max-w-[104px] object-cover"
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${housing.medias[0].media_url}`}
                      alt={housing.title}
                    />
                  </div>
                ) : (
                  <div className=" bg-gray-200 rounded-[10px] mb-4">
                    <img
                      width={321}
                      height={100}
                      className="rounded-2xl h-[104px] min-w-[104px] max-w-[104px] object-cover"
                      src="/static/R.png"
                      alt={housing.title}
                    />
                  </div>
                )}
              </>
              <div className="w-full">
                <div className="flex items-center gap-1.5 text-[#D52133]">
                  <LocationRedSmIcon width="16px" height="16px" />
                  <div className="text-xs font-normal">{housing.address.province.name}</div>
                </div>
                <div className="w-full flex justify-between mt-1.5">
                  <div className="flex-center gap-2">
                    <div className="text-base font-medium text-[#5A5A5A] line-clamp-1 overflow-hidden text-ellipsis">
                      {housing.title}
                    </div>
                  </div>
                </div>
                <div className="w-full text-right">
                  {/* نمایش قیمت فروش یا رهن و اجاره */}
                  {housing.features
                    .filter((item) => item.key === 'text_selling_price')
                    .map((item) => {
                      return (
                        <>
                          <div className="text-sm mt-1.5 farsi-digits text-[#5A5A5A] flex gap-1">
                            <div className=""> {formatPriceLoc(Number(item.value))}</div> تومان
                          </div>
                        </>
                      )
                    })}

                  {housing.features
                    .filter((item) => item.key === 'text_monthly_rent' || item.key === 'text_mortgage_deposit')
                    .map((item) => {
                      return (
                        <div className="text-sm mt-1.5 farsi-digits text-[#5A5A5A] flex gap-1">
                          <div className=""> {formatPriceLoc(Number(item.value))}</div> تومان
                        </div>
                      )
                    })}

                  {/* نمایش درصد سود مالک و سازنده */}
                  {housing.features
                    .filter(
                      (item) =>
                        item.key === 'text_owner_profit_percentage' || item.key === 'text_producer_profit_percentage'
                    )
                    .map((item) => {
                      return (
                        <div className="">
                          {item.key === 'text_owner_profit_percentage' && (
                            <p className="text-[13px] text-[#5A5A5A] mt-1.5">سود مالک: {item.value as string}%</p>
                          )}
                          {item.key === 'text_producer_profit_percentage' && (
                            <p className="text-[13px] text-[#5A5A5A] mt-1.5">سود سازنده: {item.value as string}%</p>
                          )}
                        </div>
                      )
                    })}

                  {/* نمایش ظرفیت و نفرات اضافه */}
                  {/* {(housing.capacity > 0 ||
                    housing.extraPeople > 0 ||
                    (housing.rentalTerm && housing.rentalTerm.name)) && (
                    <div className=" text-[13px] text-[#5A5A5A]">
                      {housing.capacity > 0 && (
                        <p className="text-[13px] text-[#5A5A5A] mt-1.5">ظرفیت: {housing.capacity} نفر</p>
                      )}
                      {housing.extraPeople > 0 && (
                        <p className="text-[13px] text-[#5A5A5A] mt-1.5">نفرات اضافه: {housing.extraPeople} نفر</p>
                      )}
                      {housing.rentalTerm?.name && (
                        <p className="text-[13px] text-[#5A5A5A] mt-1.5">نوع قرارداد: {housing.rentalTerm.name}</p>
                      )}
                    </div>
                  )} */}
                </div>
              </div>
            </div>
            <hr className="border-[1px] border-[#E3E3E7] my-4 w-full" />
            <div className="flex w-full gap-4">
              <div className="w-full text-right text-[#7A7A7A] text-sm flex justify-between">
                {housing.highlight_features &&
                  housing.highlight_features.map((feature) => {
                    return (
                      <div
                        key={feature.id}
                        className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap"
                      >
                        {' '}
                        <img className="w-[16px]" src={feature.image} alt="" /> {feature.value as string}{' '}
                        <span className="font-medium text-[#7A7A7A] text-xs">{feature.name}</span>
                      </div>
                    )
                  })}
              </div>
              <div className="-ml-0.5 mt-0.5">
                <ArrowRedIcon width="24px" height="24px" />
              </div>
            </div>
          </article>
        </div>
      ) : (
        <div className="block w-[353px] bg-white rounded-2xl cursor-pointer" onClick={() => onCardClick(housing)}>
          <article className="flex flex-col flex-1 items-center justify-start rounded-2xl border-[1.5px] border-[#E3E3E7] h-full p-4 relative">
            <>
              <Image
                width={321}
                height={100}
                className="rounded-2xl h-[183px] object-cover"
                src={`${process.env.NEXT_PUBLIC_API_URL}/${housing.medias[0].media_url}`}
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
              {housing.features
                .filter((item) => item.key === 'text_selling_price')
                .map((item) => {
                  return (
                    <div className="text-sm mt-1.5 farsi-digits text-[#5A5A5A] flex gap-1">
                      <div className=""> {formatPriceLoc(Number(item.value))}</div> تومان
                    </div>
                  )
                })}

              {housing.features
                .filter((item) => item.key === 'text_monthly_rent' || item.key === 'text_mortgage_deposit')
                .map((item) => {
                  return (
                    <div className="text-[16px] farsi-digits text-[#1A1E25] font-extrabold flex gap-1">
                      {item.key === 'text_mortgage_deposit' && (
                        <div className="flex gap-1">
                          رهن: <div className="font-semibold">{formatPriceLoc(Number(item.value))}</div> تومان
                        </div>
                      )}
                      {item.key === 'text_monthly_rent' && (
                        <div className="flex gap-1">
                          اجاره: <div className="font-semibold"> {formatPriceLoc(Number(item.value))}</div> تومان
                        </div>
                      )}
                    </div>
                  )
                })}

              {/* {housing.price > 0 ? (
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
              ) : null} */}

              {/* نمایش درصد سود مالک و سازنده */}
              {housing.features
                .filter(
                  (item) =>
                    item.key === 'text_owner_profit_percentage' || item.key === 'text_producer_profit_percentage'
                )
                .map((item) => {
                  return (
                    <div className="text-[16px] farsi-digits text-[#1A1E25] font-extrabold flex gap-1">
                      {item.key === 'text_owner_profit_percentage' && (
                        <div className="flex gap-1">
                          سود مالک: <div className="font-semibold">{item.value as string}%</div>
                        </div>
                      )}

                      {item.key === 'text_producer_profit_percentage' && (
                        <div className="flex gap-1">
                          سود سازنده: <div className="font-semibold">{item.value as string}%</div>
                        </div>
                      )}
                    </div>
                  )
                })}

              {/* {(housing.ownerProfitPercentage > 0 || housing.producerProfitPercentage > 0) && (
                <div className="mt-2 text-sm text-[#7A7A7A]">
                  {housing.ownerProfitPercentage > 0 && <p>سود مالک: {housing.ownerProfitPercentage}%</p>}
                  {housing.producerProfitPercentage > 0 && <p>سود سازنده: {housing.producerProfitPercentage}%</p>}
                </div>
              )} */}

              {/* نمایش ظرفیت و نفرات اضافه */}
              {/* {(housing.capacity > 0 || housing.extraPeople > 0 || (housing.rentalTerm && housing.rentalTerm.name)) && (
                <div className="mt-2 text-sm text-[#7A7A7A]">
                  {housing.capacity > 0 && <p>ظرفیت: {housing.capacity} نفر</p>}
                  {housing.extraPeople > 0 && <p>نفرات اضافه: {housing.extraPeople} نفر</p>}
                  {housing.rentalTerm?.name && <p>نوع قرارداد: {housing.rentalTerm.name}</p>}
                </div>
              )} */}

              <hr className="border-[1px] border-[#E3E3E7] my-4" />
            </div>
            <div className="w-full text-right text-[#7A7A7A] text-sm flex justify-between">
              {housing.highlight_features &&
                housing.highlight_features.map((feature) => {
                  return (
                    <div
                      key={feature.id}
                      className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap"
                    >
                      {' '}
                      <img className="w-[16px]" src={feature.image} alt="" /> {feature.value as string}{' '}
                      <span className="font-medium text-[#7A7A7A] text-xs">{feature.name}</span>
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
        </div>
      )}
    </>
  )
}

export default HousingCard
