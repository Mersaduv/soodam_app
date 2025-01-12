import { Header, Footer, BottomNavigation, FilterControlsHeader } from '@/components/shared'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { useState, useEffect } from 'react'
import { Modal } from '../ui'
import Image from 'next/image'
import Link from 'next/link'
import { roles } from '@/utils'
import { setIsMemberUserLogin, setIsShowLogin } from '@/store'
import { FirstLoginModal, MemberUserLoginsModal } from '../modals'

interface Props {
  title?: string
  isProfile?:boolean
  children: React.ReactNode
}

const ClientLayout: React.FC<Props> = ({ children, title,isProfile }) => {
  // const [showModal, setShowModal] = useState<boolean>(false)
  const [isShow, modalHandlers] = useDisclosure()
  const [isShowMemberUserGuid,memberUserGuidModalHandlers] = useDisclosure()
  const { isShowLogin,isMemberUserLogin } = useAppSelector((state) => state.isShowLogin)
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
    dispatch(setIsShowLogin(false))
    localStorage.setItem('hasSeenModal', 'true')
    modalHandlers.close()
  }

  const handleMemberUserModalClose = (): void => {
    dispatch(setIsMemberUserLogin(false))
    memberUserGuidModalHandlers.close()
  }

  useEffect(() => {
    if (isShowLogin) {
      modalHandlers.open()
    } else {
      modalHandlers.close()
    }
  }, [isShowLogin])
    
  useEffect(() => {
    if (isMemberUserLogin) {
      memberUserGuidModalHandlers.open()
    } else {
      memberUserGuidModalHandlers.close()
    }
  }, [isMemberUserLogin])
    
  return (
    <>
      {title && !isProfile ? <FilterControlsHeader title={title} /> : !isProfile && <Header />}
      <main className="h-full bg-[#F6F7FB]">
        {isShowLogin && <FirstLoginModal isShow={isShow} onClose={handleModalClose} />}
        {isMemberUserLogin && <MemberUserLoginsModal isShow={isShowMemberUserGuid} onClose={handleMemberUserModalClose} />}
        {children}
      </main>
      <BottomNavigation />
    </>
  )
}

export default ClientLayout
