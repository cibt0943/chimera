import { useFetcher } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LuSettings } from 'react-icons/lu'
import { Button } from '~/components/ui/button-base'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { ACCOUNT_URL } from '~/constants'
import { MemoStatus } from '~/types/memos'
import { useMemoSettingsAtom } from '~/lib/global-state'

export function MemoSettingsForm() {
  const { t } = useTranslation()

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="icon" />}>
        <LuSettings />
        <span className="sr-only">{t('common.message.settings')}</span>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] space-y-4">
        <h4 className="font-medium">{t('common.message.settings')}</h4>
        <ShowArchivedSwith />
        <AutoSaveSwith />
      </PopoverContent>
    </Popover>
  )
}

function ShowArchivedSwith() {
  const { t } = useTranslation()
  const fetcher = useFetcher()
  const memoSettings = useMemoSettingsAtom()
  if (!memoSettings) return null

  // 表示するメモのフィルタ
  function updateMemoSettingStatusFilter(statuses: MemoStatus[]) {
    fetcher.submit(
      { listFilter: { statuses } },
      {
        action: `${ACCOUNT_URL}/memo/settings`,
        method: 'post',
        encType: 'application/json',
      },
    )
  }

  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs">
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

function AutoSaveSwith() {
  const { t } = useTranslation()
  const fetcher = useFetcher()
  const memoSettings = useMemoSettingsAtom()
  if (!memoSettings) return null

  // 表示するメモのフィルタ
  function updateMemoSettingAutoSave(isAutoSave: boolean) {
    fetcher.submit(
      { autoSave: isAutoSave },
      {
        action: `${ACCOUNT_URL}/memo/settings`,
        method: 'post',
        encType: 'application/json',
      },
    )
  }

  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs">
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
