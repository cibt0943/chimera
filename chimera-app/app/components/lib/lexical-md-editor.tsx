import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
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

const EDITOR_THEME = {
  heading: {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-bold',
    h4: 'text-lg font-bold',
    h5: 'text-base font-bold',
    h6: 'text-sm font-bold',
  },
  list: {
    ul: 'list-disc pl-6',
    ol: 'list-decimal pl-6',
    listitem: 'mb-0.5',
    nested: {
      listitem: 'list-none',
    },
  },
  quote: 'border-l-4 border-muted-foreground pl-4 italic text-muted-foreground',
  code: 'block font-mono bg-muted rounded p-2 text-sm my-1',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
    code: 'font-mono bg-muted rounded px-1 text-sm',
  },
  link: 'text-primary underline',
}

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
    theme: EDITOR_THEME,
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
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
      </div>
    </LexicalComposer>
  )
}
