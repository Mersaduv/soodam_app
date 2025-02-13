/* eslint-disable tailwindcss/no-custom-classname */
import 'swiper/css'
import 'swiper/css/pagination'
import { Housing } from '@/types'
import { useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'
import SwiperCore from 'swiper'
import { Close } from '@/icons'
interface Props {
  data: Housing
}
SwiperCore.use([Navigation, Pagination, Thumbs]);
const HousingSliders: React.FC<Props> = (props) => {
  // ? Props
  const { data } = props
  const [isOpen, setIsOpen] = useState(false)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  // ? Local Component
  const SliderImage = ({ item, index, title }: { item: string; index: number; title: string }) => (
    <Image
      className="w-full h-[263px] object-cover"
      width={1000}
      height={0}
      //   imageStyles="object-cover object-[72%] lg:object-center "
      src={item}
      alt={`${title}-${index}`}
    />
  )

  // ? Render(s)

  return (
    <section className={`section-swiper relative`}>
      <Swiper
        pagination={{ clickable: true }}
        modules={[Pagination, Navigation, Thumbs]}
        className="mySwiper"
        onClick={() => setIsOpen(true)}
      >
        {data.images.map((item, index) => (
          <SwiperSlide key={index}>
            <Image className="w-full h-[263px] object-cover cursor-pointer" width={1000} height={0} src={item} alt={`image-${index}`} />
          </SwiperSlide>
        ))}
      </Swiper>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex justify-center items-center">
          <button className="absolute top-[90px] right-5 text-white border rounded-full" onClick={() => setIsOpen(false)}>
           <Close className='text-4xl' />
          </button>
          <Swiper
            pagination={{ clickable: true }}
            thumbs={{ swiper: thumbsSwiper }}
            modules={[Pagination, Thumbs]}
            className="w-full max-w-4xl"
          >
            {data.images.map((item, index) => (
              <SwiperSlide key={index}>
                <Image
                  className="w-full h-auto max-h-[60vh] object-contain"
                  width={1000}
                  height={0}
                  src={item}
                  alt={`fullscreen-${index}`}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </section>
  )
}

export default HousingSliders
