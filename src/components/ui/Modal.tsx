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
    document.body.style.overflow = isShow ? 'hidden' : 'unset'
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
      fixed left-0 right-0 mx-auto w-full lg:max-w-3xl
      transform transition-transform duration-700
      ${isShow ? 'translate-y-0' : 'translate-y-full'}
      `
      : effect === 'ease-out'
      ? `
      fixed left-0 right-0 mx-auto max-w-3xl top-16
      transform transition-all duration-700
      ${isShow ? 'scale-100' : 'scale-50'}
      `
      : effect === 'buttom-to-fit'
      ? `
      fixed left-0 right-0 bottom-0 mx-auto w-full lg:max-w-3xl
      transform transition-transform duration-700 ease-in-out
      ${isShow ? 'translate-y-0' : 'translate-y-full'}
      `
      : ''

  return (
    <div
      className={`
        fixed inset-0 z-[99999] transition-opacity duration-500
        ${isShow ? 'visible opacity-100' : 'invisible opacity-0'}
      `}
      style={{
        WebkitOverflowScrolling: 'touch',
        height: '100%',
      }}
    >
      <div className="fixed inset-0 bg-[#1A1E2580]" onClick={onClose} />
      <div
        className={`${effectClasses} max-h-[90vh] overflow-y-auto`}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
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
        <div className={`flex relative items-center justify-center ${children === undefined && ' py-4'}`}>
          {children}
          <button
            type="button"
            onClick={onClose}
            className="p-0.5 right-0 text-white bg-black absolute border-[1.8px] border-black rounded-full"
          >
            <Close className="" />
          </button>
        </div>
      ) : (
        <div className="flex relative items-center justify-center  pb-2">
          <h2 className="font-medium">{children}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-0.5 left-0 absolute border-[1.8px] border-black rounded-full"
          >
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
