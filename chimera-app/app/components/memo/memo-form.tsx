import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  RiDeleteBinLine,
  RiInboxArchiveLine,
  RiInboxUnarchiveLine,
} from 'react-icons/ri'
import { useHotkeys } from 'react-hotkeys-hook'
import { useForm, getFormProps, getTextareaProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { FormItem, FormMessage, FormDescription } from '~/components/lib/form'
import { useDebounce, useQueue } from '~/lib/utils'
import { Memo, MemoSchema, MemoSchemaType, MemoStatus } from '~/types/memos'
import { MemoRelatedDateTimePicker } from './memo-related-date-time-picker'
import { MemoDeleteConfirmDialog } from './memo-delete-confirm-dialog'
import { useAtomValue } from 'jotai'
import { memoSettingsAtom } from '~/lib/state'

interface MemoFormProps {
  memo: Memo | undefined
}

export function MemoForm({ memo }: MemoFormProps) {
  const { t } = useTranslation()
  const formRef = React.useRef<HTMLFormElement>(null)
  const { enqueue } = useQueue()
  const fetcher = useFetcher({ key: 'memo-form' })

  const memoSettings = useAtomValue(memoSettingsAtom)

  // memoの状態を変更して保存したかどうか
  const [isChangedMemo, setIsChangedMemo] = React.useState(false)

  React.useEffect(() => {
    setIsChangedMemo(false)
  }, [memo?.id])

  React.useEffect(() => {
    // メモが存在し、メモが変更されている場合、自動保存がOFF→ONの切り替え時に自動保存を実行する
    if (memo && isChangedMemo && memoSettings?.auto_save) {
      console.log('auto save')
      saveMemoApi()
    }
    // 以下のdisableを止める方法を検討したい。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoSettings?.auto_save])

  const action = memo ? `/memos/${memo.id}` : `/memos`

  const defaultValue = {
    content:
      memo && memo.title + memo.content !== ''
        ? memo.title.concat('\n', memo.content)
        : '',
    related_date: memo ? memo.related_date : null,
  }

  const [form, fields] = useForm<MemoSchemaType>({
    id: `memo-form${memo ? `-${memo.id}` : ''}`,
    defaultValue: defaultValue,
    constraint: getZodConstraint(MemoSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: MemoSchema })
    },
  })

  // メモの保存API呼び出し
  async function saveMemoApi() {
    // メモが保存されたら、メモが変更されていない状態にする
    setIsChangedMemo(false)
    fetcher.submit(formRef.current, {
      action: action,
      method: 'post',
    })
  }

  // メモの保存APIをdebounce
  const saveMemoDebounce = useDebounce(() => {
    enqueue(() => saveMemoApi())
  }, 1000)

  function setTextAreaFocus() {
    formRef.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus()
  }

  // キーボード操作
  useHotkeys(
    ['alt+s', 'alt+right'],
    (event, handler) => {
      switch (handler.keys?.join('')) {
        case 's':
          saveMemoApi()
          break
        case 'right':
          setTextAreaFocus()
          break
      }
    },
    {
      preventDefault: true, // テキストエリアにフォーカスがある時にalt+sを押すと変なドイツ語がテキストエリアに入力されるのを防ぐ
      enableOnFormTags: true, // テキストエリアにフォーカスがあっても保存できるようにする
    },
  )

  return (
    <div className="m-4">
      <fetcher.Form
        ref={formRef}
        method="post"
        className="space-y-6"
        {...getFormProps(form)}
        action={action}
        onChange={() => {
          setIsChangedMemo(true)
          if (!memoSettings?.auto_save) return
          saveMemoDebounce()
        }}
        onSubmit={(event) => {
          event.preventDefault()
          saveMemoApi()
        }}
      >
        <FormItem>
          <FormDescription>
            {t('memo.message.first_line_is_title')}
          </FormDescription>
          <Textarea
            {...getTextareaProps(fields.content)}
            key={fields.content.key}
            className="h-[calc(100vh_-_155px)] resize-none bg-[#303841] text-white focus-visible:ring-0"
            rows={15}
          />
          <FormMessage message={fields.content.errors} />
        </FormItem>
        <div className="flex items-center justify-between">
          <ActionButtons memo={memo} />
          <div className="flex items-center space-x-6">
            <FormItem>
              <MemoRelatedDateTimePicker
                meta={fields.related_date}
                divProps={{ className: 'w-64' }}
                onChange={() => {
                  setIsChangedMemo(true)
                  if (!memoSettings?.auto_save) return
                  saveMemoDebounce()
                }}
              />
              <FormMessage message={fields.related_date.errors} />
            </FormItem>
            <SaveButton isChangedMemo={isChangedMemo} />
          </div>
        </div>
      </fetcher.Form>
    </div>
  )
}

function ActionButtons({ memo }: { memo: Memo | undefined }) {
  const { t } = useTranslation()
  const fetcher = useFetcher()
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  if (!memo) return <div></div> // memo がない場合はあえてdivタグのみを記載

  const archiveMenu =
    memo.status === MemoStatus.NOMAL
      ? {
          toStatus: MemoStatus.ARCHIVED,
          icon: <RiInboxArchiveLine className="h-4 w-4" />,
          caption: t('memo.message.to_archive'),
        }
      : {
          toStatus: MemoStatus.NOMAL,
          icon: <RiInboxUnarchiveLine className="h-4 w-4" />,
          caption: t('memo.message.un_archive'),
        }

  return (
    <div className="space-x-4">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={(event) => {
                fetcher.submit(
                  { status: archiveMenu.toStatus },
                  {
                    action: `/memos/${memo.id}/status`,
                    method: 'post',
                  },
                )
                event.preventDefault()
              }}
            >
              {archiveMenu.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{archiveMenu.caption}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={(event) => {
                setIsOpenDeleteDialog(true)
                event.preventDefault()
              }}
            >
              <RiDeleteBinLine className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('common.message.delete')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <MemoDeleteConfirmDialog
        memo={memo}
        isOpen={isOpenDeleteDialog}
        setIsOpen={setIsOpenDeleteDialog}
      />
    </div>
  )
}

function SaveButton({ isChangedMemo }: { isChangedMemo: boolean }) {
  const { t } = useTranslation()
  const fetcher = useFetcher({ key: 'memo-form' })
  const memoSettings = useAtomValue(memoSettingsAtom)

  const isDisabled = memoSettings?.auto_save
    ? true
    : isChangedMemo
      ? false
      : true

  let caption
  switch (fetcher.state) {
    case 'submitting':
      caption = t('common.message.state_saving')
      break
    default:
      caption = memoSettings?.auto_save ? (
        isChangedMemo ? (
          t('common.message.state_save_wait')
        ) : (
          t('common.message.state_saved')
        )
      ) : (
        <SaveHotkeyIcon />
      )
      break
  }

  function SaveHotkeyIcon() {
    if (memoSettings?.auto_save) return null

    return (
      <>
        {t('common.message.save')}
        <p className="ml-2 text-xs">
          <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border px-1.5">
            <span>⌥</span>s
          </kbd>
        </p>
      </>
    )
  }

  return (
    <Button type="submit" className="w-32" disabled={isDisabled}>
      {caption}
    </Button>
  )
}
