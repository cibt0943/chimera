import React, { useState, useEffect, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType, $patchStyleText } from '@lexical/selection'
import {
  $getSelection,
  $isRangeSelection,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
} from 'lexical'

// アイコン
import {
  RotateCcw,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Bold,
  Italic,
  Underline,
  Code,
  Link,
  ChevronDown,
  Plus,
  Palette,
} from 'lucide-react'

const COMMAND_PRIORITY_CRITICAL = 4

// ==========================================
// 1. ツールバーコンポーネント (ToolbarPlugin)
// ==========================================
export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()

  // 各種状態管理
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isCode, setIsCode] = useState(false)

  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [blockType, setBlockType] = useState('paragraph') // paragraph, h1, h2, quote

  // ドロップダウンの開閉
  const [showFontDropdown, setShowFontDropdown] = useState(false)
  const [showBlockDropdown, setShowBlockDropdown] = useState(false)

  // エディタ内の選択範囲が変わったときに、ボタンのアクティブ状態を同期する
  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsCode(selection.hasFormat('code'))
    }
  }, [])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor, updateToolbar])

  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload)
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )
  }, [editor])

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload)
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )
  }, [editor])

  // --- アクション関数群 ---

  // ブロックタイプ (H1/標準テキストなど) の変更
  const formatBlock = (type) => {
    if (blockType !== type) {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          if (type === 'h1') {
            $setBlocksType(selection, () => $createHeadingNode('h1'))
          } else if (type === 'quote') {
            $setBlocksType(selection, () => $createQuoteNode())
          } else {
            $setBlocksType(selection, () => $createParagraphNode())
          }
        }
      })
      setBlockType(type)
    }
    setShowBlockDropdown(false)
  }

  // フォントファミリーの変更
  const formatFontFamily = (family) => {
    setFontFamily(family)
    setShowFontDropdown(false)
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { 'font-family': family })
      }
    })
  }

  // フォントサイズの変更
  const updateFontSize = (newSize) => {
    const validSize = Math.max(8, newSize)
    setFontSize(validSize)
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { 'font-size': `${validSize}px` })
      }
    })
  }

  return (
    <div className="relative flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2 text-sm text-gray-700 select-none">
      {/* 1. 履歴グループ */}
      <div className="flex items-center">
        <button
          disabled={!canUndo}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          className={`rounded p-1.5 transition ${canUndo ? 'text-gray-700 hover:bg-gray-200' : 'cursor-not-allowed text-gray-300'}`}
          title="Undo"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          disabled={!canRedo}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          className={`rounded p-1.5 transition ${canRedo ? 'text-gray-700 hover:bg-gray-200' : 'cursor-not-allowed text-gray-300'}`}
          title="Redo"
        >
          <RotateCw className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-1 h-6 w-px bg-gray-300" />

      {/* 2. ブロックフォーマット (H1 / Normal 等) */}
      <div className="relative">
        <button
          onClick={() => setShowBlockDropdown(!showBlockDropdown)}
          className="flex items-center gap-1 rounded px-2 py-1 font-medium transition hover:bg-gray-200"
        >
          <span className="w-6 text-center uppercase">
            {blockType === 'paragraph' ? 'Normal' : blockType}
          </span>
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </button>
        {showBlockDropdown && (
          <div className="absolute left-0 z-50 mt-1 w-32 rounded border border-gray-200 bg-white py-1 shadow-lg">
            <button
              onClick={() => formatBlock('paragraph')}
              className="w-full px-3 py-1.5 text-left hover:bg-gray-100"
            >
              Normal
            </button>
            <button
              onClick={() => formatBlock('h1')}
              className="w-full px-3 py-1.5 text-left text-lg font-bold hover:bg-gray-100"
            >
              Heading 1
            </button>
            <button
              onClick={() => formatBlock('quote')}
              className="w-full px-3 py-1.5 text-left text-gray-500 italic hover:bg-gray-100"
            >
              Quote
            </button>
          </div>
        )}
      </div>

      <div className="mx-1 h-6 w-px bg-gray-300" />

      {/* 3. フォントファミリー & サイズ */}
      <div className="relative flex items-center gap-0.5">
        <button
          onClick={() => setShowFontDropdown(!showFontDropdown)}
          className="flex items-center gap-1 rounded px-2 py-1 transition hover:bg-gray-200"
        >
          <span className="max-w-[80px] truncate font-medium">
            {fontFamily}
          </span>
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </button>
        {showFontDropdown && (
          <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-44 overflow-y-auto rounded border border-gray-200 bg-white py-1 shadow-lg">
            {[
              'Arial',
              'Courier New',
              'Georgia',
              'Times New Roman',
              'Trebuchet MS',
              'Verdana',
            ].map((font) => (
              <button
                key={font}
                onClick={() => formatFontFamily(font)}
                className="w-full px-3 py-1.5 text-left hover:bg-gray-100"
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => updateFontSize(fontSize - 1)}
          className="rounded px-1.5 py-0.5 text-lg font-medium hover:bg-gray-200"
        >
          -
        </button>
        <span className="w-7 text-center font-mono">{fontSize}</span>
        <button
          onClick={() => updateFontSize(fontSize + 1)}
          className="rounded px-1.5 py-0.5 text-lg font-medium hover:bg-gray-200"
        >
          +
        </button>
      </div>

      <div className="mx-1 h-6 w-px bg-gray-300" />

      {/* 4. インライン装飾 (太字・斜体・下線・コード) */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          className={`rounded p-1.5 transition ${isBold ? 'bg-blue-100 font-bold text-blue-600' : 'hover:bg-gray-200'}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          className={`rounded p-1.5 transition ${isItalic ? 'bg-blue-100 text-blue-600 italic' : 'hover:bg-gray-200'}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
          }
          className={`rounded p-1.5 transition ${isUnderline ? 'bg-blue-100 text-blue-600 underline' : 'hover:bg-gray-200'}`}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
          className={`rounded p-1.5 transition ${isCode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-1 h-6 w-px bg-gray-300" />

      {/* 5. 行揃え (アライメント) */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
          className="rounded p-1.5 hover:bg-gray-200"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
          }
          className="rounded p-1.5 hover:bg-gray-200"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
          }
          className="rounded p-1.5 hover:bg-gray-200"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
          }
          className="rounded p-1.5 hover:bg-gray-200"
        >
          <AlignJustify className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
