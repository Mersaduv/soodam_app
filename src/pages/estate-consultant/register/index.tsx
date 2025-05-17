import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { AdsMIcon, ArrowLeftIcon, FaceScanIcon, PdfDownloadIcon, WalletAndCardIcon } from '@/icons'
import { Button } from '@/components/ui'
import { EstateConsultantRegisterForm, MarketerUserLoginForm } from '@/components/forms'

const EstateConsultantRegister: NextPage = () => {
  // ? Assets
  const { query, events, back, push } = useRouter()

  const handleBack = () => {
    back()
  }

  // ? Render(s)
  return (
    <>
      <EstateConsultantRegisterForm />
    </>
  )
}

export default dynamic(() => Promise.resolve(EstateConsultantRegister), { ssr: false })
