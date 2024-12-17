import { Header, Footer, BottomNavigation, FilterControlsHeader } from '@/components/shared'
import { useDisclosure } from '@/hooks'
import { useState, useEffect } from 'react'
import { Modal } from '../ui'
import Image from 'next/image'
import Link from 'next/link'
import { roles } from '@/utils'
import FirstLoginModal from '../modals/FirstLoginModal'

interface Props {
  title?: string
  children: React.ReactNode
}

const ClientLayout: React.FC<Props> = ({ children, title }) => {
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
      {title ? <FilterControlsHeader title={title} /> : <Header />}

      <main className="h-full bg-[#F6F7FB]">
        {showModal && <FirstLoginModal isShow={isShow} onClose={handleModalClose} />}
        {children}
      </main>
      <BottomNavigation />
    </>
  )
}

export default ClientLayout
