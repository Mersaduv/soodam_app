import { ClientLayout } from '@/components/layouts'
import { useGetNewsQuery } from '@/services/news/apiSlice'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import moment from 'moment-jalaali'
const News: NextPage = () => {
  const { data: newsData, error, isLoading } = useGetNewsQuery({ pageSize: 20 })

  const categoryStyles = [
    { bg: 'bg-[#DEF4EF]', text: 'text-[#17A586]' },
    { bg: 'bg-[#FCE8E6]', text: 'text-[#E53935]' },
    { bg: 'bg-[#E3E3E7]', text: 'text-[#7A7A7A]' },
    { bg: 'bg-[#E8F0FE]', text: 'text-[#1A73E8]' },
    { bg: 'bg-[#FFF3CD]', text: 'text-[#856404]' },
  ]

  if (isLoading) return <div>loading ....</div>
  return (
    <>
      <ClientLayout title="مجله خیر">
        <main className="pt-[92px] space-y-4 pb-[100px] px-3">
          {newsData.data.map((news) => {
            const randomStyle = categoryStyles[Math.floor(Math.random() * categoryStyles.length)]

            return (
              <div key={news.id} className="bg-white flex w-full border-[#E3E3E7] border rounded-2xl">
                <div className="p-3">
                  <img className="h-[79px] rounded-2xl w-[96px] object-cover" src={news.image} alt={news.title} />
                </div>
                <div className="flex flex-col flex-1 pl-4 pt-2.5">
                  <div className="flex justify-between">
                    <div
                      className={`ml-1 h-[29px] px-1 flex-center text-xs whitespace-nowrap rounded ${randomStyle.bg} ${randomStyle.text}`}
                    >
                      {news.category}
                    </div>
                    <div className="flex items-center text-[#7A7A7A]">
                      <div className="farsi-digits text-[#7A7A7A] text-xs whitespace-nowrap">
                        {news.viewCount} بازدید
                      </div>
                      <div className="w-[4px] h-[4px] rounded-full bg-[#7A7A7A] mx-2" />
                      <div className="farsi-digits text-[#7A7A7A] text-xs whitespace-nowrap">
                        {moment(news.updated).format('jYYYY/jMM/jDD')}
                      </div>
                    </div>
                  </div>
                  <h2 className="font-medium mt-2 mb-2 text-base line-clamp-2 overflow-hidden text-ellipsis">
                    {news.title}
                  </h2>
                </div>
              </div>
            )
          })}
        </main>
      </ClientLayout>
    </>
  )
}
export default dynamic(() => Promise.resolve(News), { ssr: false })
