import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { useAppSelector } from '@/hooks'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, AreaChart, Area } from 'recharts'
import moment from 'moment-jalaali'
import { useEffect, useState } from 'react'
import { GoArrowUp } from 'react-icons/go'
interface AdminVisitStatisticsProps {}
const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
]

const AdminVisitStatistics: React.FC<AdminVisitStatisticsProps> = ({}) => {
  const { query, push } = useRouter()
  const { phoneNumber, user } = useAppSelector((state) => state.auth)

  // داده‌های آمار بازدید با تاریخ ISO
  // const visitData = [
  //   // هفته اول - هر روز 6 بازدید
  //   { date: '2023-01-01T00:00:00Z', value: 6 },
  //   { date: '2023-01-02T00:00:00Z', value: 6 },
  //   { date: '2023-01-03T00:00:00Z', value: 6 },
  //   { date: '2023-01-04T00:00:00Z', value: 6 },
  //   { date: '2023-01-05T00:00:00Z', value: 6 },
  //   { date: '2023-01-06T00:00:00Z', value: 6 },
  //   { date: '2023-01-07T00:00:00Z', value: 6 },

  //   // پنج ماه بدون بازدید (فقط یک نقطه برای هر ماه)
  //   { date: '2023-02-01T00:00:00Z', value: 0 },
  //   { date: '2023-03-01T00:00:00Z', value: 0 },
  //   { date: '2023-04-01T00:00:00Z', value: 0 },
  //   { date: '2023-05-01T00:00:00Z', value: 0 },

  //   // ماه ششم
  //   { date: '2023-06-15T00:00:00Z', value: 17 },
  //   { date: '2023-06-30T00:00:00Z', value: 5 },

  //   // پنج ماه دیگر بدون بازدید
  //   { date: '2023-07-01T00:00:00Z', value: 0 },
  //   { date: '2023-08-01T00:00:00Z', value: 0 },
  //   { date: '2023-09-01T00:00:00Z', value: 0 },
  //   { date: '2023-10-01T00:00:00Z', value: 0 },
  //   { date: '2023-11-01T00:00:00Z', value: 0 },

  //   // ماه دوازدهم
  //   { date: '2023-12-15T00:00:00Z', value: 20 },
  // ]

  // تابع تبدیل تاریخ به فرمت قابل نمایش
  const formatDate = (dateStr: string) => {
    return moment(dateStr).format('jYYYY/jMM/jDD')
  }

  return (
    <main className="mx-auto p-4 pt-0">
      {/* نمودار خطی بازدیدها */}
      <div className="flex bg-white rounded-[10px] p-4" style={{ height: '124px' }}>
        <div className="">
          <div className="space-y-1.5">
            <h2 className="text-[#333333] text-sm whitespace-nowrap">بازدید کاربران امروز</h2>
            <h1 className="text-[#333333] text-[20px] font-medium farsi-digits">12048 بازدید</h1>
            <div className="w-[54px] h-[24px] bg-[#2DE577] rounded-2xl flex items-center justify-center">
              <div className="text-white text-sm farsi-digits">9.1%</div>
              <GoArrowUp className="text-white" />
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={400}
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2DE577" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#2DE577" stopOpacity={0} />
              </linearGradient>
            </defs>

            <Tooltip />
            <Area type="monotone" dataKey="uv" stroke="#2DE577" strokeWidth={3} fill="url(#colorUv)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </main>
  )
}

export default AdminVisitStatistics
