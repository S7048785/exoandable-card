import ExpandableCardDemo from '#/components/expandable-card-demo-grid'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <ExpandableCardDemo />
    </div>
  )
}
