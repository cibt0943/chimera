// app/types/network-diagrams.ts
import * as zod from 'zod'
import type { Json } from '~/types/database'

export interface NetworkDiagram {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  title: string
  nodes: NonNullable<Json>
  edges: NonNullable<Json>
}

export type NetworkDiagrams = NetworkDiagram[]

export const NetworkDiagramSchema = zod.object({
  title: zod
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'common.validation.required'
          : 'common.validation.invalid',
    })
    .max(255, 'common.validation.max_length_255'),
})

export type NetworkDiagramSchemaType = zod.infer<typeof NetworkDiagramSchema>
