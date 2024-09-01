import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import { getFormProps } from '@conform-to/react'
import { Button } from '~/components/ui/button'
import { MEMO_URL } from '~/constants'
import { useDebounce, useApiQueue } from '~/lib/hooks'
import {
  FormItem,
  FormMessage,
  FormDescription,
  FormFooter,
} from '~/components/lib/form'
import { TextareaConform } from '~/components/lib/conform/textarea'
import { DateTimePickerConform } from '~/components/lib/conform/date-time-picker'
import { DummyDateTimePicker } from '~/components/lib/date-time-picker'
import { Memo } from '~/types/memos'
import { useMemoConform } from './memo-conform'

export interface MemoFormProps {
  memo: Memo | undefined
  fetcher: ReturnType<typeof useFetcher>
  autoSave: boolean
  returnUrl: string
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  children?: React.ReactNode
}

export function MemoForm({
  memo,
  fetcher,
  autoSave,
  returnUrl,
  onSubmit,
  children,
}: MemoFormProps) {
  const { t } = useTranslation()
  const formRef = React.useRef<HTMLFormElement>(null)
  const { enqueue } = useApiQueue()
  // memoの状態を変更して保存したかどうか
  const [isChangedMemo, setIsChangedMemo] = React.useState(false)

  React.useEffect(() => {
    setIsChangedMemo(false)
  }, [memo?.id])

  React.useEffect(() => {
    // メモが存在し、メモが変更されている場合、自動保存がOFF→ONの切り替え時に自動保存を実行する
    if (memo && isChangedMemo && autoSave) {
      saveMemoApi()
    }
    // 以下のdisableを止める方法を検討したい。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSave])

  // メモの保存API呼び出し
  async function saveMemoApi() {
    fetcher.submit(formRef.current)
    // メモが保存されたら、メモが変更されていない状態にする
    setIsChangedMemo(false)
  }

  // メモの保存APIをdebounce
  const saveMemoDebounce = useDebounce(() => {
    enqueue(() => saveMemoApi())
  }, 1000)

  // メモ情報が更新されていた保存する
  function handleChangeMemo() {
    setIsChangedMemo(true)
    autoSave && saveMemoDebounce()
  }

  // キーボード操作
  useHotkeys(
    ['alt+s'],
    (event, handler) => {
      switch (handler.keys?.join('')) {
        case 's':
          saveMemoApi()
          break
      }
    },
    {
      preventDefault: true, // テキストエリアにフォーカスがある時にalt+sを押すと変なドイツ語がテキストエリアに入力されるのを防ぐ
      enableOnFormTags: true, // テキストエリアにフォーカスがあっても保存できるようにする
    },
  )

  const { form, fields } = useMemoConform({
    memo,
    onSubmit: (event) => {
      setIsChangedMemo(false)
      onSubmit && onSubmit(event)
    },
  })

  const action = memo ? [MEMO_URL, memo.id].join('/') : MEMO_URL

  return (
    <fetcher.Form
      method="post"
      className="space-y-6"
      {...getFormProps(form)}
      action={action}
      onChange={handleChangeMemo}
      ref={formRef}
    >
      <FormItem>
        <FormDescription>
          {t('memo.message.first_line_is_title')}
        </FormDescription>
        <TextareaConform
          meta={fields.content}
          key={fields.content.key}
          className="h-[calc(100dvh_-_360px)] resize-none bg-[#303841] text-white focus-visible:ring-0"
        />
        <FormMessage message={fields.content.errors} />
      </FormItem>
      <FormItem>
        <ClientOnly
          fallback={
            <DummyDateTimePicker
              placeholder={t('memo.model.related_date')}
              className="w-52"
            />
          }
        >
          {() => (
            <DateTimePickerConform
              dateMeta={fields.relatedDate}
              allDayMeta={fields.relatedDateAllDay}
              defaultAllDay={true}
              includeAllDayComponent={true}
              onChangeData={handleChangeMemo}
              onChangeAllDay={handleChangeMemo}
              placeholder={t('memo.model.related_date')}
              className="w-52"
            />
          )}
        </ClientOnly>
        <FormMessage message={fields.relatedDate.errors} />
      </FormItem>
      {/* 戻り先を切り替えるための値 */}
      <input type="hidden" name="returnUrl" value={returnUrl} />
      <FormFooter className="sm:justify-between">
        {children || <div>&nbsp;</div>}
        <SaveButton
          isChangedMemo={isChangedMemo}
          fetcher={fetcher}
          autoSave={autoSave}
        />
      </FormFooter>
    </fetcher.Form>
  )
}

interface SaveButtonProps {
  isChangedMemo: boolean
  fetcher: ReturnType<typeof useFetcher>
  autoSave: boolean
}

function SaveButton({ isChangedMemo, fetcher, autoSave }: SaveButtonProps) {
  const { t } = useTranslation()

  const caption =
    fetcher.state === 'submitting'
      ? t('common.message.state_saving')
      : !isChangedMemo
        ? t('common.message.state_saved')
        : autoSave
          ? t('common.message.state_save_wait')
          : t('common.message.save')

  const isDisabled = autoSave || !isChangedMemo

  return (
    <Button type="submit" className="sm:w-32" disabled={isDisabled}>
      {caption}
      {!autoSave && <SaveHotkeyIcon />}
    </Button>
  )
}

function SaveHotkeyIcon() {
  return (
    <p className="ml-2 text-xs">
      <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border px-1.5">
        <span>⌥</span>s
      </kbd>
    </p>
  )
}
