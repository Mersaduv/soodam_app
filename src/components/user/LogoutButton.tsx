import { useState } from 'react'
import { BiLogOut } from 'react-icons/bi'
import { useAppDispatch } from '@/hooks'
import { HandleResponse } from '@/components/shared'
import { Button } from '@/components/ui'
import { clearCredentials } from '@/store'
import { useRouter } from 'next/router'

export default function LogoutButton() {
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
      <Button className="w-full " onClick={handleLogout}>
        خروج
      </Button>
    </>
  )
}
