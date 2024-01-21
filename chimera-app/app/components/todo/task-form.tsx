import * as React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { RxCalendar } from 'react-icons/rx'
import { format } from 'date-fns'

import { cn } from '~/lib/utils'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Calendar } from '~/components/ui/calendar'
import { ja } from 'date-fns/locale'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'

// import { addTask } from '@/lib/actions/task'
import { TaskSchemaType } from '~/types/tasks'

export function TaskForm({
  children,
  form,
}: {
  children: React.ReactNode
  form: UseFormReturn<TaskSchemaType>
}) {
  async function onSubmit(values: TaskSchemaType) {
    // await addTask(values)
    return {}
  }

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                タイトル<span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="memo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メモ</FormLabel>
              <FormControl>
                <Textarea placeholder="" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>期限</FormLabel>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'yyyy/MM/dd HH:mm')
                      ) : (
                        <span></span>
                      )}
                      <RxCalendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? field.value : undefined}
                    onSelect={(e) => {
                      field.onChange(e)
                      setIsCalendarOpen(false)
                    }}
                    defaultMonth={field.value ? field.value : undefined}
                    // initialFocus
                    locale={ja} // ここでlocaleを渡す
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                {field.value
                  ? 'クリアする際は設定している日付を再度クリックします'
                  : ''}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  )
}
