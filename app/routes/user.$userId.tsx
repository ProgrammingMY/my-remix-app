import { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react'

export async function loader({ params } : LoaderFunctionArgs) {
  return { data: params.userId }
}

export default function user() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      {data.data}
    </div>
  )
}
