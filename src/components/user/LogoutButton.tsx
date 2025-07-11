import { useState } from 'react'
import { BiLogOut } from 'react-icons/bi'
import { useAppDispatch } from '@/hooks'
import { HandleResponse } from '@/components/shared'
import { Button } from '@/components/ui'
import { clearCredentials } from '@/store'
import { useRouter } from 'next/router'
import { LogoutSmIcon } from '@/icons'
import { useLogoutMutation } from '@/services/auth/apiSlice'

export default function LogoutButton({
  isProfile,
  isShowDrawer,
  isShowDropDown,
}: {
  isProfile?: boolean
  isShowDropDown?: boolean
  isShowDrawer?: boolean
}) {
  // ? Assets
  const { push } = useRouter()
  const dispatch = useAppDispatch()
  const [logout] = useLogoutMutation()

  // Handlers
  const handleLogout = async () => {
    try {
      // Call the logout API
      await logout().unwrap()
      
      // Clear all possible storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // Clear Redux state
      dispatch(clearCredentials())
      
      // Force page reload to ensure clean state
      if (typeof window !== 'undefined') {
        // window.location.href = '/'
        push('/')
      } else {
        push('/')
      }
    } catch (error) {
      console.error('Logout failed:', error)
      
      // Even if logout fails, clear local state and redirect
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      dispatch(clearCredentials())
      
      if (typeof window !== 'undefined') {
        // window.location.href = '/'
        push('/')
      } else {
        push('/')
      }
    }
  }

  return (
    <>
      {isProfile ? (
        <div
          className="flex items-center gap-2 text-sm text-[#D52133] font-medium cursor-pointer w-full py-3"
          onClick={handleLogout}
        >
          <LogoutSmIcon width="24px" height="24px" /> خروج
        </div>
      ) : isShowDrawer ? (
        <div className="px-4 mt-5 mb-16">
          <Button
            style={{ background: 'rgba(63, 66, 84, .35)' }}
            className="w-full text-[#b5b5c3] hover:text-white"
            onClick={handleLogout}
          >
            خروج
          </Button>
        </div>
      ) : isShowDropDown ? (
        <Button
          className={!isShowDropDown ? 'bg-white p-0 mr-4' : 'bg-white p-0 flex w-44 pr-4 py-2'}
          onClick={handleLogout}
        >
          <BiLogOut className="w-5 h-5 text-red-500" />
          {isShowDropDown ? (
            <span className="ml-auto mr-2 text-gray-700 text-xs whitespace-nowrap font-normal">
              خروج از حساب کاربری
            </span>
          ) : (
            <span className="ml-auto mr-1 text-gray-700 text-xs xl:text-sm whitespace-nowrap font-semibold">خروج</span>
          )}
        </Button>
      ) : (
        <Button className="w-full" onClick={handleLogout}>
          خروج
        </Button>
      )}
    </>
  )
}
// import { useState } from 'react'
// import { BiLogOut } from 'react-icons/bi'
// import { useAppDispatch } from '@/hooks'
// import { HandleResponse } from '@/components/shared'
// import { Button } from '@/components/ui'
// import { clearCredentials } from '@/store'

// interface Props {
//   isShowDropDown?: boolean
//   isShowDrawer?: boolean
// }

// export default function LogoutButton(prop: Props) {
//   const { isShowDropDown, isShowDrawer } = prop
//   const dispatch = useAppDispatch()

//   // Handlers
//   const handleLogout = () => {
//     dispatch(clearCredentials())
//   }

//   return (
//     <>
//       {isShowDrawer ? (
//         <div className="px-4 mt-5 mb-16">
//           <Button style={{background:"rgba(63, 66, 84, .35)"}} className="w-full text-[#b5b5c3] hover:text-white" onClick={handleLogout}>
//             خروج
//           </Button>
//         </div>
//       ) : (
//         <Button
//           className={!isShowDropDown ? 'bg-white p-0 mr-4' : 'bg-white p-0 flex w-44 pr-4 py-2'}
//           onClick={handleLogout}
//         >
//           <BiLogOut className="w-5 h-5 text-red-500" />
//           {isShowDropDown ? (
//             <span className="ml-auto mr-2 text-gray-700 text-xs whitespace-nowrap font-normal">
//               خروج از حساب کاربری
//             </span>
//           ) : (
//             <span className="ml-auto mr-1 text-gray-700 text-xs xl:text-sm whitespace-nowrap font-semibold">خروج</span>
//           )}
//         </Button>
//       )}
//     </>
//   )
// }
