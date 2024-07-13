import { MemoStatus } from '~/types/memos'

export function getSearchParams(request: Request): string {
  const url = new URL(request.url)
  return url.searchParams.toString()
}

export function getStatusFromParams(request: Request): MemoStatus | null {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  return searchParams.get('status') as MemoStatus | null
}

export function getStatusFilterFromParams(request: Request): MemoStatus[] {
  const status = getStatusFromParams(request)
  return status == MemoStatus.ARCHIVED
    ? [MemoStatus.NOMAL, MemoStatus.ARCHIVED]
    : [MemoStatus.NOMAL]
}
