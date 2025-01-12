import React, { useEffect } from 'react'
import { Close } from '@/icons'

interface ModalProps {
  isShow: boolean
  onClose: () => void
  effect: 'bottom-to-top' | 'ease-out' | 'buttom-to-fit'
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = (props) => {
  const { isShow, onClose, effect, children } = props

  useEffect(() => {
    if (isShow) {
      // Fix for iOS Safari to prevent modal from getting stuck
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      // Store current scroll position
      const scrollY = window.scrollY
      document.body.style.top = `-${scrollY}px`
    } else {
      // Restore scroll position when modal closes
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }, [isShow])

  useEffect(() => {
    const closeModalOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isShow) {
      document.addEventListener('keydown', closeModalOnEscape)
    }

    return () => {
      document.removeEventListener('keydown', closeModalOnEscape)
    }
  }, [isShow, onClose])

  const effectClasses = effect === 'buttom-to-fit' 
    ? `
      ${isShow ? 'translate-y-0' : 'translate-y-full'}
      fixed bottom-0 left-0 right-0 w-full h-fit lg:max-w-3xl mx-auto 
      transform transition-transform duration-300 ease-in-out
      z-[999999] will-change-transform
    `
    : effect === 'bottom-to-top'
    ? `
      ${isShow ? 'top-0' : '-bottom-full lg:top-60'}
      fixed w-full h-fit lg:max-w-3xl mx-auto left-0 right-0
      transition-all duration-300 ease-in-out
    `
    : `
      ${isShow ? 'top-24 scale-100' : 'top-40 scale-50'}
      fixed max-w-3xl mx-auto left-0 right-0
      transform transition-all duration-300 ease-in-out
    `

  return (
    <div
      className={`
        fixed inset-0 z-[99999]
        transition-opacity duration-300 ease-in-out
        ${isShow ? 'visible opacity-100' : 'invisible opacity-0'}
      `}
    >
      <div 
        className="h-screen w-screen bg-[#1A1E2580] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={effectClasses}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, {
                onClose,
              })
            : child
        )}
      </div>
    </div>
  )
}

interface ContentProps {
  onClose: () => void
  children: React.ReactNode
  className?: string
}
const Content: React.FC<ContentProps> = (props) => {
  // ? Props
  const { onClose, children, ...restProps } = props

  // ? Render(s)
  return (
    <div {...restProps}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<ContentProps>, {
              onClose,
            })
          : child
      )}
    </div>
  )
}

interface HeaderProps {
  onClose: () => void
  right?: boolean
  children?: React.ReactNode
}

const Header: React.FC<HeaderProps> = (props) => {
  // ? Props
  const { onClose, children, right } = props

  // ? Render(s)
  return (
    <>
      {right ? (
        <div className="flex relative items-center justify-center  py-4">
          <button type='button' onClick={onClose} className="p-0.5 right-0 text-white bg-black absolute border-[1.8px] border-black rounded-full">
            <Close className="" />
          </button>
        </div>
      ) : (
        <div className="flex relative items-center justify-center  pb-2">
          <h2 className="font-medium">{children}</h2>
          <button type='button' onClick={onClose} className="p-0.5 left-0 absolute border-[1.8px] border-black rounded-full">
            <Close className="" />
          </button>
        </div>
      )}
    </>
  )
}

interface BodyProps {
  children: React.ReactNode
}

const Body: React.FC<BodyProps> = ({ children }) => {
  return <>{children}</>
}

const _default = Object.assign(Modal, {
  Modal,
  Content,
  Header,
  Body,
})

export default _default
