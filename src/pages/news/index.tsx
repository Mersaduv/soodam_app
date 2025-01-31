import { ClientLayout } from "@/components/layouts";
import { NextPage } from "next";
import dynamic from "next/dynamic";

const News: NextPage =()=>{
    return(
        <>
        <ClientLayout title="مجله خیر" >
                مجله خبری
        </ClientLayout>
        </>
    )
}
export default dynamic(() => Promise.resolve(News), { ssr: false })