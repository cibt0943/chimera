import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  INSERT_PARAGRAPH_COMMAND,
  type LexicalNode,
} from 'lexical'
import { $isListItemNode } from '@lexical/list'

export function ListCancelPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Backspace' && e.key !== 'Delete') return

      let onEmptyListItem = false
      editor.getEditorState().read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) return

        let current: LexicalNode | null = selection.anchor.getNode()
        while (current !== null) {
          if ($isListItemNode(current)) {
            onEmptyListItem = current.getTextContent() === ''
            break
          }
          current = current.getParent()
        }
      })

      if (onEmptyListItem) {
        e.preventDefault()
        e.stopImmediatePropagation()
        editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined)
      }
    }

    return editor.registerRootListener((rootElement, prevRootElement) => {
      prevRootElement?.removeEventListener('keydown', handleKeyDown, true)
      rootElement?.addEventListener('keydown', handleKeyDown, true)
    })
  }, [editor])

  return null
}
