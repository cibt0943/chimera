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
  const autoSave = memoSettings?.autoSave ?? false

  // フォームの指定エレメントへフォーカス
  function setFocusFormElement(selector: string) {
    formRef.current?.querySelector<HTMLElement>(selector)?.focus()
  }

  // キーボード操作
  const modifierKey = userAgent.modifierKey
  const HOTKEYS = {
    MODIFIER_UP: `${modifierKey}+up`,
    MODIFIER_RIGHT: `${modifierKey}+right`,
    MODIFIER_DOWN: `${modifierKey}+down`,
  }

  useHotkeys(
    Object.values(HOTKEYS),
    (_, { hotkey }) => {
      switch (hotkey) {
        case HOTKEYS.MODIFIER_UP:
          setFocusFormElement('input[name="title"]')
          break
        case HOTKEYS.MODIFIER_RIGHT:
          setFocusFormElement('input[name="title"]')
          break
        case HOTKEYS.MODIFIER_DOWN:
          setFocusFormElement('[contenteditable="true"]')
          break
      }
    },
    {
      preventDefault: true, // テキストエリアにフォーカスがある時にalt+sを押すと変なドイツ語がテキストエリアに入力されるのを防ぐ
      enableOnFormTags: true, // テキストエリアにフォーカスがあっても保存できるようにする
      enableOnContentEditable: true, // Lexicalエディタにフォーカスがあっても操作できるようにする
    },
  )

  return (
    <div className="p-4" ref={formRef}>
      <MemoForm
        memo={memo}
        isAutoSave={autoSave}
        redirectUrl={''}
        editorClassName="h-[calc(100svh-233px)]"
      />
    </div>
  )
}
