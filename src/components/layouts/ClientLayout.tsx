import { Header, Footer } from '@/components/shared'
import { useDisclosure } from '@/hooks'
import { useState, useEffect } from 'react'
import { Modal } from '../ui'
import Image from 'next/image'
import Link from 'next/link'
import { roles } from '@/utils'

interface Props {
  children: React.ReactNode
}

const ClientLayout: React.FC<Props> = ({ children }) => {
  const [showModal, setShowModal] = useState<boolean>(false)
  const [isShow, modalHandlers] = useDisclosure()

  useEffect(() => {
    let hasSeenModal = localStorage.getItem('hasSeenModal')

    if (hasSeenModal === null) {
      localStorage.setItem('hasSeenModal', 'false')
      hasSeenModal = 'false'
    }

    if (hasSeenModal === 'false') {
      modalHandlers.open()
      setShowModal(true)
    }
  }, [modalHandlers])

  const handleModalClose = (): void => {
    setShowModal(false)
    localStorage.setItem('hasSeenModal', 'true')
    modalHandlers.close()
  }

  return (
    <>
      <Header />
      <main className="">
        {showModal && (
          <Modal isShow={isShow} onClose={handleModalClose} effect="ease-out">
            <Modal.Content
              onClose={handleModalClose}
              className="flex h-full flex-col gap-y-5 bg-white mx-2 p-4 rounded-3xl"
            >
              <Modal.Header onClose={handleModalClose}>کانال‌های ورودی</Modal.Header>
              <Modal.Body>
                <div className="space-y-4">
                  <Link
                    href={{
                      pathname: '/authentication/login',
                      query: { role: roles.MemberUser },
                    }}
                    className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
                  >
                    <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                      <p className="text-sm">ورود به عنوان کاربر عضو</p>
                      <button className="text-white bg-[#D52133] w-full text-xs py-1 rounded-lg mt-2">
                        خرید اشتراک
                      </button>
                    </div>
                    <Image
                      src="/static/listening-to-feedback.png"
                      alt="عضو"
                      layout="intrinsic"
                      width={95}
                      height={95}
                    />
                  </Link>

                  <Link
                    href={{
                      pathname: '/authentication/login',
                      query: { role: roles.User },
                    }}
                    className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
                  >
                    <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                      <p className="text-sm">ورود به عنوان کاربر معمولی</p>
                    </div>
                    <Image
                      src="/static/smart-home-contol.png"
                      alt="کاربر معمولی"
                      layout="intrinsic"
                      width={95}
                      height={95}
                    />
                  </Link>

                  <Link
                    href={{
                      pathname: '/authentication/login',
                      query: { role: roles.Marketer },
                    }}
                    className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
                  >
                    <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                      <p className="text-sm">ورود به عنوان بازاریاب</p>
                    </div>
                    <Image src="/static/becoming-rich.png" alt="بازاریاب" layout="intrinsic" width={95} height={95} />
                  </Link>
                </div>
              </Modal.Body>
            </Modal.Content>
          </Modal>
        )}
        {children}
      </main>
      <Footer />
    </>
  )
}

export default ClientLayout
