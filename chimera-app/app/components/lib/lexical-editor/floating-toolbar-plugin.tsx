import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react'
import { createPortal } from 'react-dom'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  type LexicalEditor,
} from 'lexical'
import { Bold, Italic, Strikethrough, Code } from 'lucide-react'
import { Toggle } from '~/components/ui/toggle'
import { Separator } from '~/components/ui/separator'

interface FloatingFormatToolbarProps {
  editor: LexicalEditor
  anchorElem: HTMLElement
  isBold: boolean
  isItalic: boolean
  isStrikethrough: boolean
  isCode: boolean
}

function FloatingFormatToolbar({
  editor,
  anchorElem,
  isBold,
  isItalic,
  isStrikethrough,
  isCode,
}: FloatingFormatToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
      return

    const rangeRect = selection.getRangeAt(0).getBoundingClientRect()
    const anchorRect = anchorElem.getBoundingClientRect()

    const top = rangeRect.top - anchorRect.top - toolbar.offsetHeight - 8
    const left =
      rangeRect.left -
      anchorRect.left +
      rangeRect.width / 2 -
      toolbar.offsetWidth / 2

    toolbar.style.top = `${Math.max(4, top)}px`
    toolbar.style.left = `${Math.max(4, left)}px`
    toolbar.style.opacity = '1'
  })

  return createPortal(
    <div
      ref={toolbarRef}
      onMouseDown={(e) => e.preventDefault()}
      className="bg-background absolute z-10 flex items-center gap-0.5 rounded-md border p-1 opacity-0 shadow-md"
    >
      <Toggle
        size="sm"
        pressed={isBold}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        }
        title="太字"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={isItalic}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
        }
        title="斜体"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={isStrikethrough}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }
        title="取り消し線"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="mx-0.5 h-4" />
      <Toggle
        size="sm"
        pressed={isCode}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
        }
        title="インラインコード"
      >
        <Code className="h-4 w-4" />
      </Toggle>
    </div>,
    anchorElem,
  )
}

export function FloatingToolbarPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement
}) {
  const [editor] = useLexicalComposerContext()
  const [isTextSelected, setIsTextSelected] = useState(false)
  const [formatState, setFormatState] = useState({
    isBold: false,
    isItalic: false,
    isStrikethrough: false,
    isCode: false,
  })

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if (
      $isRangeSelection(selection) &&
      !selection.isCollapsed() &&
      selection.getTextContent() !== ''
    ) {
      setIsTextSelected(true)
      setFormatState({
        isBold: selection.hasFormat('bold'),
        isItalic: selection.hasFormat('italic'),
        isStrikethrough: selection.hasFormat('strikethrough'),
        isCode: selection.hasFormat('code'),
      })
    } else {
      setIsTextSelected(false)
    }
  }, [])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => updateToolbar())
    })
  }, [editor, updateToolbar])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar()
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, updateToolbar])

  if (!isTextSelected) return null

  return (
    <FloatingFormatToolbar
      editor={editor}
      anchorElem={anchorElem}
      {...formatState}
    />
  )
}
