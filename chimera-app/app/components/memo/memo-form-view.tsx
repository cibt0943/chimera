import * as React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Memo } from '~/types/memos'
import { MemoForm } from './memo-form'
import { useUserAgentAtom, useMemoSettingsAtom } from '~/lib/global-state'

interface MemoFormViewProps {
  memo: Memo | undefined
}

export function MemoFormView({ memo }: MemoFormViewProps) {
  const userAgent = useUserAgentAtom()
  const formRef = React.useRef<HTMLDivElement>(null)
  const memoSettings = useMemoSettingsAtom()
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
        isAutoSave={autoSave}
        returnUrl={''}
        textareaProps={{
          className: 'h-[calc(100svh_-_216px)]',
        }}
      />
    </div>
  )
}
