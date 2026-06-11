import * as React from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
// 行のD&Dを実装するために必要なプラグイン
// import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin'
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import type { EditorState } from 'lexical'
import { cn } from '~/lib/utils'
// import { ToolbarPlugin } from './toolbar-plugin'
import { EditorTheme } from './theme'
import { SlashMenuPlugin } from './slash-menu-plugin'
import { FloatingToolbarPlugin } from './floating-toolbar-plugin'
// import './editor.css'

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
    namespace: 'MemoEditor',
    theme: EditorTheme,
    nodes: EDITOR_NODES,
    editorState: () => {
      $convertFromMarkdownString(value, TRANSFORMERS)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  }

  // 行のD&Dを実装するための状態とref
  // const menuRef = React.useRef<HTMLDivElement>(null)
  // const targetLineRef = React.useRef<HTMLDivElement>(null)
  const [floatingAnchorElem, setFloatingAnchorElem] =
    React.useState<HTMLDivElement | null>(null)
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  function handleChange(editorState: EditorState) {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS)
      onChange?.(markdown)
    })
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div ref={onRef} className="relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={cn(
                'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3',
                className,
              )}
              onBlur={onBlur}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
        <SlashMenuPlugin />
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
