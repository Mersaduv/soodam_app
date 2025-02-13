import { ClientLayout } from '@/components/layouts'
import { Button } from '@/components/ui'
import { CircleMdIcon } from '@/icons'
import { NextPage } from 'next'
import { useRouter } from 'next/router'

const Unauthorize: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()

  const role = localStorage.getItem('role') ? localStorage.getItem('role')! : null
  return (
    <>
      <ClientLayout title="اشتراک">
        <main className="pt-[90px] relative">
          <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3 ">
            <div className="flex p-4 gap-2">
              <div className="w-[16px] pt-1">
                <CircleMdIcon width="16px" height="14px" />
              </div>
              <div className="text-[#1A1E25] text-[13px] font-normal">
                برای دسترسی به شماره آگهی ها و آدرس و شماره تماس نیاز به{' '}
                <span className="text-[#D52133] underline font-normal">خرید اشتراک</span> دارید
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <img className="w-[170px]" src="/static/34432g.png" alt="" />
            </div>

            <div className="mx-4 mt-16 mb-4">
              <Button
                onClick={() =>
                  push(
                    `${
                      role == null
                        ? '/authentication/login?role=memberUser'
                        : role === 'user'
                        ? '/authentication/login?role=memberUser'
                        : '/subscription'
                    }`
                  )
                }
                className="w-full rounded-[10px] font-bold text-sm"
              >
                خرید اشتراک
              </Button>
            </div>
          </div>
        </main>
      </ClientLayout>
    </>
  )
}

export default Unauthorize
