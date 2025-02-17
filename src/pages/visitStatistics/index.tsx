import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { useAppSelector } from '@/hooks'
import { useGetViewedPropertiesQuery } from '@/services'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  Line,
  LineChart,
  Legend,
  Cell,
  PieChart,
  Pie,
  LabelList,
  Text,
  Label,
} from 'recharts'
import moment from 'moment-jalaali'
import { ArrowDownSmmIcon } from '@/icons'
import { Button } from '@/components/ui'
import { useEffect, useState } from 'react'
const VisitStatistics: NextPage = () => {
  const { query, push } = useRouter()
  const { phoneNumber, user } = useAppSelector((state) => state.auth)
  const [hasSubscription, setHasSubscription] = useState(false)
  const {
    data: viewedPropertiesData,
    isLoading,
    isError,
  } = useGetViewedPropertiesQuery(phoneNumber!, { skip: !phoneNumber })

  // پردازش داده‌ها برای 6 هفته اخیر
  const processChartData = () => {
    if (!viewedPropertiesData?.data) return []

    // Create a map to store visits count by week index
    const weeklyVisits = {}

    // Get current date as the reference
    const today = moment()

    // Process each visit
    viewedPropertiesData.data.forEach(({ viewedDate }) => {
      const visitDate = moment(viewedDate)
      const diffDays = today.diff(visitDate, 'days')
      const weekIndex = Math.floor(diffDays / 7)

      // Only consider visits within the last 6 weeks
      if (weekIndex < 6) {
        weeklyVisits[weekIndex] = (weeklyVisits[weekIndex] || 0) + 1
      }
    })

    // Create chart data for each of the 6 weeks
    const chartData = Array.from({ length: 6 }, (_, i) => ({
      week: `هفته ${i + 1}`, // هفته ۱ (جدیدترین) تا هفته ۶ (قدیمی‌ترین)
      weekNumber: i + 1,
      count: weeklyVisits[i] || 0, // i=0: هفته ۱ (0-6 روز پیش), i=5: هفته ۶ (35-41 روز پیش)
    }))

    console.log('Processed chart data:', chartData)
    return chartData
  }
  const chartData = processChartData()
  useEffect(() => {
    if (user?.subscription) {
      setHasSubscription(true)
    } else {
      setHasSubscription(false)
    }
  }, [user])
  if (!hasSubscription) {
    return (
      <ClientLayout title='آمار بازدید آگهی ها'>
        <main className="pt-[87px] relative">
            <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] ">
              <div className="flex justify-center mt-8">
                <img className="w-[180px] h-[180px]" src="/static/Document_empty.png" alt="" />
              </div>
              <div className="mt-8 flex flex-col justify-center items-center gap-2">
                <h1 className="font-medium text-sm">شما تاکنون بسته خریداری نکردید. ابتدا باید بسته خریداری کنید.</h1>
              </div>
              <div className="mx-4 mt-8 mb-7 flex gap-3">
                <Button onClick={() => push('/subscription')} className="w-full rounded-[10px] font-bold text-sm">
                خرید بسته
                </Button>
              </div>
            </div>
          </main>
      </ClientLayout>
    )
  }
  const safeSubscription = user?.subscription || {
    totalViews: 0,
    remainingViews: 0,
    viewedProperties: [],
  }
  const usedViews = safeSubscription.totalViews - safeSubscription.remainingViews
  const dataPiChart = [
    { name: 'Group A', value: safeSubscription.remainingViews },
    { name: 'Group B', value: usedViews },
  ]

  const total = dataPiChart.reduce((sum, item) => sum + item.value, 0)
  const COLORS = ['#D52133', '#17A586']
  if (isLoading) return <div className="text-center">در حال بارگذاری...</div>
  if (isError) return <div className="text-center">خطا در دریافت اطلاعات</div>

  return (
    <ClientLayout title='آمار بازدید آگهی ها'>
      <main className="mx-auto p-4 pt-[92px]">
        <div className="bg-white relative h-fit border border-[#E3E3E7] rounded-2xl" style={{ height: '312px' }}>
          <div className="px-4 pt-5 flex justify-between">
            <div className="space-y-1">
              <h2 className="text-[#7A7A7A] text-sm">کل بازدید</h2>
              <h1 className="text-[#D52133] text-[18px] font-medium farsi-digits">
                {user.subscription.viewedProperties.length} آگهی
              </h1>
            </div>
            <div>
              {/* dropdown section  */}
              <div className="relative">
                <select className="block appearance-none w-full bg-white text-xs font-medium cursor-pointer hover:shadow text-gray-700 py-2 px-4 pl-8 rounded leading-tight focus:outline-none focus:border-[#D52133]">
                  <option value="recent-week">هفته اخیر</option>
                  <option value="recent-day">روز اخیر</option>
                  <option value="recent-year">سال اخیر</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-1 flex items-center px-2 text-gray-700">
                  <ArrowDownSmmIcon width="12px" height="7px" />
                </div>
              </div>
            </div>
          </div>
          <ResponsiveContainer style={{ direction: 'ltr' }} width="100%" height="63%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 5, bottom: 20 }}>
              <CartesianGrid strokeDasharray="1 1" />
              <XAxis
                className="farsi-digits"
                dataKey="week"
                tickMargin={10}
                tick={{ fontSize: 12, direction: 'rtl' }}
              />
              <YAxis
                className="farsi-digits"
                allowDecimals={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                }}
                formatter={(value) => [`${value} بازدید`]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#D52133"
                strokeWidth={1}
                dot={{ fill: '#D52133', r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 pr-4">
            <div className="h-[8px] w-[8px] bg-[#D52133] rounded-full" /> <div>تعداد بازدید</div>
          </div>
        </div>

        <div className="bg-white relative h-fit border border-[#E3E3E7] rounded-2xl mt-3.5">
          <div className="px-4 pt-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-[#17A586] w-[12px] h-[12px] rounded-[2px]" />
              <div className="text-sm font-normal text-[#353535]">آگهی های باقی مانده</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-[#D52133] w-[12px] h-[12px] rounded-[2px]" />
              <div className="text-sm font-normal text-[#353535]">آگهی های استفاده شده</div>
            </div>
          </div>

          {/* statistics section  */}
          <div>
            {/* کل آگهی :{user.subscription.totalViews}
            اگهی باقی مانده : {user.subscription.remainingViews}
            آگهی استفاده شده: {user.subscription.totalViews - user.subscription.remainingViews} */}
            <ResponsiveContainer width="100%" height={320}>
              <PieChart className="-mt-4 w-full" width={300} height={300}>
                <Pie
                  data={dataPiChart}
                  cx="50%"
                  cy="50%"
                  innerRadius="44%"
                  outerRadius="70%"
                  cornerRadius={8}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={true}
                  startAngle={90}
                  endAngle={-270}
                >
                  {dataPiChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}

                  <LabelList
                    className="farsi-digits font-thin"
                    dataKey="value"
                    position="inside"
                    formatter={(value) => {
                      const percentage = ((value / total) * 100).toFixed(1) + '%'
                      return percentage
                    }}
                    fill="#fff"
                    fontSize={10}
                  />
                  <Label
                    value={`${user.subscription.totalViews} آگهی`}
                    className="farsi-digits"
                    position="center"
                    fill="#353535"
                    fontSize={20}
                    offset={0}
                    style={{
                      dominantBaseline: 'ideographic',
                    }}
                  />

                  <Label
                    value="کل آگهی‌ ها"
                    position="center"
                    fill="#353535"
                    fontSize={11}
                    style={{
                      dominantBaseline: 'hanging',
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-[100px] w-full mt-6">
          <Button onClick={() => push('/subscription')} className="w-full">
            خرید بسته
          </Button>
        </div>
      </main>
    </ClientLayout>
  )
}

export default dynamic(() => Promise.resolve(VisitStatistics), { ssr: false })
