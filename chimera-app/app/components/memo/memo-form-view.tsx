import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { useHotkeys } from 'react-hotkeys-hook'
import { MEMO_URL } from '~/constants'
import { Memo } from '~/types/memos'
import { MemoForm } from './memo-form'
import { MemoActionButton } from './memo-action-button'
import { useAtomValue } from 'jotai'
import { useUserAgentAtom, memoSettingsAtom } from '~/lib/state'

interface MemoFormViewProps {
  memo: Memo | undefined
  returnUrl: string
}

export function MemoFormView({ memo, returnUrl }: MemoFormViewProps) {
  const { userAgent } = useUserAgentAtom()
  const formRef = React.useRef<HTMLDivElement>(null)
  const memoFormFetcher = useFetcher()
  const memoSettings = useAtomValue(memoSettingsAtom)
  const autoSave = memoSettings?.autoSave || false

  // テキストエリアにフォーカス
  function setTextAreaFocus() {
    formRef.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus()
  }

  // キーボード操作
  useHotkeys(
    [`${userAgent.modifierKey}+right`],
    (event, handler) => {
      switch (handler.keys?.join('')) {
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
    <div className="p-4" ref={formRef}>
      <MemoForm
        memo={memo}
        fetcher={memoFormFetcher}
        isAutoSave={autoSave}
        returnUrl={returnUrl}
        textareaProps={{
          className: 'h-[calc(100dvh_-_256px)] xl:h-[calc(100dvh_-_216px)]',
        }}
      >
        {memo && (
          <MemoActionButton
            memo={memo}
            deleteReturnUrl={MEMO_URL}
            onDeleteSubmit={(event) => event.stopPropagation()}
          />
        )}
      </MemoForm>
    </div>
  )
}
