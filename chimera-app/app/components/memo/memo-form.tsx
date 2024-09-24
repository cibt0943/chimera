import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import { getFormProps } from '@conform-to/react'
import { Button } from '~/components/ui/button'
import { MEMO_URL } from '~/constants'
import { cn } from '~/lib/utils'
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
import { useUserAgentAtom } from '~/lib/state'

export interface MemoFormProps {
  memo: Memo | undefined
  fetcher: ReturnType<typeof useFetcher>
  isAutoSave: boolean
  returnUrl: string
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>
  children?: React.ReactNode
}

export function MemoForm({
  memo,
  fetcher,
  isAutoSave,
  returnUrl,
  onSubmit,
  textareaProps = {},
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
    if (memo && isChangedMemo && isAutoSave) {
      saveMemoApi()
    }
    // 以下のdisableを止める方法を検討したい。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoSave])

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
    isAutoSave && saveMemoDebounce()
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

  const { className, ...otherProps } = textareaProps

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
          className={cn(
            'resize-none bg-[#303841] text-white focus-visible:ring-0',
            className,
          )}
          {...otherProps}
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
          isSubmitting={fetcher.state === 'submitting'}
          isAutoSave={isAutoSave}
        />
      </FormFooter>
    </fetcher.Form>
  )
}

export interface SaveButtonProps {
  isChangedMemo: boolean
  isSubmitting: boolean
  isAutoSave: boolean
}

export function SaveButton({
  isChangedMemo,
  isSubmitting,
  isAutoSave,
}: SaveButtonProps) {
  const { t } = useTranslation()

  const caption = isSubmitting
    ? t('common.message.state_saving')
    : !isChangedMemo
      ? t('common.message.state_saved')
      : isAutoSave
        ? t('common.message.state_save_wait')
        : t('common.message.save')

  const isDisabled = isAutoSave || !isChangedMemo

  return (
    <Button type="submit" className="sm:w-32" disabled={isDisabled}>
      {caption}
      {!isAutoSave && <SaveHotkeyIcon />}
    </Button>
  )
}

function SaveHotkeyIcon() {
  const { userAgent } = useUserAgentAtom()

  return (
    <p className="ml-2 text-xs">
      <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border px-1.5">
        <span>{userAgent.modifierKeyIcon}</span>s
      </kbd>
    </p>
  )
}
