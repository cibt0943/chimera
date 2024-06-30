import { Skeleton } from '~/components/ui/skeleton'

export function TodoListSkeleton() {
  return (
    <div className="space-y-6 mt-16">
      <Skeleton className="h-5 w-[800px]" />
      <Skeleton className="h-5 w-[800px]" />
      <Skeleton className="h-5 w-[800px]" />
      <Skeleton className="h-5 w-[800px]" />
      <Skeleton className="h-5 w-[800px]" />
    </div>
  )
}
