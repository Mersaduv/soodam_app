import { ClientLayout } from '@/components/layouts'
import { useGetNewsQuery } from '@/services/news/apiSlice'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import moment from 'moment-jalaali'
const News: NextPage = () => {
  const { data: newsData, error, isLoading } = useGetNewsQuery({ pageSize: 20 })

  if (isLoading) return <div>loading ....</div>
  return (
    <>
      <ClientLayout title="مجله خیر">
        <main className="pt-[92px] space-y-4 pb-[100px] px-3">
          {newsData.data.map((news) => {
            return (
              <div key={news.id} className="bg-white flex w-full border-[#E3E3E7] border rounded-2xl">
                <div className='p-3'>
                  <img className="h-[79px] rounded-2xl w-[96px] object-cover" src={news.image} alt={news.title} />
                </div>
                <div className="flex flex-col flex-1 pl-4 pt-2.5">
                  <div className="flex justify-between">
                    <div className="text-[#17A586] ml-1 bg-[#DEF4EF] h-[29px] px-1 flex-center text-xs whitespace-nowrap rounded">
                      {news.category}
                    </div>
                    <div className="flex items-center text-[#7A7A7A]">
                      <div className="farsi-digits text-[#7A7A7A] text-xs whitespace-nowrap">{news.viewCount} بازدید</div>
                      <div className="w-[4px] h-[4px] rounded-full bg-[#7A7A7A] mx-2" />
                      <div className="farsi-digits text-[#7A7A7A] text-xs whitespace-nowrap">{moment(news.updated).format('jYYYY/jMM/jDD')}</div>
                    </div>
                  </div>
                  <h2 className="font-medium mt-2 mb-2 text-base line-clamp-2 overflow-hidden text-ellipsis">{news.title}</h2>
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
