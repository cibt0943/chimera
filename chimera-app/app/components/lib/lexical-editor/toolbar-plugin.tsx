import { useState, useEffect, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from '@lexical/list'
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from 'lexical'
import { mergeRegister } from '@lexical/utils'
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  RotateCcw,
  RotateCw,
} from 'lucide-react'
import { Toggle } from '~/components/ui/toggle'
import { Separator } from '~/components/ui/separator'

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'quote' | 'ul' | 'ol'

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [blockType, setBlockType] = useState<BlockType>('paragraph')

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsCode(selection.hasFormat('code'))

      const anchorNode = selection.anchor.getNode()
      const topLevel = anchorNode.getTopLevelElementOrThrow()

      if ($isHeadingNode(topLevel)) {
        setBlockType(topLevel.getTag() as 'h1' | 'h2' | 'h3')
      } else if ($isListNode(topLevel)) {
        setBlockType(topLevel.getListType() === 'bullet' ? 'ul' : 'ol')
      } else {
        const type = topLevel.getType()
        setBlockType(type === 'quote' ? 'quote' : 'paragraph')
      }
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => updateToolbar())
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    )
  }, [editor, updateToolbar])

  const formatHeading = (tag: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (blockType === tag) {
          $setBlocksType(selection, () => $createParagraphNode())
        } else {
          $setBlocksType(selection, () => $createHeadingNode(tag))
        }
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (blockType === 'quote') {
          $setBlocksType(selection, () => $createParagraphNode())
        } else {
          $setBlocksType(selection, () => $createQuoteNode())
        }
      }
    })
  }

  const formatList = (listType: 'bullet' | 'number') => {
    const isActive =
      listType === 'bullet' ? blockType === 'ul' : blockType === 'ol'
    if (isActive) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(
        listType === 'bullet'
          ? INSERT_UNORDERED_LIST_COMMAND
          : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      )
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b p-1 select-none">
      {/* Undo / Redo */}
      <Toggle
        size="sm"
        disabled={!canUndo}
        pressed={false}
        onPressedChange={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        title="元に戻す"
      >
        <RotateCcw />
      </Toggle>
      <Toggle
        size="sm"
        disabled={!canRedo}
        pressed={false}
        onPressedChange={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        title="やり直す"
      >
        <RotateCw />
      </Toggle>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* 見出し */}
      <Toggle
        size="sm"
        pressed={blockType === 'h1'}
        onPressedChange={() => formatHeading('h1')}
        title="見出し1"
      >
        <Heading1 />
      </Toggle>
      <Toggle
        size="sm"
        pressed={blockType === 'h2'}
        onPressedChange={() => formatHeading('h2')}
        title="見出し2"
      >
        <Heading2 />
      </Toggle>
      <Toggle
        size="sm"
        pressed={blockType === 'h3'}
        onPressedChange={() => formatHeading('h3')}
        title="見出し3"
      >
        <Heading3 />
      </Toggle>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* インライン装飾 */}
      <Toggle
        size="sm"
        pressed={isBold}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        }
        title="太字"
      >
        <Bold />
      </Toggle>
      <Toggle
        size="sm"
        pressed={isItalic}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
        }
        title="斜体"
      >
        <Italic />
      </Toggle>
      <Toggle
        size="sm"
        pressed={isStrikethrough}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }
        title="取り消し線"
      >
        <Strikethrough />
      </Toggle>
      <Toggle
        size="sm"
        pressed={isCode}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
        }
        title="インラインコード"
      >
        <Code />
      </Toggle>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* 引用 */}
      <Toggle
        size="sm"
        pressed={blockType === 'quote'}
        onPressedChange={formatQuote}
        title="引用"
      >
        <Quote />
      </Toggle>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* リスト */}
      <Toggle
        size="sm"
        pressed={blockType === 'ul'}
        onPressedChange={() => formatList('bullet')}
        title="箇条書きリスト"
      >
        <List />
      </Toggle>
      <Toggle
        size="sm"
        pressed={blockType === 'ol'}
        onPressedChange={() => formatList('number')}
        title="番号付きリスト"
      >
        <ListOrdered />
      </Toggle>
    </div>
  )
}
