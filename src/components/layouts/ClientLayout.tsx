import { Header, Footer, BottomNavigation, FilterControlsHeader } from '@/components/shared'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { useState, useEffect } from 'react'
import { Modal } from '../ui'
import Image from 'next/image'
import Link from 'next/link'
import { roles } from '@/utils'
import FirstLoginModal from '../modals/FirstLoginModal'
import { setIsShowLogin } from '@/store'

interface Props {
  title?: string
  children: React.ReactNode
}

const ClientLayout: React.FC<Props> = ({ children, title }) => {
  // const [showModal, setShowModal] = useState<boolean>(false)
  const [isShow, modalHandlers] = useDisclosure()
  const { isShowLogin } = useAppSelector((state) => state.isShowLogin)
   const dispatch = useAppDispatch()
  useEffect(() => {
    let hasSeenModal = localStorage.getItem('hasSeenModal')

    if (hasSeenModal === null) {
      localStorage.setItem('hasSeenModal', 'false')
      hasSeenModal = 'false'
    }

    if (hasSeenModal === 'false') {
      modalHandlers.open()
      dispatch(setIsShowLogin(true))
    }
  }, [modalHandlers])

  const handleModalClose = (): void => {
    setIsShowLogin(false)
    localStorage.setItem('hasSeenModal', 'true')
    modalHandlers.close()
  }

  useEffect(() => {
    if (isShowLogin) {
      modalHandlers.open()
    } else {
      modalHandlers.close()
    }
  }, [isShowLogin])
    
  
  return (
    <>
      {title ? <FilterControlsHeader title={title} /> : <Header />}

      <main className="h-full bg-[#F6F7FB]">
        {isShowLogin && <FirstLoginModal isShow={isShow} onClose={handleModalClose} />}
        {children}
      </main>
      <BottomNavigation />
    </>
  )
}

export default ClientLayout
