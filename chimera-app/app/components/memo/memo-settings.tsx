import { useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { RiListSettingsLine } from 'react-icons/ri'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { MemoStatus } from '~/types/memos'
import { useAtomValue } from 'jotai'
import { memoSettingsAtom } from '~/lib/state'

export function MemoSettings() {
  const { t } = useTranslation()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="px-2 hidden h-8 lg:flex">
          <RiListSettingsLine className="h-4 w-4 text-primary/80" />
          <span className="sr-only">{t('memo_settings.title')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] space-y-4">
        <h4 className="font-medium">{t('memo_settings.title')}</h4>
        <ShowArchivedSwith />
        <ShowContentSwith />
        <AutoSaveSwith />
      </PopoverContent>
    </Popover>
  )
}

function ShowArchivedSwith() {
  const { t } = useTranslation()
  const fetcher = useFetcher()
  const memoSettings = useAtomValue(memoSettingsAtom)
  if (!memoSettings) return null

  // 表示するメモのフィルタ
  function updateMemoSettingStatusFilter(statuses: MemoStatus[]) {
    fetcher.submit(
      {
        list_filter: {
          statuses,
        },
      },
      {
        action: `/account/memo/settings`,
        method: 'post',
        encType: 'application/json',
      },
    )
  }

  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
      <div>
        <Label htmlFor="show-archived">
          {t('memo_settings.message.list_show_archived')}
        </Label>
      </div>
      <div>
        <Switch
          id="show-archived"
          name="show-archived"
          defaultChecked={memoSettings.list_filter.statuses.includes(1)}
          // checked={memoSettings?.list_filter.statuses.includes(1)}
          onCheckedChange={(isChecked) => {
            const statuses = isChecked
              ? [MemoStatus.NOMAL, MemoStatus.ARCHIVED]
              : [MemoStatus.NOMAL]
            updateMemoSettingStatusFilter(statuses)
          }}
        />
      </div>
    </div>
  )
}

function ShowContentSwith() {
  const { t } = useTranslation()
  const fetcher = useFetcher()
  const memoSettings = useAtomValue(memoSettingsAtom)
  if (!memoSettings) return null

  // 表示するメモのフィルタ
  function updateMemoSettingDisplayContent(isShow: boolean) {
    fetcher.submit(
      {
        list_display: {
          content: isShow,
        },
      },
      {
        action: `/account/memo/settings`,
        method: 'post',
        encType: 'application/json',
      },
    )
  }

  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
      <div>
        <Label htmlFor="show-content">
          {t('memo_settings.message.list_show_content')}
        </Label>
      </div>
      <div>
        <Switch
          id="show-content"
          name="show-content"
          defaultChecked={memoSettings.list_display.content}
          onCheckedChange={(isChecked) => {
            updateMemoSettingDisplayContent(isChecked)
          }}
        />
      </div>
    </div>
  )
}

function AutoSaveSwith() {
  const { t } = useTranslation()
  const fetcher = useFetcher()
  const memoSettings = useAtomValue(memoSettingsAtom)
  if (!memoSettings) return null

  // 表示するメモのフィルタ
  function updateMemoSettingAutoSave(isAutoSave: boolean) {
    fetcher.submit(
      {
        list_display: {
          isAutoSave: isAutoSave,
        },
      },
      {
        action: `/account/memo/settings`,
        method: 'post',
        encType: 'application/json',
      },
    )
  }

  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
      <div>
        <Label htmlFor="auto-save">
          {t('memo_settings.message.auto_save')}
        </Label>
      </div>
      <div>
        <Switch
          id="auto-save"
          name="auto-save"
          defaultChecked={memoSettings.auto_save}
          onCheckedChange={(isChecked) => {
            updateMemoSettingAutoSave(isChecked)
          }}
        />
      </div>
    </div>
  )
}
