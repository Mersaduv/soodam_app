import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Modal } from '../ui'
import { roles, userTypes } from '@/utils'
import { useAppSelector, useAppDispatch } from '@/hooks'
import { clearCredentials } from '@/store'
import { useRouter } from 'next/router'

interface FirstLoginModalProps {
  isShow: boolean
  onClose: () => void
}

// No longer need these enums as we're using the imported constants
// enum UserType {
//   NormalUser = 1,
//   MemberUser = 2,
//   Marketer = 3,
//   EstateAgent = 4,
// }

// enum AdminGroup {
//   SuperAdmin = 1,
//   Admin = 2,
//   SubscriberUser = 3,
//   NormalUser = 4,
// }

const FirstLoginModal: React.FC<FirstLoginModalProps> = ({ isShow, onClose }) => {
  const { userType, phoneNumber, user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { push } = useRouter()

  const handleClick = (pathname: string, userType: number) => {
    localStorage.removeItem('user')

    dispatch(clearCredentials())
    push(pathname, {
      query: {
        userType: userType.toString(),
      },
    })
    onClose()
  }

  const handleClickNewAdAsMarketerNav = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    const userType = localStorage.getItem('userType')

    if (!userType) {
      push(`/authentication/login?userType=${userTypes.Marketer}`)
      return
    }

    if (user && user.user_type !== userTypes.Marketer) {
      push('/marketer')
    } else {
      push('/soodam')
    }
    onClose()
  }

  const handleClickEstateConsultant = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    const userType = localStorage.getItem('userType')

    if (!userType) {
      push(`/authentication/login?userType=${userTypes.EstateAgent}`)
      return
    }

    if (user && user.user_type !== userTypes.EstateAgent) {
      push(`/authentication/login?userType=${userTypes.EstateAgent}`)
    } else {
      push('/estate-consultant')
    }
    onClose()
  }

  return (
    <Modal isShow={isShow} onClose={onClose} effect="ease-out">
      <Modal.Content onClose={onClose} className="flex h-full flex-col gap-y-5 bg-white mx-2 p-4 rounded-3xl">
        <Modal.Header onClose={onClose}>کانال‌های ورودی</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            {/* Member User - Type 2 */}
            <div
              onClick={() => handleClick('/authentication/login', userTypes.MemberUser)}
              className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                <p className="text-sm">ورود به عنوان کاربر عضو</p>
                <button className="text-white bg-[#D52133] w-full text-xs py-1 rounded-lg mt-2">خرید اشتراک</button>
              </div>
              <Image src="/static/listening-to-feedback.png" alt="عضو" layout="intrinsic" width={95} height={95} />
            </div>

            {/* Normal User - Type 1 */}
            <div
              onClick={() => handleClick('/', userTypes.NormalUser)}
              className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                <p className="text-sm">ورود به عنوان کاربر معمولی</p>
              </div>
              <Image src="/static/smart-home-contol.png" alt="کاربر معمولی" layout="intrinsic" width={95} height={95} />
            </div>

            {/* Marketer - Type 3 */}
            <div
              onClick={() => handleClick('/authentication/login', userTypes.Marketer)}
              className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                <p className="text-sm">ورود به عنوان بازاریاب</p>
              </div>
              <Image src="/static/becoming-rich.png" alt="بازاریاب" layout="intrinsic" width={95} height={95} />
            </div>

            {/* Estate Agent - Type 4 */}
            <div
              onClick={() => handleClick('/authentication/login', userTypes.EstateAgent)}
              className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                <p className="text-sm">ورود به عنوان بنگاه املاک</p>
              </div>
              <Image src="/static/business-deal.png" alt="املاک" layout="intrinsic" width={95} height={95} />
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}

export default FirstLoginModal
