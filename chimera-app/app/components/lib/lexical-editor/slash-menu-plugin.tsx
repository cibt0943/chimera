import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  TextNode,
} from 'lexical'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
} from '@lexical/list'
import {
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  ListTodo,
  Type,
} from 'lucide-react'
import { cn } from '~/lib/utils'

type SlashCommandType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'quote'
  | 'ul'
  | 'ol'
  | 'check'

class SlashMenuOption extends MenuOption {
  label: string
  icon: React.ReactElement
  description: string
  commandType: SlashCommandType

  constructor(
    label: string,
    icon: React.ReactElement,
    description: string,
    commandType: SlashCommandType,
  ) {
    super(label)
    this.label = label
    this.icon = icon
    this.description = description
    this.commandType = commandType
  }
}

const ALL_COMMANDS: SlashMenuOption[] = [
  new SlashMenuOption(
    'テキスト',
    <Type className="h-4 w-4" />,
    '通常のテキスト',
    'paragraph',
  ),
  new SlashMenuOption(
    '見出し1',
    <Heading1 className="h-4 w-4" />,
    '大きな見出し',
    'h1',
  ),
  new SlashMenuOption(
    '見出し2',
    <Heading2 className="h-4 w-4" />,
    '中見出し',
    'h2',
  ),
  new SlashMenuOption(
    '見出し3',
    <Heading3 className="h-4 w-4" />,
    '小見出し',
    'h3',
  ),
  new SlashMenuOption(
    '引用',
    <Quote className="h-4 w-4" />,
    '引用テキスト',
    'quote',
  ),
  new SlashMenuOption(
    '箇条書き',
    <List className="h-4 w-4" />,
    '番号なしリスト',
    'ul',
  ),
  new SlashMenuOption(
    '番号付きリスト',
    <ListOrdered className="h-4 w-4" />,
    '番号付きリスト',
    'ol',
  ),
  new SlashMenuOption(
    'Todoリスト',
    <ListTodo className="h-4 w-4" />,
    'チェックボックス付きリスト',
    'check',
  ),
]

interface SlashMenuItemProps {
  index: number
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
  option: SlashMenuOption
}

function SlashMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: SlashMenuItemProps) {
  return (
    <li
      key={option.key}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={`slash-menu-item-${index}`}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5 text-sm outline-none select-none',
        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent',
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded">
        {option.icon}
      </div>
      <div>
        <div className="leading-none font-medium">{option.label}</div>
        <div className="text-muted-foreground mt-1 text-xs">
          {option.description}
        </div>
      </div>
    </li>
  )
}

export function SlashMenuPlugin() {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState<string | null>(null)

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  })

  const options = useMemo(() => {
    if (!queryString) return ALL_COMMANDS
    return ALL_COMMANDS.filter((option) =>
      option.label.toLowerCase().includes(queryString.toLowerCase()),
    )
  }, [queryString])

  const onSelectOption = useCallback(
    (
      selectedOption: SlashMenuOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
    ) => {
      if (
        selectedOption.commandType === 'ul' ||
        selectedOption.commandType === 'ol' ||
        selectedOption.commandType === 'check'
      ) {
        editor.update(() => {
          nodeToRemove?.remove()
        })
        const command =
          selectedOption.commandType === 'ul'
            ? INSERT_UNORDERED_LIST_COMMAND
            : selectedOption.commandType === 'ol'
              ? INSERT_ORDERED_LIST_COMMAND
              : INSERT_CHECK_LIST_COMMAND
        editor.dispatchCommand(command, undefined)
      } else {
        editor.update(() => {
          nodeToRemove?.remove()
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) return
          switch (selectedOption.commandType) {
            case 'paragraph':
              $setBlocksType(selection, () => $createParagraphNode())
              break
            case 'h1':
            case 'h2':
            case 'h3':
              $setBlocksType(selection, () =>
                $createHeadingNode(
                  selectedOption.commandType as 'h1' | 'h2' | 'h3',
                ),
              )
              break
            case 'quote':
              $setBlocksType(selection, () => $createQuoteNode())
              break
          }
        })
      }
      closeMenu()
    },
    [editor],
  )

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        if (anchorElementRef.current === null || options.length === 0) {
          return null
        }
        return createPortal(
          <div className="bg-popover text-popover-foreground z-50 min-w-[220px] overflow-hidden rounded-md border p-1 shadow-md">
            <ul role="listbox">
              {options.map((option, i) => (
                <SlashMenuItem
                  key={option.key}
                  index={i}
                  isSelected={selectedIndex === i}
                  onClick={() => selectOptionAndCleanUp(option)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  option={option}
                />
              ))}
            </ul>
          </div>,
          anchorElementRef.current,
        )
      }}
    />
  )
}
