import { useRouter } from 'next/router'

import { sorts } from '@/utils'

import { Check, HomeIcon, Sort as SortIcon } from '@/icons'

import { useChangeRoute, useDebounce, useDisclosure } from '@/hooks'

import { Modal } from '@/components/ui'
import { useState, useRef, useEffect } from 'react'
import { QueryParams } from '@/types'

interface Props {}
const FilterControlNavBar: React.FC = () => {
  // ? Assets
  const { query, push } = useRouter()
  const type = query?.type?.toString() ?? ''
  const pageQuery = Number(query?.page)
  const changeRoute = useChangeRoute()
  const [price, setPrice] = useState({
    minPrice: 0,
    maxPrice: 0,
  })
  // ? State
  const [activeType, setActiveType] = useState<string>(type)
  const [isShow, modalHandlers] = useDisclosure()
  // ? Handlers
  const handleChange = (item: string) => {
    const newType = activeType === item ? '' : item
    setActiveType(newType)
    changeRoute({
      page: pageQuery && pageQuery > 1 ? 1 : '',
      type: newType,
    })
  }

  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current
    if (!container) return

    let startX = e.pageX - container.offsetLeft
    let scrollLeft = container.scrollLeft

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX - container.offsetLeft
      const walk = (x - startX) * 1 // سرعت اسکرول
      container.scrollLeft = scrollLeft - walk
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleNavigate = () => {
    push('/filterControls')
  }

  const handleModalClose = (): void => {
    modalHandlers.close()
  }

  const handleApply = (): void => {
    modalHandlers.close()
  }
  // ? Debounced Values
  const debouncedMinPrice = useDebounce(price.minPrice!, 1200)
  const debouncedMaxPrice = useDebounce(price.maxPrice!, 1200)

  // ? Handlers
  const handleChangeRoute = (newQueries: QueryParams) => {
    changeRoute({
      ...query,
      page: pageQuery && pageQuery > 1 ? 1 : '',
      ...newQueries,
    })
  }

  useEffect(() => {
    handleChangeRoute({ minPrice: debouncedMinPrice, maxPrice: debouncedMaxPrice })
  }, [debouncedMinPrice, debouncedMaxPrice])
  const handlefilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target
    // if (type === 'checkbox') handleChangeRoute({ [name]: checked })
    if (type === 'text') setPrice((prev) => ({ ...prev, [name]: +value }))
  }

  // ? Render(s)
  return (
    <div ref={containerRef} className="flex gap-x-2 hide-scrollbar cursor-grab pr-4" onMouseDown={handleMouseDown}>
      <Modal isShow={isShow} onClose={handleModalClose} effect="buttom-to-fit">
        <Modal.Content
          onClose={handleModalClose}
          className="flex h-full flex-col gap-y-5 bg-white p-4  pb-8  rounded-2xl rounded-b-none"
        >
          <Modal.Header right onClose={handleModalClose}>
            <div className="text-black">قیمت</div>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <div className="flex mxx:flex-row flex-col justify-between items-center gap-1">
                  <div className="flex items-center border rounded xxm:w-[172px] w-[152px]">
                    <div className="text-base bg-[#D52133] rounded-r text-white h-[46px] w-[28px] flex-center">از</div>
                    <input
                      type="text"
                      className="text-lg outline-none placeholder:text-base rounded-md text-center farsi-digits xxm:w-[140px] w-[120px]"
                      // style={{ direction: 'ltr' }}
                      name="minPrice"
                      value={price.minPrice ? price.minPrice : ''}
                      onChange={handlefilter}
                      placeholder="۱۰۰.۰۰۰ تومان"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                  <div className="flex items-center border rounded xxm:w-[172px] w-[152px]">
                    <div className="text-base bg-[#D52133] rounded-r text-white h-[46px] w-[28px] flex-center">تا</div>
                    <input
                      type="text"
                      className="text-lg outline-none rounded-md text-[14.5px] placeholder:xxm:text-[16px] text-center farsi-digits xxm:w-[140px] w-[120px]"
                      // style={{ direction: 'ltr' }}
                      name="maxPrice"
                      value={price.maxPrice ? price.maxPrice : ''}
                      onChange={handlefilter}
                      placeholder="۱۰۰.۰۰۰.۰۰۰ تومان"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                </div>
                {/* <PriceRange
                              minPrice={price.minPrice}
                              maxPrice={price.maxPrice}
                              onPriceChange={(newPrice) => setPrice(newPrice)}
                            /> */}
              </div>
            </div>
            <button onClick={handleApply} className="w-full py-2 bg-red-600 text-white rounded-lg">
              اعمال
            </button>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <div
        onClick={handleNavigate}
        className="w-fit cursor-pointer whitespace-nowrap my-[12px] flex-center px-4 font-normal text-[16px] border rounded-[59px] h-[40px] text-[#7A7A7A]"
      >
        فیلتر ها
      </div>
      <div
        onClick={() => handleChange('sale')}
        className={`cursor-pointer w-fit my-[12px] flex-center gap-1 px-4 font-normal text-sm border rounded-[59px] h-[40px] ${
          activeType === 'sale' ? 'bg-[#D52133] text-white' : 'text-[#D52133]'
        }`}
      >
        <HomeIcon width="16px" height="16px" />
        <span
          className={`font-normal whitespace-nowrap text-[16px] text-[#7A7A7A] ${
            activeType === 'sale' ? 'text-white' : ''
          }`}
        >
          فروش
        </span>
      </div>
      <div
        onClick={() => handleChange('rent')}
        className={`cursor-pointer w-fit my-[12px] flex-center gap-1 px-4 font-normal text-sm border rounded-[59px] h-[40px] ${
          activeType === 'rent' ? 'bg-[#D52133] text-white' : 'text-[#D52133]'
        }`}
      >
        <HomeIcon width="16px" height="16px" />
        <span
          className={`font-normal whitespace-nowrap text-[16px] text-[#7A7A7A] ${
            activeType === 'rent' ? 'text-white' : ''
          }`}
        >
          رهن و اجاره
        </span>
      </div>
      <div
        onClick={modalHandlers.open}
        className="w-fit whitespace-nowrap my-[12px] flex-center px-4 font-normal text-[16px] border rounded-[59px] h-[40px] text-[#7A7A7A] cursor-pointer"
      >
        قیمت
      </div>
      <div className="w-fit whitespace-nowrap my-[12px] flex-center px-4 font-normal text-[16px] border rounded-[59px] h-[40px] text-[#7A7A7A] cursor-pointer">
        اتاق خواب
      </div>
      <div className="w-fit whitespace-nowrap my-[12px] flex-center px-4 font-normal text-[16px] border rounded-[59px] h-[40px] text-[#7A7A7A] cursor-pointer">
        متراژ
      </div>
    </div>
  )
}

export default FilterControlNavBar
