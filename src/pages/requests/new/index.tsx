import { RequestRegistrationForm } from '@/components/forms'
import { ClientLayout } from '@/components/layouts'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const NewRequestPage: NextPage = () => {
  // ? Assets
  const { query } = useRouter()
  return (
    <ClientLayout title={`ثبت درخواست`}>
      <div className="pt-[90px] px-4">
         <RequestRegistrationForm />
      </div>
    </ClientLayout>
  )
}

export default dynamic(() => Promise.resolve(NewRequestPage), { ssr: false })
