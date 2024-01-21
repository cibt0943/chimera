import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export async function loader({ params }: LoaderFunctionArgs) {
  return json({ id: await params.todoid })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: 'Todo ' + data?.id + ' | Kobushi' }]
}

export default function Todo() {
  const { id } = useLoaderData<typeof loader>()

  return <div>id: {id}</div>
}
