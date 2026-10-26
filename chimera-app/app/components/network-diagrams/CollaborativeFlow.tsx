// app/components/network-diagrams/CollaborativeFlow.tsx
//
// React Flow + Yjs によるリアルタイム共同編集のネットワーク図(工程表)エディタ。
// - Durable なデータ(nodes / edges)は共有 Y.Doc に保存し、y-websocket の
//   WebsocketProvider 経由で同期する。接続時の認証には Remix の
//   /api/collab-token が発行する短命JWTを使う。
// - Ephemeral なデータ(他ユーザーのカーソル)は Yjs Awareness で同期する。

import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  use,
} from 'react'
import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { LuPlus, LuTrash2 } from 'react-icons/lu'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  NodeResizer,
  NodeToolbar,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeProps,
  type ReactFlowInstance,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { Button } from '~/components/ui/button-base'
import { Textarea } from '~/components/ui/textarea'
import type { Auth0User } from '~/types/accounts'

const COLLAB_SERVER_URL =
  import.meta.env.VITE_COLLAB_WS_URL || 'ws://localhost:1234'

// Remix の /api/collab-token から、このroom用の短命トークンを取得する。
// ブラウザはAuth0の生トークンを持たず、セッションCookieで認証される。
async function fetchCollabToken(roomId: string): Promise<string> {
  const res = await fetch(
    `/api/collab-token?room=${encodeURIComponent(roomId)}`,
    { credentials: 'include' },
  )
  if (!res.ok) throw new Error('Failed to fetch collab token')
  const { token } = (await res.json()) as { token: string }
  return token
}

// 共有ドキュメントに保存するフィールド(React Flow公式のDurable/Ephemeral指針に準拠)。
// dragging / resizing / selected / measured は意図的に含めない。
type DurableNode = Pick<
  Node,
  'id' | 'type' | 'data' | 'position' | 'width' | 'height'
>
type DurableEdge = Pick<
  Edge,
  'id' | 'type' | 'data' | 'source' | 'target' | 'sourceHandle' | 'targetHandle'
>

function toDurableNode(node: Node): DurableNode {
  const { id, type, data, position, width, height } = node
  return { id, type, data, position, width, height }
}

function toDurableEdge(edge: Edge): DurableEdge {
  const { id, type, data, source, target, sourceHandle, targetHandle } = edge
  return { id, type, data, source, target, sourceHandle, targetHandle }
}

interface CursorInfo {
  x: number
  y: number
  name: string
  color: string
}

const randomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`

interface DiagramNodeActions {
  updateLabel: (id: string, label: string) => void
  deleteNode: (id: string) => void
}

const DiagramNodeActionsContext = createContext<DiagramNodeActions | null>(null)
const nodeLabelClassName =
  'nowheel box-border h-full min-h-0 w-full overflow-auto break-all text-left text-xs! leading-normal text-current'

function EditableDiagramNode({ id, data, selected }: NodeProps) {
  const { t } = useTranslation()
  const actions = use(DiagramNodeActionsContext)
  const [isEditing, setIsEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const label = String(data.label ?? '')
  // 入力中の値はローカルで保持する。Yjs経由の再描画で value が差し替わると
  // キャレットが末尾に飛ぶため。
  const [draft, setDraft] = useState(label)

  useEffect(() => {
    if (!isEditing) return
    textareaRef.current?.focus()
  }, [isEditing])

  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        // minWidth={140}
        // minHeight={50}
        lineClassName="border-0"
        handleClassName="h-2 w-2"
      />
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          aria-label={t('network_diagram.message.delete_node')}
          title={t('network_diagram.message.delete_node')}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            actions?.deleteNode(id)
          }}
        >
          <LuTrash2 />
        </Button>
      </NodeToolbar>
      <Handle type="target" position={Position.Left} />
      {isEditing ? (
        <Textarea
          ref={textareaRef}
          aria-label={t('network_diagram.message.node_label')}
          className={`${nodeLabelClassName} block resize-none rounded-none border-0 bg-transparent p-0 shadow-none transition-none outline-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent`}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            actions?.updateLabel(id, event.target.value)
          }}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(event) => event.stopPropagation()}
        />
      ) : (
        <div
          className={nodeLabelClassName}
          onDoubleClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setDraft(label)
            setIsEditing(true)
          }}
        >
          {label}
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </>
  )
}

const nodeTypes = { default: EditableDiagramNode }

export interface CollaborativeFlowProps {
  roomId: string
  user: Pick<Auth0User, 'name'> | undefined
}

export default function CollaborativeFlow({
  roomId,
  user,
}: CollaborativeFlowProps) {
  const { t } = useTranslation()
  const [ready, setReady] = useState(false)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [cursors, setCursors] = useState<Record<number, CursorInfo>>({})
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null)

  const addNodeButtonRef = useRef<HTMLButtonElement>(null)
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const yNodesRef = useRef<Y.Map<DurableNode> | null>(null)
  const yEdgesRef = useRef<Y.Map<DurableEdge> | null>(null)
  const applyingRemoteRef = useRef(false)

  useEffect(() => {
    let disposed = false

    async function connect() {
      const token = await fetchCollabToken(roomId)
      // このawaitの間にStrictModeの二重実行でクリーンアップが先に走っている
      // 可能性があるため、ここでも必ずチェックする。
      if (disposed) return

      const ydoc = new Y.Doc()
      const yNodesMap = ydoc.getMap<DurableNode>('nodes') // id -> node
      const yEdgesMap = ydoc.getMap<DurableEdge>('edges') // id -> edge

      const provider = new WebsocketProvider(COLLAB_SERVER_URL, roomId, ydoc, {
        params: { token },
      })

      // 破棄済みなら、作った接続は使わず後始末だけして終わる。
      if (disposed) {
        provider.destroy()
        ydoc.destroy()
        return
      }

      ydocRef.current = ydoc
      providerRef.current = provider
      yNodesRef.current = yNodesMap
      yEdgesRef.current = yEdgesMap

      // Awareness: ユーザー名とカーソル色を共有する(Y.Docには書き込まない一時データ)。
      provider.awareness.setLocalStateField('user', {
        name: user?.name || 'Anonymous',
        color: randomColor(),
      })

      const syncLocalStateFromYjs = () => {
        applyingRemoteRef.current = true
        // 既存のローカルなノード情報(measured, selected, dragging など
        // React Flow内部が使うフィールド)を保ったまま、Yjs側の最新値
        // (position, data, type など)だけをマージする。配列をまるごと
        // 置き換えると measured が消えて永久に非表示になってしまう。
        setNodes((prevNodes) => {
          const prevById = new Map(prevNodes.map((n) => [n.id, n]))
          return Array.from(yNodesMap.values()).map((durable) => {
            const prev = prevById.get(durable.id)
            return prev ? { ...prev, ...durable } : durable
          })
        })
        setEdges((prevEdges) => {
          const prevById = new Map(prevEdges.map((e) => [e.id, e]))
          return Array.from(yEdgesMap.values()).map((durable) => {
            const prev = prevById.get(durable.id)
            return prev ? { ...prev, ...durable } : durable
          })
        })
        applyingRemoteRef.current = false
      }

      yNodesMap.observe(syncLocalStateFromYjs)
      yEdgesMap.observe(syncLocalStateFromYjs)

      provider.awareness.on('change', () => {
        const states = provider.awareness.getStates()
        const next: Record<number, CursorInfo> = {}
        states.forEach((state, clientId) => {
          if (clientId === provider.awareness.clientID) return
          if (state.cursor && state.user) {
            next[clientId] = { ...state.cursor, ...state.user }
          }
        })
        setCursors(next)
      })

      provider.on('sync', (isSynced: boolean) => {
        if (isSynced && !disposed) setReady(true)
      })
    }

    connect()

    return () => {
      disposed = true
      providerRef.current?.destroy()
      ydocRef.current?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  // React Flow のローカル変更 -> Durable なフィールドを Y.Doc に書き込む。
  const onNodesChange: OnNodesChange = useCallback((changes) => {
    if (applyingRemoteRef.current) return
    setNodes((prevNodes) => {
      const next = applyNodeChanges(changes, prevNodes)
      const yNodes = yNodesRef.current
      if (yNodes) {
        ydocRef.current?.transact(() => {
          for (const change of changes) {
            if (change.type === 'remove') {
              yNodes.delete(change.id)
            } else if ('id' in change) {
              const updated = next.find((n) => n.id === change.id)
              if (updated) yNodes.set(updated.id, toDurableNode(updated))
            }
          }
        })
      }
      return next
    })
  }, [])

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    if (applyingRemoteRef.current) return
    setEdges((prevEdges) => {
      const next = applyEdgeChanges(changes, prevEdges)
      const yEdges = yEdgesRef.current
      if (yEdges) {
        ydocRef.current?.transact(() => {
          for (const change of changes) {
            if (change.type === 'remove') {
              yEdges.delete(change.id)
            } else if ('id' in change) {
              const updated = next.find((e) => e.id === change.id)
              if (updated) yEdges.set(updated.id, toDurableEdge(updated))
            }
          }
        })
      }
      return next
    })
  }, [])

  const onConnect: OnConnect = useCallback((connection) => {
    setEdges((prevEdges) => {
      const next = addEdge(connection, prevEdges)
      const newEdge = next[next.length - 1]
      if (newEdge) yEdgesRef.current?.set(newEdge.id, toDurableEdge(newEdge))
      return next
    })
  }, [])

  // Y.Doc を更新すると observe 経由でローカル state にも反映される。
  const updateNodeLabel = useCallback((id: string, label: string) => {
    const yNodes = yNodesRef.current
    const current = yNodes?.get(id)
    if (!yNodes || !current) return
    yNodes.set(id, { ...current, data: { ...current.data, label } })
  }, [])

  const deleteNode = useCallback(
    (id: string) => {
      const connectedEdgeIds = edges
        .filter((edge) => edge.source === id || edge.target === id)
        .map((edge) => edge.id)

      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id))
      setEdges((prevEdges) =>
        prevEdges.filter((edge) => edge.source !== id && edge.target !== id),
      )
      ydocRef.current?.transact(() => {
        yNodesRef.current?.delete(id)
        connectedEdgeIds.forEach((edgeId) => yEdgesRef.current?.delete(edgeId))
      })
    },
    [edges],
  )

  const nodeActions = useMemo(
    () => ({ updateLabel: updateNodeLabel, deleteNode }),
    [updateNodeLabel, deleteNode],
  )

  // 新規ノードを追加する。id は衝突しにくいようにタイムスタンプ+乱数で生成。
  const addNode = useCallback(() => {
    const buttonBounds = addNodeButtonRef.current?.getBoundingClientRect()
    if (!buttonBounds || !reactFlowInstance) return

    const positionIndex = nodes.length
    const offsetX = (positionIndex % 4) * 24
    const offsetY = (Math.floor(positionIndex / 4) % 4) * 24
    const newNode: Node = {
      id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: 'default',
      data: { label: t('network_diagram.message.new_node') },
      position: reactFlowInstance.screenToFlowPosition({
        x: buttonBounds.left + offsetX,
        y: buttonBounds.bottom + 16 + offsetY,
      }),
    }
    setNodes((prevNodes) => [...prevNodes, newNode])
    yNodesRef.current?.set(newNode.id, toDurableNode(newNode))
  }, [nodes.length, reactFlowInstance, t])

  // 自分のカーソル位置を Awareness(一時データ)としてブロードキャストする。
  const onPaneMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const provider = providerRef.current
    if (!provider) return
    const bounds = event.currentTarget.getBoundingClientRect()
    provider.awareness.setLocalStateField('cursor', {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    })
  }, [])

  const cursorOverlays = useMemo(
    () =>
      Object.entries(cursors).map(([clientId, c]) => (
        <div
          key={clientId}
          className="pointer-events-none absolute z-20 -translate-x-0.5 -translate-y-0.5"
          style={{ left: c.x, top: c.y }}
        >
          <div
            className="size-2.5 rounded-full"
            style={{ background: c.color }}
          />
          <div
            className="text-[11px] whitespace-nowrap"
            style={{ color: c.color }}
          >
            {c.name}
          </div>
        </div>
      )),
    [cursors],
  )

  if (!ready) {
    return (
      <div className="text-muted-foreground p-4 text-sm">connecting...</div>
    )
  }

  return (
    <div className="relative h-full w-full" onMouseMove={onPaneMouseMove}>
      <Button
        ref={addNodeButtonRef}
        size="sm"
        variant="secondary"
        className="absolute top-2.5 left-2.5 z-10"
        onClick={addNode}
        disabled={!reactFlowInstance}
      >
        <LuPlus />
        {t('network_diagram.message.add_node')}
      </Button>
      <DiagramNodeActionsContext value={nodeActions}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </DiagramNodeActionsContext>
      {cursorOverlays}
    </div>
  )
}
