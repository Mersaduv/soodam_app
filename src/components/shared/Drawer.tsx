import React, { Dispatch, SetStateAction } from 'react'
import { clsx } from 'clsx'

const openClassNames: any = {
  right: 'translate-x-0',
  left: 'translate-x-0',
  top: 'translate-y-0',
  bottom: 'translate-y-0',
}

const closeClassNames: any = {
  right: 'translate-x-full',
  left: '-translate-x-full',
  top: '-translate-y-full',
  bottom: 'translate-y-full',
}

const classNames: any = {
  right: 'inset-y-0 right-0',
  left: 'inset-y-0 left-0',
  top: 'inset-x-0 top-0',
  bottom: 'inset-x-0 bottom-0',
}
interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  side: string
  children: React.ReactNode
}
const Drawer = ({ open, setOpen, side = 'right',children }: Props) => {
  return (
    <div
      id={`dialog-${side}`}
      className="relative z-10"
      aria-labelledby="slide-over"
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(!open)}
    >
      <div
        className={clsx(
          'z-[90] fixed inset-0 bg-gray-500 bg-opacity-75 transition-all',
          {
            'opacity-100 duration-500 ease-in-out block z-[90]': open,
          },
          { 'opacity-0 duration-500 ease-in-out hidden': !open }
        )}
      ></div>
      <div className={clsx({ 'fixed inset-0 overflow-hidden z-[90]': open })}>
        <div className="absolute inset-0 overflow-hidden z-[90]">
          <div className={clsx('pointer-events-none fixed max-w-full ', classNames[side])}>
            <div
              className={clsx(
                'pointer-events-auto relative z-[90] w-full h-full transform transition ease-in-out duration-500',
                { [closeClassNames[side]]: !open },
                { [openClassNames[side]]: open }
              )}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
            >
              <div
                className={clsx(
                  ''
                )}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Drawer
