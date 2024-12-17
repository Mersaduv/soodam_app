import { InlineLoading } from '@/components/ui'

export default function FullScreenLoading() {
  return (
    <div className="mx-auto max-w-max space-y-10 rounded-lg bg-red-100/90 p-8 text-center ">
      <InlineLoading />
    </div>
  )
}
