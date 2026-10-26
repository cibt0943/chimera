import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LuEllipsis, LuPencilLine, LuTrash2 } from 'react-icons/lu'
import { Button } from '~/components/ui/button-base'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { NetworkDiagram } from '~/types/network-diagrams'

interface NetworkDiagramActionMenuProps {
  networkDiagram: NetworkDiagram
  handleDeleteNetworkDiagram: (networkDiagram: NetworkDiagram) => void
}

export function NetworkDiagramActionMenu({
  networkDiagram,
  handleDeleteNetworkDiagram,
}: NetworkDiagramActionMenuProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            onClick={(event) => {
              // Card全体がLinkでラップされているため、トリガー自体の
              // クリックも止めないと、メニューを開く前に親のLinkへ
              // 遷移してしまう。
              event.preventDefault()
              event.stopPropagation()
            }}
          />
        }
      >
        <LuEllipsis />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto">
        <DropdownMenuItem
          onClick={(event) => {
            // Card全体がLinkでラップされているため、
            // デフォルト動作(aタグへの遷移)と伝播の両方を
            // 止めないと親のLinkの遷移も発生してしまう。
            event.preventDefault()
            event.stopPropagation()
            navigate(`${networkDiagram.id}/edit-title`)
          }}
        >
          <LuPencilLine />
          {t('network_diagram.message.change_title')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={(event) => {
            event.preventDefault() // デフォルト動作(aタグへの遷移)をキャンセル
            event.stopPropagation() // 親エレメントのアンカータグのクリックイベントをキャンセル
            handleDeleteNetworkDiagram(networkDiagram)
          }}
        >
          <LuTrash2 />
          {t('common.message.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
