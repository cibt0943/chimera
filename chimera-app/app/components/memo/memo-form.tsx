import * as React from 'react'
import { useFetcher } from 'react-router'
import { ClientOnly } from 'remix-utils/client-only'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import { getFormProps } from '@conform-to/react'
import { Button } from '~/components/ui/button'
import { MEMO_URL } from '~/constants'
import { cn } from '~/lib/utils'
import { useDebounce, useApiQueue } from '~/lib/hooks'
import {
  FormItemGroup,
  FormItem,
  FormMessage,
  FormDescription,
  FormFooter,
} from '~/components/lib/form'
import { TextareaConform } from '~/components/lib/conform/textarea'
import { DateTimePickerConform } from '~/components/lib/conform/date-time-picker'
import { DummyDateTimePicker } from '~/components/lib/date-time-picker'
import { Memo } from '~/types/memos'
import { MemoActionButton } from './memo-action-button'
import { useMemoConform } from './memo-conform'
import { useUserAgentAtom } from '~/lib/global-state'

const LazyMDEditor = React.lazy(() => import('@uiw/react-md-editor'))

export interface MemoFormProps {
  memo: Memo | undefined
  isAutoSave: boolean
  redirectUrl: string
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>
}

export function MemoForm({
  memo,
  isAutoSave,
  redirectUrl,
  textareaProps = {},
}: MemoFormProps) {
  const { t } = useTranslation()
  const userAgent = useUserAgentAtom()
  const formRef = React.useRef<HTMLFormElement>(null)
  const { enqueue } = useApiQueue()
  // memoの状態を変更して保存したかどうか
  const [isChangedMemo, setIsChangedMemo] = React.useState(false)
  const fetcher = useFetcher()

  // メモの保存API呼び出し
  async function saveMemoApi() {
    fetcher.submit(formRef.current)
    setIsChangedMemo(false)
  }

  // メモの保存APIをdebounce
  const saveMemoDebounce = useDebounce(() => {
    enqueue(() => saveMemoApi())
  }, 1000)

  // memo が切り替わったときに isChangedMemo をリセットする
  const [prevMemoId, setPrevMemoId] = React.useState(memo?.id)
  if (prevMemoId !== memo?.id) {
    setPrevMemoId(memo?.id)
    setIsChangedMemo(false)
  }

  React.useEffect(() => {
    // isAutoSave が OFF→ON に切り替わった時点で未保存の変更があれば自動保存を実行する。
    // memo / isChangedMemo は切り替わった瞬間の値を参照したいため、依存配列から意図的に除外している。
    if (memo && isChangedMemo && isAutoSave) {
      saveMemoApi()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoSave])

  // メモ情報が更新されていたら保存する
  function handleChangeMemo() {
    setIsChangedMemo(true)
    if (isAutoSave) saveMemoDebounce()
  }

  // キーボード操作
  useHotkeys(
    [`${userAgent.modifierKey}+s`],
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

  const { form, fields } = useMemoConform({ memo })
  const [memoContent, setMemoContent] = React.useState(
    () => (fields.content.initialValue as string | undefined) ?? '',
  )
  React.useEffect(() => {
    const initialValue = (fields.content.initialValue as string | undefined) ?? ''
    setMemoContent(initialValue)
  }, [fields.content.initialValue])

  const action = memo ? `${MEMO_URL}/${memo.id}` : MEMO_URL

  const { className, ...otherProps } = textareaProps

  const textareaFallback = (
    <TextareaConform
      meta={fields.content}
      key={fields.content.key}
      className={cn('resize-none bg-[#303841] text-white', className)}
      {...otherProps}
    />
  )

  return (
    <fetcher.Form
      method="post"
      {...getFormProps(form)}
      action={action}
      onChange={handleChangeMemo}
      ref={formRef}
      onSubmit={() => {
        setIsChangedMemo(false)
      }}
    >
      <FormItemGroup>
        <FormItem>
          <FormDescription>
            {t('memo.message.first_line_is_title')}
          </FormDescription>
          <ClientOnly fallback={textareaFallback}>
            {() => (
              <div data-color-mode="dark">
                <React.Suspense fallback={textareaFallback}>
                  <LazyMDEditor
                      key={fields.content.key}
                      value={memoContent}
                      preview="edit"
                      visibleDragbar={false}
                      onChange={(value) => {
                        setMemoContent(value ?? '')
                        handleChangeMemo()
                      }}
                      textareaProps={{
                        className: cn(
                          'resize-none bg-[#303841] text-white',
                          className,
                        ),
                      }}
                  />
                  <textarea
                    aria-hidden="true"
                    className="hidden"
                    name={fields.content.name}
                    value={memoContent}
                    readOnly
                  />
                </React.Suspense>
              </div>
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
        <FormFooter className="sm:justify-between">
          {memo ? (
            <MemoActionButton memo={memo} redirectUrl={redirectUrl} />
          ) : (
            <div>&nbsp;</div>
          )}
          <SaveButton
            isChangedMemo={isChangedMemo}
            isSubmitting={fetcher.state === 'submitting'}
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
  const userAgent = useUserAgentAtom()

  return (
    <p className="text-xs">
      <kbd className="inline-flex h-5 items-center gap-1 rounded border px-1.5 select-none">
        <span>{userAgent.modifierKeyIcon}</span>s
      </kbd>
    </p>
  )
}
