import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import { useForm, getFormProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import { MEMO_URL } from '~/constants'
import { FormItem, FormMessage, FormDescription } from '~/components/lib/form'
import { TextareaConform } from '~/components/lib/conform/textarea'
import { DateTimePickerConform } from '~/components/lib/conform/date-time-picker'
import { useDebounce, useQueue } from '~/lib/utils'
import { Memo, MemoSchema, MemoSchemaType } from '~/types/memos'
import { MemoActionButton } from '~/components/memo/memo-action-button'
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
    if (memo && isChangedMemo && memoSettings?.autoSave) {
      saveMemoApi()
    }
    // 以下のdisableを止める方法を検討したい。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoSettings?.autoSave])

  const action = memo ? [MEMO_URL, memo.id].join('/') : MEMO_URL
  const formId = memo ? `memo-form-${memo.id}` : 'memo-form-new'
  const defaultValue = {
    content:
      memo && memo.title + memo.content !== ''
        ? memo.title.concat('\n', memo.content)
        : '',
    relatedDate: memo ? memo.relatedDate : null,
    relatedDateAllDay: memo ? memo.relatedDateAllDay : true,
  }

  const [form, fields] = useForm<MemoSchemaType>({
    id: formId,
    defaultValue: defaultValue,
    constraint: getZodConstraint(MemoSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: MemoSchema })
    },
    shouldRevalidate: 'onInput',
    onSubmit: (event) => {
      event.preventDefault()
      saveMemoApi()
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

  return (
    <div className="m-4">
      <fetcher.Form
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
            className="h-[calc(100vh_-_155px)] resize-none bg-[#303841] text-white focus-visible:ring-0"
          />
          <FormMessage message={fields.content.errors} />
        </FormItem>
        <div className="flex items-center justify-between">
          {memo?.id ? <MemoActionButton memo={memo} /> : <div>&nbsp;</div>}
          <div className="flex items-center space-x-6">
            <FormItem>
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
              <FormMessage message={fields.relatedDate.errors} />
            </FormItem>
            <SaveButton isChangedMemo={isChangedMemo} />
          </div>
        </div>
      </fetcher.Form>
    </div>
  )
}

function SaveButton({ isChangedMemo }: { isChangedMemo: boolean }) {
  const { t } = useTranslation()
  const fetcher = useFetcher({ key: 'memo-form' })
  const memoSettings = useAtomValue(memoSettingsAtom)

  const isDisabled = memoSettings?.autoSave
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
      caption = memoSettings?.autoSave ? (
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
    if (memoSettings?.autoSave) return null

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
