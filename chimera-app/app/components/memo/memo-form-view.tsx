import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { useHotkeys } from 'react-hotkeys-hook'
import { MEMO_URL } from '~/constants'
import { Memo } from '~/types/memos'
import { MemoForm } from './memo-form'
import { MemoActionButton } from './memo-action-button'
import { useAtomValue } from 'jotai'
import { memoSettingsAtom } from '~/lib/state'

interface MemoFormViewProps {
  memo: Memo | undefined
}

export function MemoFormView({ memo }: MemoFormViewProps) {
  const formRef = React.useRef<HTMLDivElement>(null)
  const memoFormFetcher = useFetcher()
  const memoSettings = useAtomValue(memoSettingsAtom)

  // テキストエリアにフォーカス
  function setTextAreaFocus() {
    formRef.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus()
  }

  // キーボード操作
  useHotkeys(
    ['alt+right'],
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

  const returnUrl = memo ? [MEMO_URL, memo.id].join('/') : MEMO_URL

  return (
    <div className="m-4" ref={formRef}>
      <MemoForm
        memo={memo}
        fetcher={memoFormFetcher}
        autoSave={memoSettings?.autoSave || false}
        returnUrl={returnUrl}
      >
        {memo && <MemoActionButton memo={memo} returnUrl={MEMO_URL} />}
      </MemoForm>
    </div>
  )
}
