import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import { getFormProps } from '@conform-to/react'
import { Button } from '~/components/ui/button'
import { MEMO_URL } from '~/constants'
import {
  FormItem,
  FormMessage,
  FormDescription,
  FormFooter,
} from '~/components/lib/form'
import { TextareaConform } from '~/components/lib/conform/textarea'
import { DateTimePickerConform } from '~/components/lib/conform/date-time-picker'
import { DummyDateTimePicker } from '~/components/lib/date-time-picker'
import { useDebounce, useApiQueue } from '~/lib/hooks'
import { Memo } from '~/types/memos'
import { useMemoConform } from './memo-conform'
import { MemoActionButton } from './memo-action-button'
import { useAtomValue } from 'jotai'
import { memoSettingsAtom } from '~/lib/state'

interface MemoFormViewProps {
  memo: Memo | undefined
}

export function MemoFormView({ memo }: MemoFormViewProps) {
  const { t } = useTranslation()
  const formRef = React.useRef<HTMLFormElement>(null)
  const { enqueue } = useApiQueue()
  const memoFormFetcher = useFetcher({ key: 'memo-form' })

  const memoSettings = useAtomValue(memoSettingsAtom)
  // memoの状態を変更して保存したかどうか
  const [isChangedMemo, setIsChangedMemo] = React.useState(false)

  React.useEffect(() => {
    setIsChangedMemo(false)
  }, [memo?.id])

  React.useEffect(() => {
    // メモが存在し、メモが変更されている場合、自動保存がOFF→ONの切り替え時に自動保存を実行する
    if (memo && isChangedMemo && memoSettings?.autoSave) {
      saveMemoApi()
    }
    // 以下のdisableを止める方法を検討したい。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoSettings?.autoSave])

  // メモの保存API呼び出し
  async function saveMemoApi() {
    // メモが保存されたら、メモが変更されていない状態にする
    setIsChangedMemo(false)
    memoFormFetcher.submit(formRef.current)
  }

  // メモの保存APIをdebounce
  const saveMemoDebounce = useDebounce(() => {
    enqueue(() => saveMemoApi())
  }, 1000)

  // メモ情報が更新されていた保存する
  function handleChangeMemo() {
    setIsChangedMemo(true)
    if (!memoSettings?.autoSave) return
    saveMemoDebounce()
  }

  // テキストエリアにフォーカス
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

  const { form, fields } = useMemoConform({ memo, onSubmit: saveMemoApi })
  const action = memo ? [MEMO_URL, memo.id].join('/') : MEMO_URL

  return (
    <div className="m-4">
      <memoFormFetcher.Form
        ref={formRef}
        method="post"
        className="space-y-6"
        {...getFormProps(form)}
        action={action}
        onChange={handleChangeMemo}
      >
        <FormItem>
          <FormDescription>
            {t('memo.message.first_line_is_title')}
          </FormDescription>
          <TextareaConform
            meta={fields.content}
            key={fields.content.key}
            className="h-[calc(100dvh_-_256px)] resize-none bg-[#303841] text-white focus-visible:ring-0 xl:h-[calc(100dvh_-_216px)]"
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
        <input type="hidden" name="returnUrl" value={action} />
        <FormFooter className="sm:justify-between">
          {memo ? (
            <MemoActionButton
              memo={memo}
              onDeleteSubmit={(event) => {
                event.stopPropagation()
              }}
            />
          ) : (
            <div>&nbsp;</div>
          )}
          <SaveButton isChangedMemo={isChangedMemo} />
        </FormFooter>
      </memoFormFetcher.Form>
    </div>
  )
}

function SaveButton({ isChangedMemo }: { isChangedMemo: boolean }) {
  const { t } = useTranslation()
  const memoFormFetcher = useFetcher({ key: 'memo-form' })
  const memoSettings = useAtomValue(memoSettingsAtom)
  if (!memoSettings) return null

  const caption =
    memoFormFetcher.state === 'submitting'
      ? t('common.message.state_saving')
      : !isChangedMemo
        ? t('common.message.state_saved')
        : memoSettings.autoSave
          ? t('common.message.state_save_wait')
          : t('common.message.save')

  const isDisabled = memoSettings.autoSave || !isChangedMemo

  return (
    <Button type="submit" className="sm:w-32" disabled={isDisabled}>
      {caption}
      {!memoSettings.autoSave && <SaveHotkeyIcon />}
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
