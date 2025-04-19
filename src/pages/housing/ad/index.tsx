import { ClientLayout } from '@/components/layouts'
import { useAppDispatch } from '@/hooks'
import { SmallArrowLeftIcon } from '@/icons'
import { setIsShowLogin } from '@/store'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

const AdPage: NextPage = () => {
  const { query, push } = useRouter()
  const dispatch = useAppDispatch()
  const handleClickNav = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user && user.role !== 'marketer') {
      push('/marketer')
    } else {
      push('/housing/ad/new?role=marketer')
    }
  }
  return (
    <ClientLayout title="ثبت آگهی">
      <div className="pt-[90px] pb-[90px] px-4">
        <div className="space-y-4">
          <Link
            href={{
              pathname: '/housing/ad/new',
              query: { role: 'MemberUser' },
            }}
            className="hover:bg-[#FFF0F2] relative bg-white border hover:border-[#D52133] cursor-pointer p-4 rounded-[16px] flex justify-between items-center flex-col"
          >
            <span className="bg-[#E0FBF5] text-[#17A586] w-[52px] h-[21px] font-normal text-[11px] flex-center rounded-[59px] absolute top-4 left-4">
              رایگان
            </span>
            <Image src="/static/Group.png" alt="ثبت آگهی" layout="intrinsic" width={130} height={146} />
            <div className="flex justify-between h-full items-end w-full">
              <div className="flex flex-col gap-3 mt-1">
                <p className="text-sm">ثبت آگهی شخصی</p>
                <p className="text-xs farsi-digits font-normal text-[#5A5A5A]">
                  (ثبت 100 آگهی رایگان +اشتراک ماهانه+100 پیامک رایگان)
                </p>
              </div>
              <div className="bg-[#D52133] h-[32px] min-w-[32px] pr-[1px] flex-center rounded-full">
                <SmallArrowLeftIcon />
              </div>
            </div>
          </Link>

          <div
            onClick={handleClickNav}
            className="hover:bg-[#FFF0F2] bg-white border hover:border-[#D52133] cursor-pointer p-4 rounded-[16px] flex justify-between items-center flex-col"
          >
            <Image
              src="/static/megaphone-voice-being-heard (1).png"
              alt="ثبت آگهی"
              layout="intrinsic"
              width={171}
              height={171}
            />
            <div className="flex gap-1 justify-between h-full items-end w-full">
              <div className="flex flex-col gap-3">
                <p className="text-sm">ثبت آگهی به عنوان بازاریاب</p>
                <p className="text-xs font-normal farsi-digits text-[#5A5A5A]">(ثبت 100 آگهی رایگان +اشتراک ماهانه)</p>
                <p className="text-xs font-normal text-[#5A5A5A]">
                  از قسمت منو بخش ثبت نام به عنوان بازاریاب می توانید در این بخش عضو شوید
                </p>
              </div>
              <div className="bg-[#D52133] h-[32px] min-w-[32px] pr-[1px] flex-center rounded-full">
                <SmallArrowLeftIcon />
              </div>
            </div>
          </div>

          {/* <Link
            href={{
              pathname: '/authentication/login',
              query: { role: 'User' },
            }}
            className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
          >
            <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
              <p className="text-sm">ورود به عنوان کاربر معمولی</p>
            </div>
            <Image src="/static/smart-home-contol.png" alt="کاربر معمولی" layout="intrinsic" width={95} height={95} />
          </Link>

          <Link
            href={{
              pathname: '/authentication/login',
              query: { role: 'Marketer' },
            }}
            className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
          >
            <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
              <p className="text-sm">ورود به عنوان بازاریاب</p>
            </div>
            <Image src="/static/becoming-rich.png" alt="بازاریاب" layout="intrinsic" width={95} height={95} />
          </Link> */}
        </div>
      </div>
    </ClientLayout>
  )
}

export default dynamic(() => Promise.resolve(AdPage), { ssr: false })
