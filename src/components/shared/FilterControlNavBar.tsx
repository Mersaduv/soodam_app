import { useRouter } from 'next/router'

import { sorts } from '@/utils'

import { Check, HomeIcon, Sort as SortIcon } from '@/icons'

import { useChangeRoute, useDisclosure } from '@/hooks'

import { Modal } from '@/components/ui'
import { useState, useRef } from 'react'

interface Props {}
const FilterControlNavBar: React.FC = () => {
  // ? Assets
  const { query, push } = useRouter()
  const type = query?.type?.toString() ?? ''
  const pageQuery = Number(query?.page)
  const changeRoute = useChangeRoute()

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

  // ? Render(s)
  return (
    <div ref={containerRef} className="flex gap-x-2 hide-scrollbar cursor-grab pr-4" onMouseDown={handleMouseDown}>
      <Modal isShow={isShow} onClose={handleModalClose} effect="buttom-to-fit">
              <Modal.Content
                onClose={handleModalClose}
                className="flex h-full flex-col gap-y-5 bg-white p-4  pb-8  rounded-2xl rounded-b-none"
              >
                <Modal.Header right onClose={handleModalClose} ><div className='text-black'>قیمت</div></Modal.Header>
                <Modal.Body>
                  <div className="space-y-4">
                    <div className="flex flex-row-reverse items-center gap-2 w-full">
                      {/* <CustomCheckbox
                        name={`satellite-view`}
                        checked={isSatelliteView}
                        onChange={() => setIsSatelliteView((prev) => !prev)}
                        label=""
                        customStyle="bg-sky-500"
                      />
                      <label htmlFor="satellite-view" className="flex items-center gap-2 w-full">
                        <SatelliteIcon width="24px" height="24px" />
                        نمای ماهواره ای
                      </label> */}
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
      <div onClick={modalHandlers.open} className="w-fit whitespace-nowrap my-[12px] flex-center px-4 font-normal text-[16px] border rounded-[59px] h-[40px] text-[#7A7A7A] cursor-pointer">
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
