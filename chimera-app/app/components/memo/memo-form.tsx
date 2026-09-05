import * as React from 'react'
import { useFetcher } from 'react-router'
import { ClientOnly } from 'remix-utils/client-only'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import { getFormProps, useInputControl } from '@conform-to/react'
import { Button } from '~/components/ui/button-base'
import { MEMO_URL } from '~/constants'
import { useDebounce } from '~/lib/hooks'
import { cn } from '~/lib/utils'
import { useUserAgentAtom } from '~/lib/global-state'
import { Memo } from '~/types/memos'
import {
  FormItemGroup,
  FormItem,
  FormMessage,
  FormFooter,
} from '~/components/lib/form'
import { DateTimePickerConform } from '~/components/lib/conform/date-time-picker'
import { InputConform } from '~/components/lib/conform/input'
import { DummyDateTimePicker } from '~/components/lib/date-time-picker'
import { LexicalEditor } from '~/components/lib/lexical-editor/editor'
import { MemoActionButton } from './memo-action-button'
import { useMemoConform } from './memo-conform'

export interface MemoFormProps {
  memo: Memo | undefined
  isAutoSave: boolean
  redirectUrl: string
  editorClassName?: string
}

export function MemoForm({
  memo,
  isAutoSave,
  redirectUrl,
  editorClassName,
}: MemoFormProps) {
  const { t } = useTranslation()
  const userAgent = useUserAgentAtom()
  const formRef = React.useRef<HTMLFormElement>(null)
  // memoの状態を変更して保存したかどうか
  const [isChangedMemo, setIsChangedMemo] = React.useState(false)
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state === 'submitting'

  // メモの保存API呼び出し
  const saveMemoApi = React.useCallback(() => {
    if (isSubmitting) return
    formRef.current?.requestSubmit()
  }, [isSubmitting])

  const handleAutoSaveToggle = React.useEffectEvent(() => {
    // 自動保存のON/OFFを切り替えた瞬間に、未保存の変更を即時保存する
    if (!memo || !isChangedMemo || !isAutoSave) return
    saveMemoApi()
  })

  // メモの保存APIをdebounce
  const saveMemoDebounce = useDebounce(() => {
    saveMemoApi()
  }, 1000)

  // memo が切り替わったときに isChangedMemo をリセットする
  React.useEffect(() => {
    setIsChangedMemo(false)
  }, [memo?.id])

  React.useEffect(() => {
    handleAutoSaveToggle()
  }, [isAutoSave])

  // メモ情報が更新されていたら保存する
  function handleChangeMemo() {
    setIsChangedMemo(true)
    if (isAutoSave) {
      saveMemoDebounce()
    }
  }

  // キーボード操作
  useHotkeys(
    [`${userAgent.modifierKey}+s`],
    (_event, handler) => {
      switch (handler.keys?.join('')) {
        case 's':
          saveMemoApi()
          break
      }
    },
    {
      preventDefault: true, // テキストエリアにフォーカスがある時にalt+sを押すと変なドイツ語がテキストエリアに入力されるのを防ぐ
      enableOnFormTags: true, // テキストエリアにフォーカスがあっても保存できるようにする
      enableOnContentEditable: true, // Lexicalエディタにフォーカスがあっても保存できるようにする
    },
  )

  const { form, fields } = useMemoConform({ memo })
  const contentControl = useInputControl(fields.content)
  const formProps = getFormProps(form)

  const action = memo ? `${MEMO_URL}/${memo.id}` : MEMO_URL

  return (
    <fetcher.Form
      method="post"
      {...formProps}
      action={action}
      onChange={handleChangeMemo}
      ref={formRef}
      onSubmit={(event) => {
        formProps.onSubmit(event)
        if (event.defaultPrevented) {
          return
        }
        setIsChangedMemo(false)
      }}
    >
      <FormItemGroup>
        <FormItem>
          <ClientOnly fallback={null}>
            {() => (
              <InputConform
                key={fields.title.key}
                meta={fields.title}
                type="text"
                placeholder={t('memo.message.un_titled')}
                className="hover:border-input h-12 border-transparent text-3xl! font-bold"
              />
            )}
          </ClientOnly>
          <FormMessage message={fields.title.errors} />
        </FormItem>
        <FormItem>
          <ClientOnly fallback={null}>
            {() => (
              <LexicalEditor
                key={fields.content.key}
                value={fields.content.defaultValue ?? ''}
                onChange={(value) => {
                  contentControl.change(value)
                  handleChangeMemo()
                }}
                onBlur={contentControl.blur}
                className={cn(
                  'hover:border-input border-transparent',
                  editorClassName,
                )}
              />
            )}
          </ClientOnly>
          <FormMessage message={fields.content.errors} />
        </FormItem>
        <FormItem>
          <ClientOnly
            fallback={
              <DummyDateTimePicker placeholder={t('memo.model.related_date')} />
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
              />
            )}
          </ClientOnly>
          <FormMessage message={fields.relatedDate.errors} />
        </FormItem>
        {/* 戻り先を切り替えるための値 */}
        <input type="hidden" name="redirectUrl" value={redirectUrl} />
        <FormFooter className="rounded-bl-none sm:justify-between">
          {memo ? (
            <MemoActionButton memo={memo} redirectUrl={redirectUrl} />
          ) : (
            <div></div>
          )}
          <SaveButton
            isChangedMemo={isChangedMemo}
            isSubmitting={isSubmitting}
            isAutoSave={isAutoSave}
          />
        </FormFooter>
      </FormItemGroup>
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

  let caption: string
  if (isSubmitting) {
    caption = t('common.message.state_saving')
  } else if (!isChangedMemo) {
    caption = t('common.message.state_saved')
  } else if (isAutoSave) {
    caption = t('common.message.state_save_wait')
  } else {
    caption = t('common.message.save')
  }

  const isDisabled = isAutoSave || !isChangedMemo

  return (
    <Button type="submit" className="sm:w-32" disabled={isDisabled}>
      {caption}
      {!isAutoSave && <SaveHotkeyIcon />}
    </Button>
  )
}

function SaveHotkeyIcon() {
  const userAgent = useUserAgentAtom()

  return (
    <p className="text-xs">
      <kbd className="inline-flex h-5 items-center gap-1 rounded border px-1.5 select-none">
        <span>{userAgent.modifierKeyIcon}</span>s
      </kbd>
    </p>
  )
}
