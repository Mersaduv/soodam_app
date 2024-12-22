import { FieldError } from 'react-hook-form'

import { Transition } from '@headlessui/react'
import { Close, Exclamation } from '@/icons'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { SerializedError } from '@reduxjs/toolkit'
import { useEffect, useState, useRef } from 'react'

interface Props {
  errors?: FieldError | undefined
  errorVerification?: any | undefined
  adForm?:boolean
}

const DisplayError: React.FC<Props> = ({ errors,adForm, errorVerification }) => {
  const [errorsData, setErrorData] = useState<any | undefined>()
  const [isVisible, setIsVisible] = useState(false)
  const prevErrorsRef = useRef(errors || errorVerification)

  useEffect(() => {
    const hasErrorMessage = errors?.message || errorVerification?.data?.message;
    if (hasErrorMessage && errors !== prevErrorsRef.current) {
      setErrorData(errors);
      setIsVisible(true);
    } else if (!hasErrorMessage) {
      setIsVisible(false);
    }
    prevErrorsRef.current = errors;
  }, [errors]);

  useEffect(() => {
    const hasErrorMessage = errors?.message || errorVerification?.data?.message;
    if (hasErrorMessage && errorVerification !== prevErrorsRef.current) {
      setErrorData(errorVerification);
      setIsVisible(true);
    } else if (!hasErrorMessage) {
      setIsVisible(false);
    }
    prevErrorsRef.current = errorVerification;
  }, [errorVerification]);

  const handleInVisible = () => {
    setErrorData(undefined)
    setIsVisible(false)
  }
  return (
    <div className={`${adForm ? "": "min-h-[29px]"}`}>
      {errorsData && (
        <Transition
          show={isVisible}
          enter="transition-opacity duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="mt-1.5 flex items-center justify-between rounded-md bg-[#FFF3F7] px-3 py-2 text-sm">
            <div className="flex items-center gap-x-2">
              <span dir='rtl' className="text-[#D52133] font-normal text-xs">
                {errors?.message || errorVerification?.data?.message || ''}
              </span>
            </div>
            <button
              onClick={handleInVisible}
              className="text-[#5A5A5A] border-[#5A5A5A] border -mt-2 ml-2 -mr-2 rounded-full"
            >
              <Close className="h-3 w-3" />
            </button>
          </div>
        </Transition>
      )}
    </div>
  )
}

export default DisplayError
