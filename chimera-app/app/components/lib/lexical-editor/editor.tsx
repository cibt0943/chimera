import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
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
// import './editor.css'

interface LexicalMdEditorProps {
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

export function LexicalMdEditor({
  value,
  onChange,
  onBlur,
  className,
}: LexicalMdEditorProps) {
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

  function handleChange(editorState: EditorState) {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS)
      onChange?.(markdown)
    })
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={cn('relative overflow-auto rounded-md border', className)}
      >
        {/* <ToolbarPlugin /> */}
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="h-full min-h-40 px-2.5 py-1 outline-none"
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
      </div>
    </LexicalComposer>
  )
}
