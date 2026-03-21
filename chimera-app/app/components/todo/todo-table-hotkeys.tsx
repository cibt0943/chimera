import { useHotkeys } from 'react-hotkeys-hook'
import { TaskStatus } from '~/types/tasks'

export function useTodoTableScopedHotkeys(params: {
  modifierKey: string
  enabled: boolean
  showSelectedTodoEdit: () => void
  changeSelectedTodoOneStep: (isUp: boolean) => void
  moveSelectedTodoOneStep: (isUp: boolean) => void
  updateSelectedTodoStatus: (status: TaskStatus) => void
  deleteSelectedTodo: () => void
}) {
  const {
    modifierKey,
    enabled,
    showSelectedTodoEdit,
    changeSelectedTodoOneStep,
    moveSelectedTodoOneStep,
    updateSelectedTodoStatus,
    deleteSelectedTodo,
  } = params

  const HOTKEYS = {
    ENTER: 'enter',
    UP: 'up',
    DOWN: 'down',
    MODIFIER_UP: `${modifierKey}+up`,
    MODIFIER_DOWN: `${modifierKey}+down`,
    MODIFIER_1: `${modifierKey}+1`,
    MODIFIER_2: `${modifierKey}+2`,
    MODIFIER_3: `${modifierKey}+3`,
    MODIFIER_4: `${modifierKey}+4`,
    MODIFIER_DELETE: `${modifierKey}+delete`,
    MODIFIER_BACKSPACE: `${modifierKey}+backspace`,
  }

  useHotkeys(
    Object.values(HOTKEYS),
    (_, { hotkey }) => {
      switch (hotkey) {
        case HOTKEYS.ENTER:
          showSelectedTodoEdit()
          break
        case HOTKEYS.UP:
          changeSelectedTodoOneStep(true)
          break
        case HOTKEYS.MODIFIER_UP:
          moveSelectedTodoOneStep(true)
          break
        case HOTKEYS.DOWN:
          changeSelectedTodoOneStep(false)
          break
        case HOTKEYS.MODIFIER_DOWN:
          moveSelectedTodoOneStep(false)
          break
        case HOTKEYS.MODIFIER_1:
          updateSelectedTodoStatus(TaskStatus.NEW)
          break
        case HOTKEYS.MODIFIER_2:
          updateSelectedTodoStatus(TaskStatus.DOING)
          break
        case HOTKEYS.MODIFIER_3:
          updateSelectedTodoStatus(TaskStatus.DONE)
          break
        case HOTKEYS.MODIFIER_4:
          updateSelectedTodoStatus(TaskStatus.PENDING)
          break
        case HOTKEYS.MODIFIER_DELETE:
        case HOTKEYS.MODIFIER_BACKSPACE:
          deleteSelectedTodo()
          break
      }
    },
    {
      preventDefault: true,
      ignoreEventWhen: (e) => {
        const target = e.target as HTMLElement
        return !['tr', 'body'].includes(target.tagName.toLowerCase())
      },
      enabled,
    },
  )
}

export function useTodoTableGlobalHotkeys(params: {
  modifierKey: string
  enabled: boolean
  openAddTaskDialog: () => void
  changeSelectedTodoOneStep: (isUp: boolean) => void
}) {
  const { modifierKey, enabled, openAddTaskDialog, changeSelectedTodoOneStep } =
    params

  useHotkeys(
    [`${modifierKey}+n`, `${modifierKey}+left`, `${modifierKey}+right`],
    (_, handler) => {
      switch (handler.keys?.join('')) {
        case 'n':
          openAddTaskDialog()
          break
        case 'left': {
          changeSelectedTodoOneStep(true)
          break
        }
        case 'right': {
          changeSelectedTodoOneStep(false)
          break
        }
      }
    },
    { enabled },
  )
}
