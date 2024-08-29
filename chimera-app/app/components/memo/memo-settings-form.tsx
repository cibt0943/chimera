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
import { ACCOUNT_URL } from '~/constants'
import { MemoStatus } from '~/types/memos'
import { useAtomValue } from 'jotai'
import { memoSettingsAtom } from '~/lib/state'

export function MemoSettingsForm() {
  const { t } = useTranslation()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="hidden h-8 px-2 lg:flex">
          <RiListSettingsLine className="h-4 w-4 text-primary/80" />
          <span className="sr-only">{t('common.message.settings')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] space-y-4">
        <h4 className="font-medium">{t('common.message.settings')}</h4>
        <ShowArchivedSwith />
        <ShowContentSwith />
        <AutoSaveSwith />
      </PopoverContent>
    </Popover>
  )
}

function ShowArchivedSwith() {
  const { t } = useTranslation()
  const fetcher = useFetcher({ key: 'memo-settings' })
  const memoSettings = useAtomValue(memoSettingsAtom)
  if (!memoSettings) return null

  // 表示するメモのフィルタ
  function updateMemoSettingStatusFilter(statuses: MemoStatus[]) {
    const url = [ACCOUNT_URL, 'memo', 'settings'].join('/')

    fetcher.submit(
      {
        listFilter: {
          statuses,
        },
      },
      {
        action: url,
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
          defaultChecked={memoSettings.listFilter.statuses.includes(
            MemoStatus.ARCHIVED,
          )}
          // checked={memoSettings?.list_filter.statuses.includes(MemoStatus.ARCHIVED)}
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
  const fetcher = useFetcher({ key: 'memo-settings' })
  const memoSettings = useAtomValue(memoSettingsAtom)
  if (!memoSettings) return null

  // 表示するメモのフィルタ
  function updateMemoSettingDisplayContent(isShow: boolean) {
    const url = [ACCOUNT_URL, 'memo', 'settings'].join('/')

    fetcher.submit(
      {
        listDisplay: {
          content: isShow,
        },
      },
      {
        action: url,
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
          defaultChecked={memoSettings.listDisplay.content}
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
  const fetcher = useFetcher({ key: 'memo-settings' })
  const memoSettings = useAtomValue(memoSettingsAtom)
  if (!memoSettings) return null

  // 表示するメモのフィルタ
  function updateMemoSettingAutoSave(isAutoSave: boolean) {
    const url = [ACCOUNT_URL, 'memo', 'settings'].join('/')

    fetcher.submit(
      {
        autoSave: isAutoSave,
      },
      {
        action: url,
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
          defaultChecked={memoSettings.autoSave}
          onCheckedChange={(isChecked) => {
            updateMemoSettingAutoSave(isChecked)
          }}
        />
      </div>
    </div>
  )
}
