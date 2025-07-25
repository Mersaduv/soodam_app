import { useAppDispatch, useAppSelector } from '@/hooks'
import { FrameIcon, HearthIcon, BedIcon, Grid2Icon, BulidingIcon, LocationRedSmIcon, ArrowRedIcon } from '@/icons'
import { useAddFavoriteMutation, useGetFavoritesQuery } from '@/services/productionBaseApi'
import { toggleSaveHouse } from '@/store'
import { Housing } from '@/types'
import { formatPriceLoc, getProvinceFromCoordinates, NEXT_PUBLIC_API_URL } from '@/utils'
import jalaali from 'jalaali-js'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Props {
  isSaved?: boolean
  housing: Housing
  onCardClick: (housing: Housing) => void
  inEstate?: boolean
}

// Small inline loading for favorite button
const SmallFavoriteLoading = () => {
  return (
    <div className="inline-flex items-center justify-center">
      <div className="lds-heart">
        <div></div>
      </div>
      <style jsx>{`
        .lds-heart {
          display: inline-block;
          position: relative;
          width: 15px;
          height: 13px;
          transform: rotate(45deg);
          transform-origin: 8px 8px;
        }
        .lds-heart div {
          top: 4px;
          left: 4px;
          position: absolute;
          width: 7px;
          height: 7px;
          background: #D52133;
          animation: lds-heart 1.2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        .lds-heart div:after,
        .lds-heart div:before {
          content: " ";
          position: absolute;
          display: block;
          width: 7px;
          height: 7px;
          background: #D52133;
        }
        .lds-heart div:before {
          left: -5px;
          border-radius: 50% 0 0 50%;
        }
        .lds-heart div:after {
          top: -5px;
          border-radius: 50% 50% 0 0;
        }
        @keyframes lds-heart {
          0% {
            transform: scale(0.8);
          }
          5% {
            transform: scale(0.9);
          }
          10% {
            transform: scale(0.8);
          }
          15% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};

const HousingCard: React.FC<Props> = (props) => {
  const { housing, onCardClick, inEstate, isSaved } = props
  const dispatch = useAppDispatch()
  const [addFavorite, { isLoading: isAddingFavorite, isSuccess: isAddedFavorite }] = useAddFavoriteMutation()

  const isNew = (() => {
    const shamsiStr = housing.created_at.split(' ')[0]
    const [jy, jm, jd] = shamsiStr.split('-').map(Number)

    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd)
    const createdDate = new Date(gy, gm - 1, gd)

    const today = new Date()
    const diffInDays = (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)

    return diffInDays <= 7
  })()

  // استفاده از وضعیت علاقه‌مندی‌ها از Redux
  const { apiFavorites } = useAppSelector(state => state.saveHouse)
  
  // اگر isSaved از بیرون تعیین نشده، از apiFavorites استفاده کنیم
  const effectiveIsSaved = isSaved !== undefined ? isSaved : apiFavorites.includes(housing.id)
  
  // State برای نمایش آنی تغییرات
  const [localIsSaved, setLocalIsSaved] = useState(effectiveIsSaved)
  
  // به روز کردن localIsSaved هر بار که effectiveIsSaved تغییر می‌کند
  useEffect(() => {
    setLocalIsSaved(effectiveIsSaved)
  }, [effectiveIsSaved, housing.id, apiFavorites])

  const handleSaveClick = async (event: React.MouseEvent<HTMLDivElement>, housing: Housing) => {
    event.preventDefault()
    event.stopPropagation()
    
    // ابتدا وضعیت محلی را تغییر می‌دهیم (برای تجربه کاربری بهتر)
    setLocalIsSaved(!localIsSaved)
    
    try {
      // فراخوانی API
      const response = await addFavorite({ id: housing.id }).unwrap()
      console.log('پاسخ API علاقه‌مندی:', response)
      
      // اگر پاسخ API متفاوت از انتظار بود، وضعیت محلی را به حالت قبل برمی‌گردانیم
      if ((response.action === 'add' && !localIsSaved) || 
          (response.action === 'remove' && localIsSaved)) {
        setLocalIsSaved(!localIsSaved)
      }
    } catch (error) {
      console.error('خطا در به‌روزرسانی علاقه‌مندی:', error)
      // وضعیت محلی را به حالت قبل برمی‌گردانیم
      setLocalIsSaved(!localIsSaved)
    }
  }

  console.log(isSaved, 'isSaved');

  return (
    <>
      {inEstate ? (
        <div className="block w-full bg-white rounded-2xl cursor-pointer" onClick={() => onCardClick(housing)}>
          <article className="flex flex-col items-center justify-start rounded-2xl border-[1.5px] border-[#E3E3E7] h-full p-4 relative">
            <div className="flex gap-3 w-full">
              <>
                {housing.primary_image ? (
                  <div className=" bg-gray-200 rounded-[10px] mb-4">
                    <Image
                      width={321}
                      height={100}
                      className="rounded-2xl h-[104px] min-w-[104px] max-w-[104px] object-cover"
                      src={`${housing.primary_image}`}
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
                  <div className="text-xs font-normal">
                    {typeof housing.full_address.province === 'string'
                      ? housing.full_address.province
                      : housing.full_address.province.name}
                  </div>
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
                  {housing.attributes
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

                  {housing.attributes
                    .filter((item) => item.key === 'text_monthly_rent' || item.key === 'text_mortgage_deposit')
                    .map((item) => {
                      return (
                        <div className="text-sm mt-1.5 farsi-digits text-[#5A5A5A] flex gap-1">
                          <div className=""> {formatPriceLoc(Number(item.value))}</div> تومان
                        </div>
                      )
                    })}

                  {/* نمایش درصد سود مالک و سازنده */}
                  {housing.attributes
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
                {housing.highlight_attributes &&
                  housing.highlight_attributes.map((feature) => {
                    return (
                      <div
                        key={feature.id}
                        className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap"
                      >
                        {' '}
                        <img className="w-[16px]" src={feature.image} alt="" /> {typeof feature.value === 'object' ? feature.value.value : feature.value}{' '}
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
              {housing.primary_image ? (
                <Image
                  width={321}
                  height={100}
                  className="rounded-2xl h-[183px] object-cover"
                  src={`${housing.primary_image}`}
                  alt={housing.title}
                />
              ) : (
                <div className=" bg-gray-200 rounded-[10px] mb-4">
                  <img
                    width={321}
                    height={100}
                    className="rounded-2xl h-[183px] object-cover"
                    src="/static/R.png"
                    alt={housing.title}
                  />
                </div>
              )}
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
                    localIsSaved ? 'text-[#D52133] border-[#D52133]' : 'text-white'
                  }`}
                  onClick={(event) => handleSaveClick(event, housing)}
                >
                  {isAddingFavorite ? (
                    <SmallFavoriteLoading />
                  ) : (
                    <HearthIcon width="15px" height="13px" />
                  )}
                </div>
              </div>
            </div>
            <div className="w-full mt-3 text-right">
              {housing.price && (
                <div className=" w-full text-right">
                  {/* {housing.price.deposit > 0 || housing.price.rent > 0 ? (
                    <div className="text-[16px] farsi-digits text-[#1A1E25] font-extrabold flex gap-1">
                      {housing.price.deposit > 0 && (
                        <div className="flex gap-1">
                          رهن:{' '}
                          <div className="font-semibold">
                            {housing.price.deposit > 0 ? formatPriceLoc(Number(housing.price.deposit)) : 'رایگان'}
                          </div>{' '}
                          {housing.price.deposit > 0 && 'تومان'}
                        </div>
                      )}
                      {housing.price.rent > 0 && (
                        <div className="flex gap-1">
                          اجاره:{' '}
                          <div className="font-semibold">
                            {housing.price.rent > 0 ? formatPriceLoc(Number(housing.price.rent)) : 'رایگان'}
                          </div>{' '}
                          {housing.price.rent > 0 && 'تومان'}
                        </div>
                      )}
                    </div>
                  ) : null} */}

                  {housing.price.amount > 0 ? (
                    <div className="text-[16px] farsi-digits text-[#1A1E25] font-extrabold flex gap-1">
                      <div className="font-semibold"> {housing.price.amount.toLocaleString('de-DE')}</div> تومان
                    </div>
                  ) : housing.price.deposit > 0 || housing.price.rent > 0 ? (
                    <div className="text-[16px] farsi-digits text-[#1A1E25] font-extrabold">
                      {housing.price.deposit > 0 && (
                        <div className="flex gap-1">
                          {' '}
                          رهن: <div className="font-semibold">{housing.price.deposit.toLocaleString('de-DE')}</div>{' '}
                          تومان{' '}
                        </div>
                      )}{' '}
                      {housing.price.rent > 0 && (
                        <div className="flex gap-1">
                          اجاره: <div className="font-semibold">{housing.price.rent.toLocaleString('de-DE')} </div>تومان
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* نمایش درصد سود مالک و سازنده */}
                  {/* {housing.attributes
                .filter(
                  (item) =>
                    item.key === 'text_owner_profit_percentage' || item.key === 'text_producer_profit_percentage'
                )
                .filter((item) => item.key === 'text_owner_profit_percentage' || item.key === 'text_producer_profit_percentage').length > 0 &&
                housing.attributes
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
                })} */}

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
                </div>
              )}
              <hr className="border-[1px] border-[#E3E3E7] my-4" />
            </div>
            <div className="w-full text-right text-[#7A7A7A] text-sm flex justify-between">
              {housing.highlight_attributes &&
                housing.highlight_attributes.length > 0 &&
                housing.highlight_attributes.map((feature) => {
                  return (
                    <div
                      key={feature.id}
                      className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap"
                    >
                      <img className="w-[16px]" src={feature.icon} alt="" />
                      <span className="font-medium text-[#7A7A7A] text-xs">{typeof feature.value === 'object' ? feature.value.value : feature.value}</span>
                      <span className="font-medium text-[#7A7A7A] text-xs">{feature.name}</span>
                    </div>
                  )
                })}
              {/* <div className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap">
                {' '}
                <img className="w-[16px]" src={`/static/grid-222.png`} alt="" />{' '}
                <span className="font-medium text-[#7A7A7A] text-xs">بزودی نمایش داده میشود</span>
              </div>
              <div className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap">
                {' '}
                <img className="w-[16px]" src={`/static/grid-222.png`} alt="" />{' '}
                <span className="font-medium text-[#7A7A7A] text-xs">بزودی</span>
              </div>
              <div className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap">
                {' '}
                <img className="w-[16px]" src={`/static/grid-222.png`} alt="" />{' '}
                <span className="font-medium text-[#7A7A7A] text-xs">بزودی </span>
              </div> */}
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
