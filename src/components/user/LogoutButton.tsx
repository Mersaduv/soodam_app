import { useState } from 'react'
import { BiLogOut } from 'react-icons/bi'
import { useAppDispatch } from '@/hooks'
import { HandleResponse } from '@/components/shared'
import { Button } from '@/components/ui'
import { clearCredentials } from '@/store'
import { useRouter } from 'next/router'
import { LogoutSmIcon } from '@/icons'

export default function LogoutButton({ isProfile }: { isProfile?: boolean }) {
  // ? Assets
  const { replace, query } = useRouter()
  const dispatch = useAppDispatch()

  // Handlers
  const handleLogout = () => {
    dispatch(clearCredentials())
    replace('/')
  }

  return (
    <>
      {isProfile ? (
        <div className='flex items-center gap-2 text-sm text-[#D52133] font-medium cursor-pointer  w-full py-3' onClick={handleLogout}>
          <LogoutSmIcon width="24px" height="24px" /> خروج
        </div>
      ) : (
        <Button className="w-full " onClick={handleLogout}>
          خروج
        </Button>
      )}
    </>
  )
}
