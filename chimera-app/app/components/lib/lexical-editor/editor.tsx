import { useState } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
// import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin'
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
  CHECK_LIST,
  type ElementTransformer,
} from '@lexical/markdown'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import {
  $isParagraphNode,
  $isTextNode,
  ParagraphNode,
  type EditorState,
} from 'lexical'
import { cn } from '~/lib/utils'
import { EditorTheme } from './theme'
import { SlashMenuPlugin } from './slash-menu-plugin'
import { FloatingToolbarPlugin } from './floating-toolbar-plugin'
import { ListCancelPlugin } from './list-cancel-plugin'
import './editor.css'

// 空の段落を &nbsp; としてMarkdownに保存・復元するトランスフォーマー
// インポート時は \u200B（ゼロ幅スペース）を挿入して Lexical の空段落クリーンアップを回避する
const EMPTY_LINE_TRANSFORMER: ElementTransformer = {
  dependencies: [ParagraphNode],
  export: (node) => {
    if (!$isParagraphNode(node)) return null
    const size = node.getChildrenSize()
    // 完全に空の段落
    if (size === 0) return '\n&nbsp;\n'
    // \u200B のみを含む段落（Markdown からインポートされた空行）
    if (size === 1) {
      const child = node.getFirstChild()
      if ($isTextNode(child) && child.getTextContent() === '\u200B') {
        return '\n&nbsp;\n'
      }
    }
    return null
  },
  regExp: /^&nbsp;$/,
  replace: (parentNode, children, _match, isImport) => {
    if (isImport) {
      // 空段落を作ると Lexical のクリーンアップで削除されるため、
      // \u200B（ゼロ幅スペース）を挿入して isEmptyParagraph 判定を回避する
      const textNode = children[0]
      if (textNode && $isTextNode(textNode)) {
        textNode.setTextContent('\u200B')
      }
    }
  },
  type: 'element',
}

const ALL_TRANSFORMERS = [EMPTY_LINE_TRANSFORMER, CHECK_LIST, ...TRANSFORMERS]

interface LexicalEditorProps {
  value: string
  onChange?: (value: string) => void
  onBlur?: () => void
  className?: string
}

const EDITOR_NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  CodeNode,
  CodeHighlightNode,
  LinkNode,
]

export function LexicalEditor({
  value,
  onChange,
  onBlur,
  className,
}: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'lexical-editor',
    theme: EditorTheme,
    nodes: EDITOR_NODES,
    editorState: () => {
      $convertFromMarkdownString(value, ALL_TRANSFORMERS)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  }

  // 行のD&Dを実装するための状態とref
  // const menuRef = React.useRef<HTMLDivElement>(null)
  // const targetLineRef = React.useRef<HTMLDivElement>(null)
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null)
  const onRef = (elem: HTMLDivElement) => {
    if (elem !== null) setFloatingAnchorElem(elem)
  }

  function handleChange(editorState: EditorState) {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(ALL_TRANSFORMERS)
      // \u200B が非空行に混入した場合（ユーザーが空行に文字を入力した場合）は除去する
      onChange?.(markdown.replace(/\u200B/g, ''))
    })
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div ref={onRef} className="relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={cn(
                'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 overflow-auto rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3',
                className,
              )}
              onBlur={onBlur}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={ALL_TRANSFORMERS} />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
        <SlashMenuPlugin />
        <ListCancelPlugin />
        {floatingAnchorElem && (
          <FloatingToolbarPlugin anchorElem={floatingAnchorElem} />
        )}
        {/*
          // 行のD&D
          floatingAnchorElem && (
          <DraggableBlockPlugin_EXPERIMENTAL
            anchorElem={floatingAnchorElem}
            menuRef={menuRef}
            targetLineRef={targetLineRef}
            menuComponent={
              <div
                ref={menuRef}
                className="hover:bg-accent text-muted-foreground absolute top-0 left-0 cursor-grab rounded px-1 opacity-0"
              >
                ⠿
              </div>
            }
            targetLineComponent={
              <div
                ref={targetLineRef}
                className="bg-primary pointer-events-none absolute top-0 left-0 h-1 rounded opacity-0"
              />
            }
            isOnMenu={(el) => menuRef.current?.contains(el) ?? false}
          />
        ) */}
      </div>
    </LexicalComposer>
  )
}
