import { ClientLayout } from "@/components/layouts"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { GetServerSideProps, NextPage } from 'next'
import Link from 'next/link'
import { Housing } from "@/types"
import { useGetSingleHousingQuery } from "@/services"
// import { getHousingBySlug } from "@/services"

interface Props {
//   housing: Housing
//   similarHousing: {
  housing: any
//     housings: Housing[]
//   }
}


// export const getServerSideProps: GetServerSideProps<Props, { slug: string }> = async ({ params }) => {
  //******* */ When running MSW data mocking on server-side rendering, it causes an error.
//   }

  
  const SingleHousing: NextPage= () => {
    // ? Assets
    const { query } = useRouter();
    const slug = query.slug
    // ? States

    // ? Queries
    const { refetch, data:housingData, isLoading } = useGetSingleHousingQuery ( slug as string)

    // ? Render(s)
    return (
      <>
        <ClientLayout title="جزییات ملک">
          <main className="">
          
          </main>
        </ClientLayout>
      </>
    )
  }
   
  export default SingleHousing