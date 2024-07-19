import * as React from 'react'
import { Form, useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  RiDeleteBinLine,
  RiInboxArchiveLine,
  RiInboxUnarchiveLine,
} from 'react-icons/ri'
import { useForm, getFormProps, getTextareaProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { FormItem, FormMessage, FormDescription } from '~/components/lib/form'
import { Memo, MemoSchema, MemoSchemaType, MemoStatus } from '~/types/memos'
import { MemoRelatedDateTimePicker } from './memo-related-date-time-picker'
import { MemoDeleteConfirmDialog } from './memo-delete-confirm-dialog'

interface MemoFormProps {
  memo: Memo | undefined
}

export function MemoForm({ memo }: MemoFormProps) {
  const { t } = useTranslation()

  const action = memo ? `/memos/${memo.id}` : `/memos`

  const defaultValue = {
    content:
      memo && memo.title + memo.content !== ''
        ? memo.title.concat('\n', memo.content)
        : '',
    related_date: memo ? memo.related_date : null,
  }

  const [form, fields] = useForm<MemoSchemaType>({
    id: `memo-form${memo ? `-${memo.id}` : ''}`,
    defaultValue: defaultValue,
    constraint: getZodConstraint(MemoSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: MemoSchema })
    },
  })

  return (
    <div className="m-4">
      <Form
        method="post"
        className="space-y-6"
        {...getFormProps(form)}
        action={action}
      >
        <FormItem>
          <FormDescription>
            {t('memo.message.first_line_is_title')}
          </FormDescription>
          <Textarea
            {...getTextareaProps(fields.content)}
            key={fields.content.key}
            className="resize-none bg-[#303841] text-white focus-visible:ring-0  h-[calc(100vh_-_155px)]"
            rows={15}
          />
          <FormMessage message={fields.content.errors} />
        </FormItem>
        <div className="flex items-center justify-between">
          <ActionButtons memo={memo} />
          <div className="flex items-center space-x-6">
            <FormItem>
              <MemoRelatedDateTimePicker
                meta={fields.related_date}
                divProps={{ className: 'w-64' }}
              />
              <FormMessage message={fields.related_date.errors} />
            </FormItem>
            <Button type="submit" className="w-32">
              {t('common.message.save')}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  )
}

function ActionButtons({ memo }: { memo: Memo | undefined }) {
  const { t } = useTranslation()
  const fetcher = useFetcher()
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  if (!memo) return <div></div> // memo がない場合はあえてdivタグのみを記載

  const archiveMenu =
    memo.status === MemoStatus.NOMAL
      ? {
          toStatus: MemoStatus.ARCHIVED,
          icon: <RiInboxArchiveLine className="h-4 w-4" />,
          caption: t('memo.message.to_archive'),
        }
      : {
          toStatus: MemoStatus.NOMAL,
          icon: <RiInboxUnarchiveLine className="h-4 w-4" />,
          caption: t('memo.message.un_archive'),
        }

  return (
    <div className="space-x-4">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={(event) => {
                fetcher.submit(
                  { status: archiveMenu.toStatus },
                  {
                    action: `/memos/${memo.id}/status`,
                    method: 'post',
                  },
                )
                event.preventDefault()
              }}
            >
              {archiveMenu.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{archiveMenu.caption}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={(event) => {
                setIsOpenDeleteDialog(true)
                event.preventDefault()
              }}
            >
              <RiDeleteBinLine className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('common.message.delete')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <MemoDeleteConfirmDialog
        memo={memo}
        isOpen={isOpenDeleteDialog}
        setIsOpen={setIsOpenDeleteDialog}
      />
    </div>
  )
}
