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
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.position = ''
      document.body.style.width = ''
    }

    return () => {
      document.body.style.position = ''
      document.body.style.width = ''
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

  const effectClasses =
    effect === 'bottom-to-top'
      ? `
  ${isShow ? 'translate-y-0' : 'translate-y-full lg:translate-y-60'} w-full h-fit lg:max-w-3xl 
   fixed transition-transform duration-700 left-0 right-0 mx-auto my-auto`
      : effect === 'ease-out'
      ? `
  ${
    isShow ? 'translate-y-24 scale-100' : 'translate-y-40 scale-50'
  } max-w-3xl 
   fixed transition-all duration-700 left-0 right-0 mx-auto`
      : effect === 'buttom-to-fit'
      ? `
  ${isShow ? 'translate-y-0' : 'translate-y-full'} w-full h-fit lg:max-w-3xl 
   fixed transition-transform duration-700 left-0 right-0 mx-auto bottom-0`
      : ''

  return (
    <div
      className={`${
        isShow ? 'visible opacity-100' : 'invisible opacity-0'
      } fixed inset-0 z-[99999] transition-all duration-500`}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="fixed inset-0 bg-[#1A1E2580]" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`${effectClasses} z-10`}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<ContentProps>, {
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
