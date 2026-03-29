import * as React from 'react'
import { LuEqual } from 'react-icons/lu'
import { flexRender, Row } from '@tanstack/react-table'
import { useSortable } from '@dnd-kit/react/sortable'
import { Button } from '~/components/ui/button'
import { TableCell, TableRow } from '~/components/ui/table'
import { ViewTodo } from '~/types/view-todos'
import { TodoType } from '~/types/todos'

function renderDraggableTaskRow(params: {
  row: Row<ViewTodo>
  ref: React.Ref<HTMLTableRowElement>
  style: React.CSSProperties
  handleRef: React.RefCallback<Element> | null
  isSelected: boolean
}) {
  const { row, ref, style, handleRef, isSelected } = params

  return (
    <TableRow
      id={`row-${row.id}`}
      ref={ref}
      tabIndex={0}
      className="bg-white outline-hidden"
      style={{ ...style }}
      onFocus={() => row.toggleSelected(true)}
      data-state={isSelected && 'selected'}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {cell.column.id === 'dragHandle' ? (
            <Button
              variant="ghost"
              ref={handleRef ?? undefined}
              size="icon"
              className={'cursor-grab touch-none select-none'}
            >
              <LuEqual />
            </Button>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      ))}
    </TableRow>
  )
}

function renderDraggableBarRow(params: {
  row: Row<ViewTodo>
  ref: React.Ref<HTMLTableRowElement>
  style: React.CSSProperties
  handleRef: React.RefCallback<Element> | null
  isSelected: boolean
}) {
  const { row, ref, style, handleRef, isSelected } = params

  const cells = row.getVisibleCells()
  const firstCell = cells[0]
  const lastCell = cells[cells.length - 1]
  const middleColSpan = cells.length - 2

  const viewTodo = row.original
  const colorStyle: React.CSSProperties = {
    ...(viewTodo.bgColor && { backgroundColor: viewTodo.bgColor }),
    ...(viewTodo.textColor && { color: viewTodo.textColor }),
  }

  return (
    <TableRow
      id={`row-${row.id}`}
      ref={ref}
      tabIndex={0}
      className="bg-white outline-hidden"
      style={{ ...style, ...colorStyle }}
      onFocus={() => row.toggleSelected(true)}
      data-state={isSelected && 'selected'}
    >
      <TableCell key={firstCell.id} className="py-1">
        <Button
          variant="ghost"
          ref={handleRef ?? undefined}
          size="icon"
          className={'h-6 cursor-grab touch-none select-none'}
        >
          <LuEqual />
        </Button>
      </TableCell>
      <TableCell key={cells[1].id} colSpan={middleColSpan} className="py-1">
        {flexRender(cells[1].column.columnDef.cell, cells[1].getContext())}
      </TableCell>
      <TableCell key={lastCell.id} className="py-1">
        {flexRender(lastCell.column.columnDef.cell, lastCell.getContext())}
      </TableCell>
    </TableRow>
  )
}

// D&D用の行コンポーネント
export const DraggableRow = React.memo(
  function DraggableRow({
    row,
    index,
    disabled,
    isSelected,
  }: {
    row: Row<ViewTodo>
    index: number
    disabled: boolean
    isSelected: boolean
  }) {
    const { ref, handleRef, isDragging } = useSortable({
      id: row.id,
      index,
      disabled,
    })

    const style: React.CSSProperties = isDragging
      ? {
          backdropFilter: 'blur(5px)',
          boxShadow:
            'inset 0 0 1px rgba(0,0,0,0.5), -1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)',
        }
      : {}

    return row.original.type === TodoType.TASK
      ? renderDraggableTaskRow({
          row,
          ref,
          style,
          handleRef,
          isSelected,
        })
      : renderDraggableBarRow({
          row,
          ref,
          style,
          handleRef,
          isSelected,
        })
  },
  (prev, next) =>
    prev.row.original === next.row.original &&
    prev.isSelected === next.isSelected &&
    prev.index === next.index &&
    prev.disabled === next.disabled,
)
