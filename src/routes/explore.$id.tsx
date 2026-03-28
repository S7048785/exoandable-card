import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/explore/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return null
}
