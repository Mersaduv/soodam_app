import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Modal } from '../ui'
import { Header, Footer, BottomNavigation, FilterControlsHeader } from '@/components/shared'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { roles } from '@/utils'
import { setIsMemberUserLogin, setIsShowLogin } from '@/store'
import { useRouter } from 'next/router'
interface MemberUserLoginsModalProps {
  isShow: boolean
  onClose: () => void
}

const MemberUserLoginsModal: React.FC<MemberUserLoginsModalProps> = ({ isShow, onClose }) => {
  const dispatch = useAppDispatch()
  const { replace, query, push } = useRouter()
  const handleNavigate = () => {
    dispatch(setIsMemberUserLogin(false))
    push('/subscription')
  }
  return (
    <Modal isShow={isShow} onClose={onClose} effect="ease-out">
      <Modal.Content onClose={onClose} className="flex h-full flex-col gap-y-5 bg-white mx-2 p-4 rounded-3xl">
        <Modal.Header onClose={onClose}>کانال‌های ورودی</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div
              onClick={handleNavigate}
              className="hover:bg-[#FFF0F2] bg-[#FCFCFC] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-2 flex flex-col justify-between h-full">
                <p className="text-[15px] font-normal">کاربر عضو عزیز: </p>
                <p className="text-[13px] font-normal text-[#5A5A5A]">
                  {' '}
                  برای استفاده از شماره تماس و آدرس دقیق آگهی ها نیاز به خرید اشتراک دارید.
                </p>
                <button className="text-white bg-[#D52133] w-full text-xs h-[24px] rounded-lg mt-2">خرید اشتراک</button>
              </div>
              <Image src="/static/listening-to-feedback.png" alt="عضو" layout="intrinsic" width={95} height={95} />
            </div>

            <Link
              href={{
                pathname: '/',
              }}
              className="hover:bg-[#FFF0F2] bg-[#FCFCFC] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-2 flex flex-col justify-between h-full">
                <p className="text-[15px] font-normal">کاربر عضو عزیز: </p>
                <p className="text-[13px] font-normal text-[#5A5A5A]">
                  شما می توانید به عنوان بازاریاب فعالیت کنید و با ثبت آگهی های ملک درآمد کسب کنید.
                </p>
                <button className="text-white bg-[#D52133] w-full text-xs h-[24px] rounded-lg mt-2">
                  ثبت نام بازاریاب
                </button>
              </div>
              <Image src="/static/becoming-rich.png" alt="بازاریاب" layout="intrinsic" width={95} height={95} />
            </Link>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}

export default MemberUserLoginsModal
